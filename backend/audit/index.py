'''
Business: Audit log API - read audit logs and create audit records
Args: event with httpMethod, body, headers, queryStringParameters; context with request_id
Returns: HTTP response with audit logs or operation result
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor, options='-c search_path=t_p66738329_webapp_functionality')

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

def create_audit_log(user_id: int, username: str, action_type: str, entity_type: str, 
                     entity_id: Optional[int], description: str, ip_address: str, user_agent: str):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        INSERT INTO audit_log (user_id, username, action_type, entity_type, entity_id, 
                               description, ip_address, user_agent)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ''', (user_id, username, action_type, entity_type, entity_id, description, ip_address, user_agent))
    
    conn.commit()
    cur.close()
    conn.close()

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
            if not check_permission(current_user['id'], 'system.logs'):
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Permission denied'}),
                    'isBase64Encoded': False
                }
            
            query_params = event.get('queryStringParameters') or {}
            limit = int(query_params.get('limit', '100'))
            offset = int(query_params.get('offset', '0'))
            user_id = query_params.get('user_id')
            action_type = query_params.get('action_type')
            entity_type = query_params.get('entity_type')
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            where_clauses = []
            params = []
            
            if user_id:
                where_clauses.append('user_id = %s')
                params.append(int(user_id))
            
            if action_type:
                where_clauses.append('action_type = %s')
                params.append(action_type)
            
            if entity_type:
                where_clauses.append('entity_type = %s')
                params.append(entity_type)
            
            where_sql = 'WHERE ' + ' AND '.join(where_clauses) if where_clauses else ''
            
            params.extend([limit, offset])
            
            cur.execute(f'''
                SELECT id, user_id, username, action_type, entity_type, entity_id,
                       description, ip_address, user_agent, created_at
                FROM audit_log
                {where_sql}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            ''', params)
            
            logs = [dict(row) for row in cur.fetchall()]
            
            cur.execute(f'SELECT COUNT(*) as total FROM audit_log {where_sql}', params[:-2] if where_clauses else [])
            total = cur.fetchone()['total']
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'logs': logs,
                    'total': total,
                    'limit': limit,
                    'offset': offset
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            action_type = body_data.get('action_type')
            entity_type = body_data.get('entity_type')
            entity_id = body_data.get('entity_id')
            description = body_data.get('description')
            
            if not action_type or not entity_type or not description:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
            user_agent = headers.get('user-agent', 'unknown')
            
            create_audit_log(
                current_user['id'],
                current_user['username'],
                action_type,
                entity_type,
                entity_id,
                description,
                ip_address,
                user_agent
            )
            
            return {
                'statusCode': 201,
                'headers': cors_headers,
                'body': json.dumps({'success': True, 'message': 'Audit log created'}),
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