'''
Business: Authentication API - login, logout, session validation
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with authentication tokens and user data
'''

import json
import os
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor, options='-c search_path=t_p66738329_webapp_functionality')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_session(user_id: int, ip_address: str, user_agent: str) -> str:
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=7)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
        VALUES (%s, %s, %s, %s, %s)
    ''', (user_id, session_token, expires_at, ip_address, user_agent))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return session_token

def get_user_by_session(session_token: str) -> Optional[Dict]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT u.id, u.username, u.email, u.full_name, u.role_id, u.is_blocked,
               u.department_id, d.name as department_name, d.access_group_id,
               ag.group_name as access_group_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN access_groups ag ON d.access_group_id = ag.id
        INNER JOIN user_sessions s ON s.user_id = u.id
        WHERE s.session_token = %s AND s.expires_at > NOW()
    ''', (session_token,))
    
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    return dict(user) if user else None

def get_user_permissions(user_id: int) -> list:
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get permissions from department's access group OR from old role_id (fallback)
    cur.execute('''
        SELECT DISTINCT p.code
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN access_group_permissions agp ON agp.access_group_id = d.access_group_id
        LEFT JOIN access_group_permissions agp2 ON agp2.access_group_id = u.role_id
        LEFT JOIN permissions p ON p.id = COALESCE(agp.permission_id, agp2.permission_id)
        WHERE u.id = %s AND p.code IS NOT NULL
    ''', (user_id,))
    
    permissions = [row['code'] for row in cur.fetchall()]
    cur.close()
    conn.close()
    
    return permissions

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    headers = event.get('headers', {})
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'login':
                username = body_data.get('username', '').strip()
                password = body_data.get('password', '')
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Username and password are required'}),
                        'isBase64Encoded': False
                    }
                
                conn = get_db_connection()
                cur = conn.cursor()
                
                cur.execute('''
                    SELECT u.id, u.username, u.email, u.full_name, u.password_hash, u.role_id, u.is_blocked,
                           u.department_id, d.name as department_name, d.access_group_id,
                           ag.group_name as access_group_name
                    FROM users u
                    LEFT JOIN departments d ON u.department_id = d.id
                    LEFT JOIN access_groups ag ON d.access_group_id = ag.id
                    WHERE u.username = %s
                ''', (username,))
                
                user = cur.fetchone()
                
                if not user:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Invalid username or password'}),
                        'isBase64Encoded': False
                    }
                
                user_dict = dict(user)
                
                print(f"[LOGIN] User: {user_dict['username']}, Blocked: {user_dict['is_blocked']}")
                print(f"[LOGIN] Input password: '{password}'")
                print(f"[LOGIN] Hash from DB: {user_dict['password_hash']}")
                
                if user_dict['is_blocked']:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Account is blocked'}),
                        'isBase64Encoded': False
                    }
                
                try:
                    password_check = verify_password(password, user_dict['password_hash'])
                    print(f"[LOGIN] Password check result: {password_check}")
                except Exception as e:
                    print(f"[LOGIN] Error during password verification: {e}")
                    password_check = False
                
                if not password_check:
                    print("[LOGIN] Password check failed - returning 401")
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Invalid username or password'}),
                        'isBase64Encoded': False
                    }
                
                print("[LOGIN] Password OK - updating last_login")
                cur.execute('UPDATE users SET last_login = NOW() WHERE id = %s', (user_dict['id'],))
                
                ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
                user_agent = headers.get('user-agent', 'unknown')
                
                print("[LOGIN] Creating audit log entry")
                cur.execute('''
                    INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id, 
                                           description, ip_address, user_agent)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', (user_dict['id'], user_dict['username'], 'auth.login', 'user', user_dict['id'],
                      f"Пользователь {user_dict['username']} вошёл в систему", ip_address, user_agent))
                
                print("[LOGIN] Committing transaction")
                conn.commit()
                cur.close()
                conn.close()
                
                print("[LOGIN] Creating session token")
                session_token = create_session(user_dict['id'], ip_address, user_agent)
                
                print("[LOGIN] Getting user permissions")
                permissions = get_user_permissions(user_dict['id'])
                
                print(f"[LOGIN] Success! Returning response with {len(permissions)} permissions")
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'success': True,
                        'session_token': session_token,
                        'user': {
                            'id': user_dict['id'],
                            'username': user_dict['username'],
                            'email': user_dict['email'],
                            'full_name': user_dict['full_name'],
                            'department_id': user_dict.get('department_id'),
                            'department_name': user_dict.get('department_name'),
                            'access_group_id': user_dict.get('access_group_id'),
                            'access_group_name': user_dict.get('access_group_name')
                        },
                        'permissions': permissions
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'logout':
                session_token = headers.get('X-Session-Token', headers.get('x-session-token', ''))
                
                if session_token:
                    user = get_user_by_session(session_token)
                    
                    conn = get_db_connection()
                    cur = conn.cursor()
                    cur.execute('UPDATE user_sessions SET expires_at = NOW() WHERE session_token = %s', (session_token,))
                    
                    if user:
                        ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
                        user_agent = headers.get('user-agent', 'unknown')
                        
                        cur.execute('''
                            INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id, 
                                                   description, ip_address, user_agent)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ''', (user['id'], user['username'], 'auth.logout', 'user', user['id'],
                              f"Пользователь {user['username']} вышел из системы", ip_address, user_agent))
                    
                    conn.commit()
                    cur.close()
                    conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'message': 'Logged out'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'validate':
                session_token = headers.get('X-Session-Token', headers.get('x-session-token', ''))
                print(f"[VALIDATE] Received token from header: {session_token[:20] if session_token else 'EMPTY'}")
                
                if not session_token:
                    print("[VALIDATE] No session token - returning 401")
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'No session token provided'}),
                        'isBase64Encoded': False
                    }
                
                print("[VALIDATE] Looking up user by session...")
                user = get_user_by_session(session_token)
                
                if not user:
                    print("[VALIDATE] User not found or session expired - returning 401")
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Invalid or expired session'}),
                        'isBase64Encoded': False
                    }
                
                if user['is_blocked']:
                    print("[VALIDATE] User is blocked - returning 403")
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Account is blocked'}),
                        'isBase64Encoded': False
                    }
                
                print(f"[VALIDATE] User found: {user['username']}, getting permissions...")
                permissions = get_user_permissions(user['id'])
                
                print(f"[VALIDATE] Success! Returning {len(permissions)} permissions")
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'valid': True,
                        'user': user,
                        'permissions': permissions
                    }),
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