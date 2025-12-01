'''
Business: Roles and permissions management API
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with roles, permissions data
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def get_user_by_session(session_token: str) -> Optional[Dict]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT u.id, u.username, u.role_id
        FROM users u
        INNER JOIN user_sessions s ON s.user_id = u.id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    ''', (session_token,))
    
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    return dict(user) if user else None

def check_permission(user_id: int, permission_code: str) -> bool:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT COUNT(*) as count
        FROM permissions p
        INNER JOIN role_permissions rp ON rp.permission_id = p.id
        INNER JOIN users u ON u.role_id = rp.role_id
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
    
    session_token = headers.get('x-session-token', '')
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Authentication required'}),
            'isBase64Encoded': False
        }
    
    current_user = get_user_by_session(session_token)
    
    if not current_user:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Invalid session'}),
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            resource = query_params.get('resource', 'roles')
            
            if resource == 'roles':
                if not check_permission(current_user['id'], 'roles.view'):
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Permission denied'}),
                        'isBase64Encoded': False
                    }
                
                role_id = query_params.get('id')
                
                conn = get_db_connection()
                cur = conn.cursor()
                
                if role_id:
                    cur.execute('''
                        SELECT r.id, r.name, r.description, r.created_at, r.updated_at,
                               COUNT(u.id) as users_count
                        FROM roles r
                        LEFT JOIN users u ON u.role_id = r.id
                        WHERE r.id = %s
                        GROUP BY r.id, r.name, r.description, r.created_at, r.updated_at
                    ''', (role_id,))
                    
                    role = cur.fetchone()
                    
                    if not role:
                        cur.close()
                        conn.close()
                        return {
                            'statusCode': 404,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Role not found'}),
                            'isBase64Encoded': False
                        }
                    
                    role_dict = dict(role)
                    
                    cur.execute('''
                        SELECT p.id, p.code, p.name, p.description, p.category
                        FROM permissions p
                        INNER JOIN role_permissions rp ON rp.permission_id = p.id
                        WHERE rp.role_id = %s
                        ORDER BY p.category, p.name
                    ''', (role_id,))
                    
                    role_dict['permissions'] = [dict(row) for row in cur.fetchall()]
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'role': role_dict}, default=str),
                        'isBase64Encoded': False
                    }
                else:
                    cur.execute('''
                        SELECT r.id, r.name, r.description, r.created_at,
                               COUNT(u.id) as users_count
                        FROM roles r
                        LEFT JOIN users u ON u.role_id = r.id
                        GROUP BY r.id, r.name, r.description, r.created_at
                        ORDER BY r.id
                    ''')
                    
                    roles = [dict(row) for row in cur.fetchall()]
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'roles': roles}, default=str),
                        'isBase64Encoded': False
                    }
            
            elif resource == 'permissions':
                conn = get_db_connection()
                cur = conn.cursor()
                
                cur.execute('''
                    SELECT id, code, name, description, category
                    FROM permissions
                    ORDER BY category, name
                ''')
                
                permissions = [dict(row) for row in cur.fetchall()]
                cur.close()
                conn.close()
                
                permissions_by_category = {}
                for perm in permissions:
                    category = perm['category']
                    if category not in permissions_by_category:
                        permissions_by_category[category] = []
                    permissions_by_category[category].append(perm)
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'permissions': permissions,
                        'by_category': permissions_by_category
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Invalid resource'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            if not check_permission(current_user['id'], 'roles.create'):
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Permission denied'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', '').strip()
            description = body_data.get('description', '').strip()
            permission_ids = body_data.get('permission_ids', [])
            
            if not name:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Role name is required'}),
                    'isBase64Encoded': False
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                cur.execute('''
                    INSERT INTO roles (name, description)
                    VALUES (%s, %s)
                    RETURNING id, name, description, created_at
                ''', (name, description))
                
                new_role = dict(cur.fetchone())
                role_id = new_role['id']
                
                if permission_ids:
                    for perm_id in permission_ids:
                        cur.execute('''
                            INSERT INTO role_permissions (role_id, permission_id)
                            VALUES (%s, %s)
                        ''', (role_id, perm_id))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'role': new_role}, default=str),
                    'isBase64Encoded': False
                }
            except psycopg2.IntegrityError:
                conn.rollback()
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Role name already exists'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            if not check_permission(current_user['id'], 'roles.edit'):
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Permission denied'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            role_id = body_data.get('role_id')
            name = body_data.get('name')
            description = body_data.get('description')
            permission_ids = body_data.get('permission_ids')
            
            if not role_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Role ID is required'}),
                    'isBase64Encoded': False
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                if name or description is not None:
                    updates = []
                    params = []
                    
                    if name:
                        updates.append('name = %s')
                        params.append(name)
                    if description is not None:
                        updates.append('description = %s')
                        params.append(description)
                    
                    updates.append('updated_at = NOW()')
                    params.append(role_id)
                    
                    query = f"UPDATE roles SET {', '.join(updates)} WHERE id = %s"
                    cur.execute(query, params)
                
                if permission_ids is not None:
                    cur.execute('DELETE FROM role_permissions WHERE role_id = %s', (role_id,))
                    
                    for perm_id in permission_ids:
                        cur.execute('''
                            INSERT INTO role_permissions (role_id, permission_id)
                            VALUES (%s, %s)
                        ''', (role_id, perm_id))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'message': 'Role updated'}),
                    'isBase64Encoded': False
                }
            except psycopg2.IntegrityError:
                conn.rollback()
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Role name already exists'}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
