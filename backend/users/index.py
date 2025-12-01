'''
Business: User management API - CRUD operations for users
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with user data or operation results
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor, options='-c search_path=t_p66738329_webapp_functionality')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def get_user_by_session(session_token: str) -> Optional[Dict]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT u.id, u.username, u.email, u.full_name, u.role_id, u.is_blocked
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
    
    session_token = headers.get('X-Session-Token', headers.get('x-session-token', ''))
    
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
            if not check_permission(current_user['id'], 'users.view'):
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Permission denied'}),
                    'isBase64Encoded': False
                }
            
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('id')
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            if user_id:
                cur.execute('''
                    SELECT u.id, u.username, u.email, u.full_name, u.role_id, u.is_blocked,
                           u.created_at, u.updated_at, u.last_login, u.company_id, u.department_id,
                           r.name as role_name, r.description as role_description,
                           c.name as company_name, d.name as department_name
                    FROM users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN companies c ON u.company_id = c.id
                    LEFT JOIN departments d ON u.department_id = d.id
                    WHERE u.id = %s
                ''', (user_id,))
                
                user = cur.fetchone()
                cur.close()
                conn.close()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'user': dict(user)}, default=str),
                    'isBase64Encoded': False
                }
            else:
                cur.execute('''
                    SELECT u.id, u.username, u.email, u.full_name, u.is_blocked,
                           u.created_at, u.last_login, u.company_id, u.department_id,
                           c.name as company_name, d.name as department_name
                    FROM users u
                    LEFT JOIN companies c ON u.company_id = c.id
                    LEFT JOIN departments d ON u.department_id = d.id
                    ORDER BY u.created_at DESC
                ''')
                
                users = [dict(row) for row in cur.fetchall()]
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'users': users}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            if not check_permission(current_user['id'], 'users.create'):
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Permission denied'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            username = body_data.get('username', '').strip()
            email = body_data.get('email', '').strip() or None
            password = body_data.get('password', '')
            full_name = body_data.get('full_name', '').strip()
            company_id = body_data.get('company_id')
            department_id = body_data.get('department_id')
            
            if not username or not password or not full_name:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Username, password and full name are required'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                cur.execute('''
                    INSERT INTO users (username, email, password_hash, full_name, company_id, department_id, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, username, email, full_name, company_id, department_id, is_blocked, created_at
                ''', (username, email, password_hash, full_name, company_id, department_id, current_user['id']))
                
                new_user = dict(cur.fetchone())
                
                ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
                user_agent = headers.get('user-agent', 'unknown')
                
                cur.execute('''
                    INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id, 
                                           description, ip_address, user_agent)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', (current_user['id'], current_user['username'], 'user.create', 'user', new_user['id'],
                      f"Создан пользователь {username} ({full_name})", ip_address, user_agent))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'user': new_user}, default=str),
                    'isBase64Encoded': False
                }
            except psycopg2.IntegrityError as e:
                conn.rollback()
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Username or email already exists'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            user_id = body_data.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'User ID is required'}),
                    'isBase64Encoded': False
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            if action == 'block':
                if not check_permission(current_user['id'], 'users.block'):
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Permission denied'}),
                        'isBase64Encoded': False
                    }
                
                is_blocked = body_data.get('is_blocked', True)
                
                cur.execute('SELECT username FROM users WHERE id = %s', (user_id,))
                target_user = cur.fetchone()
                target_username = target_user['username'] if target_user else 'Unknown'
                
                cur.execute('UPDATE users SET is_blocked = %s, updated_at = NOW() WHERE id = %s', (is_blocked, user_id))
                
                ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
                user_agent = headers.get('user-agent', 'unknown')
                
                action_text = 'заблокирован' if is_blocked else 'разблокирован'
                cur.execute('''
                    INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id, 
                                           description, ip_address, user_agent)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', (current_user['id'], current_user['username'], 
                      'user.block' if is_blocked else 'user.unblock', 'user', user_id,
                      f"Пользователь {target_username} {action_text}", ip_address, user_agent))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'message': 'User blocked status updated'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'update':
                if not check_permission(current_user['id'], 'users.edit'):
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Permission denied'}),
                        'isBase64Encoded': False
                    }
                
                email = body_data.get('email')
                full_name = body_data.get('full_name')
                role_id = body_data.get('role_id')
                password = body_data.get('password')
                
                updates = []
                params = []
                
                if email:
                    updates.append('email = %s')
                    params.append(email)
                if full_name:
                    updates.append('full_name = %s')
                    params.append(full_name)
                if role_id is not None:
                    updates.append('role_id = %s')
                    params.append(role_id)
                if password:
                    updates.append('password_hash = %s')
                    params.append(hash_password(password))
                
                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'No fields to update'}),
                        'isBase64Encoded': False
                    }
                
                updates.append('updated_at = NOW()')
                params.append(user_id)
                
                query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
                
                try:
                    cur.execute(query, params)
                    conn.commit()
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'success': True, 'message': 'User updated'}),
                        'isBase64Encoded': False
                    }
                except psycopg2.IntegrityError:
                    conn.rollback()
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Email already exists'}),
                        'isBase64Encoded': False
                    }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Invalid action'}),
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