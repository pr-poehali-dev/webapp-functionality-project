'''
Business: Access groups and permissions management API
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with access groups, permissions data
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
        FROM t_p66738329_webapp_functionality.users u
        INNER JOIN t_p66738329_webapp_functionality.user_sessions s ON s.user_id = u.id
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
        SELECT u.role_id, u.department_id FROM t_p66738329_webapp_functionality.users u WHERE u.id = %s
    ''', (user_id,))
    
    user = cur.fetchone()
    if not user:
        cur.close()
        conn.close()
        return False
    
    role_id = user['role_id']
    department_id = user['department_id']
    
    if department_id:
        cur.execute('''
            SELECT d.access_group_id FROM t_p66738329_webapp_functionality.departments d WHERE d.id = %s
        ''', (department_id,))
        dept = cur.fetchone()
        dept_access_group_id = dept['access_group_id'] if dept else None
    else:
        dept_access_group_id = None
    
    access_group_ids = []
    if role_id:
        access_group_ids.append(role_id)
    if dept_access_group_id:
        access_group_ids.append(dept_access_group_id)
    
    if not access_group_ids:
        cur.close()
        conn.close()
        return False
    
    placeholders = ','.join(['%s'] * len(access_group_ids))
    cur.execute(f'''
        SELECT COUNT(*) as count
        FROM t_p66738329_webapp_functionality.permissions p
        INNER JOIN t_p66738329_webapp_functionality.access_group_permissions agp ON agp.permission_id = p.id
        WHERE agp.access_group_id IN ({placeholders}) AND p.code = %s
    ''', (*access_group_ids, permission_code))
    
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
            query_params = event.get('queryStringParameters') or {}
            resource = query_params.get('resource', 'access_groups')
            
            if resource == 'access_groups':
                if not check_permission(current_user['id'], 'access_groups.view'):
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Permission denied'}),
                        'isBase64Encoded': False
                    }
                
                access_group_id = query_params.get('id')
                
                conn = get_db_connection()
                cur = conn.cursor()
                
                # If id is provided, return single access group with permissions
                if access_group_id:
                    cur.execute('''
                        SELECT ag.id, ag.group_name as name, ag.description, ag.is_system, ag.created_at
                        FROM t_p66738329_webapp_functionality.access_groups ag
                        WHERE ag.id = %s
                    ''', (access_group_id,))
                    
                    access_group = cur.fetchone()
                    
                    if not access_group:
                        cur.close()
                        conn.close()
                        return {
                            'statusCode': 404,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Access group not found'}),
                            'isBase64Encoded': False
                        }
                    
                    access_group = dict(access_group)
                    
                    # Get permissions for this access group
                    cur.execute('''
                        SELECT p.id, p.code, p.name, p.description, p.category
                        FROM t_p66738329_webapp_functionality.permissions p
                        INNER JOIN t_p66738329_webapp_functionality.access_group_permissions agp ON agp.permission_id = p.id
                        WHERE agp.access_group_id = %s
                        ORDER BY p.category, p.code
                    ''', (access_group_id,))
                    
                    access_group['permissions'] = [dict(row) for row in cur.fetchall()]
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'access_group': access_group}, default=str),
                        'isBase64Encoded': False
                    }
                
                # Otherwise return all access groups
                cur.execute('''
                    SELECT ag.id, ag.group_name as name, ag.description, ag.is_system, ag.created_at,
                           COUNT(DISTINCT d.id) as departments_count,
                           COUNT(DISTINCT u.id) as users_count
                    FROM t_p66738329_webapp_functionality.access_groups ag
                    LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.access_group_id = ag.id
                    LEFT JOIN t_p66738329_webapp_functionality.users u ON u.department_id = d.id
                    GROUP BY ag.id, ag.group_name, ag.description, ag.is_system, ag.created_at
                    ORDER BY ag.group_name
                ''')
                
                access_groups = [dict(row) for row in cur.fetchall()]
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'access_groups': access_groups}, default=str),
                    'isBase64Encoded': False
                }
            
            elif resource == 'permissions':
                if not check_permission(current_user['id'], 'access_groups.view'):
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Permission denied'}),
                        'isBase64Encoded': False
                    }
                
                conn = get_db_connection()
                cur = conn.cursor()
                
                cur.execute('''
                    SELECT id, code, name, description, category
                    FROM t_p66738329_webapp_functionality.permissions
                    ORDER BY category, code
                ''')
                
                permissions = [dict(row) for row in cur.fetchall()]
                
                # Group permissions by category
                by_category = {}
                for perm in permissions:
                    category = perm.get('category', 'Прочее')
                    if category not in by_category:
                        by_category[category] = []
                    by_category[category].append(perm)
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'permissions': permissions, 'by_category': by_category}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'access_group_permissions':
                access_group_id = query_params.get('access_group_id')
                
                if not access_group_id:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'access_group_id is required'}),
                        'isBase64Encoded': False
                    }
                
                if not check_permission(current_user['id'], 'access_groups.view'):
                    return {
                        'statusCode': 403,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Permission denied'}),
                        'isBase64Encoded': False
                    }
                
                conn = get_db_connection()
                cur = conn.cursor()
                
                cur.execute('''
                    SELECT p.id, p.code, p.name, p.category
                    FROM t_p66738329_webapp_functionality.permissions p
                    INNER JOIN t_p66738329_webapp_functionality.access_group_permissions agp ON agp.permission_id = p.id
                    WHERE agp.access_group_id = %s
                    ORDER BY p.category, p.code
                ''', (access_group_id,))
                
                permissions = [dict(row) for row in cur.fetchall()]
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'permissions': permissions}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            if not check_permission(current_user['id'], 'access_groups.create'):
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Permission denied'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            group_name = body_data.get('name', '').strip()
            description = body_data.get('description', '').strip()
            permission_ids = body_data.get('permission_ids', [])
            
            if not group_name:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Group name is required'}),
                    'isBase64Encoded': False
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute('''
                INSERT INTO t_p66738329_webapp_functionality.access_groups (group_name, description, is_system)
                VALUES (%s, %s, FALSE)
                RETURNING id, group_name as name, description, is_system, created_at
            ''', (group_name, description))
            
            access_group = dict(cur.fetchone())
            
            for permission_id in permission_ids:
                cur.execute('''
                    INSERT INTO t_p66738329_webapp_functionality.access_group_permissions (access_group_id, permission_id)
                    VALUES (%s, %s)
                ''', (access_group['id'], permission_id))
            
            ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
            user_agent = headers.get('user-agent', 'unknown')
            
            cur.execute('''
                INSERT INTO t_p66738329_webapp_functionality.audit_log (user_id, username, action_type, entity_type, entity_id,
                                       description, ip_address, user_agent)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (current_user['id'], current_user['username'], 'access_groups.create', 'access_group',
                  access_group['id'], f"Создана группа доступа: {group_name}", ip_address, user_agent))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': cors_headers,
                'body': json.dumps({'access_group': access_group}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            if not check_permission(current_user['id'], 'access_groups.edit'):
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Permission denied'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            access_group_id = body_data.get('id')
            group_name = body_data.get('name', '').strip()
            description = body_data.get('description', '').strip()
            permission_ids = body_data.get('permission_ids')
            
            if not access_group_id or not group_name:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Group ID and name are required'}),
                    'isBase64Encoded': False
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute('SELECT is_system FROM t_p66738329_webapp_functionality.access_groups WHERE id = %s', (access_group_id,))
            result = cur.fetchone()
            
            if not result:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Access group not found'}),
                    'isBase64Encoded': False
                }
            
            if result['is_system']:
                cur.close()
                conn.close()
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Cannot edit system access group'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE t_p66738329_webapp_functionality.access_groups
                SET group_name = %s, description = %s
                WHERE id = %s
                RETURNING id, group_name as name, description, is_system, created_at
            ''', (group_name, description, access_group_id))
            
            access_group = dict(cur.fetchone())
            
            if permission_ids is not None:
                cur.execute('DELETE FROM t_p66738329_webapp_functionality.access_group_permissions WHERE access_group_id = %s', (access_group_id,))
                
                for permission_id in permission_ids:
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.access_group_permissions (access_group_id, permission_id)
                        VALUES (%s, %s)
                    ''', (access_group_id, permission_id))
            
            ip_address = headers.get('x-forwarded-for', '').split(',')[0] or headers.get('x-real-ip', 'unknown')
            user_agent = headers.get('user-agent', 'unknown')
            
            cur.execute('''
                INSERT INTO t_p66738329_webapp_functionality.audit_log (user_id, username, action_type, entity_type, entity_id,
                                       description, ip_address, user_agent)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (current_user['id'], current_user['username'], 'access_groups.edit', 'access_group',
                  access_group['id'], f"Обновлена группа доступа: {group_name}", ip_address, user_agent))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'access_group': access_group}, default=str),
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