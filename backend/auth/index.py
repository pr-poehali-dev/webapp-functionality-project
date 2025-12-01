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
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

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
               r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
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
    
    cur.execute('''
        SELECT DISTINCT p.code
        FROM users u
        INNER JOIN role_permissions rp ON rp.role_id = u.role_id
        INNER JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = %s
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
                           r.name as role_name
                    FROM users u
                    LEFT JOIN roles r ON u.role_id = r.id
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
                
                if user_dict['is_blocked']:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Account is blocked'}),
                        'isBase64Encoded': False
                    }
                
                if not verify_password(password, user_dict['password_hash']):
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Invalid username or password'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('UPDATE users SET last_login = NOW() WHERE id = %s', (user_dict['id'],))
                conn.commit()
                cur.close()
                conn.close()
                
                ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
                user_agent = headers.get('user-agent', 'unknown')
                session_token = create_session(user_dict['id'], ip_address, user_agent)
                
                permissions = get_user_permissions(user_dict['id'])
                
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
                            'role_id': user_dict['role_id'],
                            'role_name': user_dict['role_name']
                        },
                        'permissions': permissions
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'logout':
                session_token = headers.get('x-session-token', '')
                
                if session_token:
                    conn = get_db_connection()
                    cur = conn.cursor()
                    cur.execute('UPDATE user_sessions SET expires_at = NOW() WHERE session_token = %s', (session_token,))
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
                session_token = headers.get('x-session-token', '')
                
                if not session_token:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'No session token provided'}),
                        'isBase64Encoded': False
                    }
                
                user = get_user_by_session(session_token)
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Invalid or expired session'}),
                        'isBase64Encoded': False
                    }
                
                if user['is_blocked']:
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Account is blocked'}),
                        'isBase64Encoded': False
                    }
                
                permissions = get_user_permissions(user['id'])
                
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