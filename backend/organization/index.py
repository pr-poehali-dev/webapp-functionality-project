'''
Business: Organization management API - companies and departments CRUD
Args: event with httpMethod, body, headers, path; context with request_id
Returns: HTTP response with companies/departments data
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def get_user_by_session(session_token: str):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT u.id, u.username
        FROM users u
        INNER JOIN user_sessions s ON s.user_id = u.id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    ''', (session_token,))
    
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    return dict(user) if user else None

def has_permission(user_id: int, permission_code: str) -> bool:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT COUNT(*) as count
        FROM users u
        INNER JOIN role_permissions rp ON rp.role_id = u.role_id
        INNER JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = %s AND p.code = %s
    ''', (user_id, permission_code))
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    return result['count'] > 0

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    headers = event.get('headers', {})
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    session_token = headers.get('X-Session-Token', headers.get('x-session-token', ''))
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    user = get_user_by_session(session_token)
    
    if not user:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Invalid session'}),
            'isBase64Encoded': False
        }
    
    try:
        # For GET requests, read entity_type from query params, for POST/PUT from body
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            entity_type = query_params.get('entity_type', 'company')
            body_data = {}
        else:
            body_data = json.loads(event.get('body', '{}'))
            entity_type = body_data.get('entity_type', 'company')
        
        if entity_type == 'company':
            return handle_companies(method, user, body_data, headers, cors_headers, event)
        elif entity_type == 'department':
            return handle_departments(method, user, body_data, headers, cors_headers, event)
        else:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Invalid entity_type'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def handle_companies(method, user, body_data, headers, cors_headers, event):
    if method == 'GET':
        if not has_permission(user['id'], 'companies.view'):
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Permission denied'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT c.id, c.name, c.description, c.is_active, c.created_at, c.updated_at,
                   COUNT(DISTINCT d.id) as departments_count,
                   COUNT(DISTINCT u.id) as users_count
            FROM companies c
            LEFT JOIN departments d ON d.company_id = c.id
            LEFT JOIN users u ON u.company_id = c.id
            GROUP BY c.id, c.name, c.description, c.is_active, c.created_at, c.updated_at
            ORDER BY c.name
        ''')
        
        companies = [dict(row) for row in cur.fetchall()]
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'companies': companies}, default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        if not has_permission(user['id'], 'companies.create'):
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Permission denied'}),
                'isBase64Encoded': False
            }
        
        name = body_data.get('name', '').strip()
        description = body_data.get('description', '').strip()
        is_active = body_data.get('is_active', True)
        
        if not name:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Company name is required'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO companies (name, description, is_active)
            VALUES (%s, %s, %s)
            RETURNING id, name, description, is_active, created_at, updated_at
        ''', (name, description, is_active))
        
        company = dict(cur.fetchone())
        
        ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
        user_agent = headers.get('user-agent', 'unknown')
        
        cur.execute('''
            INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id,
                                   description, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (user['id'], user['username'], 'companies.create', 'company', company['id'],
              f"Создана компания: {name}", ip_address, user_agent))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({'company': company}, default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'PUT':
        if not has_permission(user['id'], 'companies.edit'):
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Permission denied'}),
                'isBase64Encoded': False
            }
        
        company_id = body_data.get('id')
        name = body_data.get('name', '').strip()
        description = body_data.get('description', '').strip()
        is_active = body_data.get('is_active')
        
        if not company_id or not name:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Company ID and name are required'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE companies 
            SET name = %s, description = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, name, description, is_active, created_at, updated_at
        ''', (name, description, is_active, company_id))
        
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Company not found'}),
                'isBase64Encoded': False
            }
        
        company = dict(cur.fetchone())
        
        ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
        user_agent = headers.get('user-agent', 'unknown')
        
        cur.execute('''
            INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id,
                                   description, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (user['id'], user['username'], 'companies.edit', 'company', company['id'],
              f"Обновлена компания: {name}", ip_address, user_agent))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'company': company}, default=str),
            'isBase64Encoded': False
        }

def handle_departments(method, user, body_data, headers, cors_headers, event):
    if method == 'GET':
        if not has_permission(user['id'], 'departments.view'):
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Permission denied'}),
                'isBase64Encoded': False
            }
        
        query_params = event.get('queryStringParameters', {}) or {}
        company_id = query_params.get('company_id')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        if company_id:
            cur.execute('''
                SELECT d.id, d.company_id, d.name, d.description, d.is_active, 
                       d.created_at, d.updated_at, c.name as company_name,
                       COUNT(DISTINCT u.id) as users_count
                FROM departments d
                INNER JOIN companies c ON c.id = d.company_id
                LEFT JOIN users u ON u.department_id = d.id
                WHERE d.company_id = %s
                GROUP BY d.id, d.company_id, d.name, d.description, d.is_active, 
                         d.created_at, d.updated_at, c.name
                ORDER BY d.name
            ''', (company_id,))
        else:
            cur.execute('''
                SELECT d.id, d.company_id, d.name, d.description, d.is_active,
                       d.created_at, d.updated_at, c.name as company_name,
                       COUNT(DISTINCT u.id) as users_count
                FROM departments d
                INNER JOIN companies c ON c.id = d.company_id
                LEFT JOIN users u ON u.department_id = d.id
                GROUP BY d.id, d.company_id, d.name, d.description, d.is_active,
                         d.created_at, d.updated_at, c.name
                ORDER BY c.name, d.name
            ''')
        
        departments = [dict(row) for row in cur.fetchall()]
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'departments': departments}, default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        if not has_permission(user['id'], 'departments.create'):
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Permission denied'}),
                'isBase64Encoded': False
            }
        
        company_id = body_data.get('company_id')
        name = body_data.get('name', '').strip()
        description = body_data.get('description', '').strip()
        is_active = body_data.get('is_active', True)
        
        if not company_id or not name:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Company ID and department name are required'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO departments (company_id, name, description, is_active)
            VALUES (%s, %s, %s, %s)
            RETURNING id, company_id, name, description, is_active, created_at, updated_at
        ''', (company_id, name, description, is_active))
        
        department = dict(cur.fetchone())
        
        ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
        user_agent = headers.get('user-agent', 'unknown')
        
        cur.execute('''
            INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id,
                                   description, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (user['id'], user['username'], 'departments.create', 'department', department['id'],
              f"Создано подразделение: {name}", ip_address, user_agent))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({'department': department}, default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'PUT':
        if not has_permission(user['id'], 'departments.edit'):
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Permission denied'}),
                'isBase64Encoded': False
            }
        
        department_id = body_data.get('id')
        company_id = body_data.get('company_id')
        name = body_data.get('name', '').strip()
        description = body_data.get('description', '').strip()
        is_active = body_data.get('is_active')
        
        if not department_id or not company_id or not name:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Department ID, company ID and name are required'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE departments 
            SET company_id = %s, name = %s, description = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, company_id, name, description, is_active, created_at, updated_at
        ''', (company_id, name, description, is_active, department_id))
        
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Department not found'}),
                'isBase64Encoded': False
            }
        
        department = dict(cur.fetchone())
        
        ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
        user_agent = headers.get('user-agent', 'unknown')
        
        cur.execute('''
            INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id,
                                   description, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (user['id'], user['username'], 'departments.edit', 'department', department['id'],
              f"Обновлено подразделение: {name}", ip_address, user_agent))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'department': department}, default=str),
            'isBase64Encoded': False
        }