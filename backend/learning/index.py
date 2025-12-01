'''
Business: Learning management API - courses, trainers, and progress tracking
Args: event with httpMethod, body, headers, path; context with request_id
Returns: HTTP response with learning data or operation results
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def get_user_id_from_headers(headers: Dict[str, str]) -> Optional[int]:
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    return int(user_id) if user_id else None

def handle_courses(event: Dict[str, Any], user_id: int, conn, cur) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # GET /courses
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        department_id = query_params.get('department_id')
        
        if department_id:
            cur.execute('''
                SELECT c.*, 
                       json_agg(json_build_object('id', d.id, 'name', d.name)) as departments
                FROM t_p66738329_webapp_functionality.courses c
                LEFT JOIN t_p66738329_webapp_functionality.course_departments cd ON cd.course_id = c.id
                LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.id = cd.department_id
                WHERE c.is_active = true AND cd.department_id = %s
                GROUP BY c.id
                ORDER BY c.created_at DESC
            ''', (department_id,))
        else:
            cur.execute('''
                SELECT c.*, 
                       json_agg(json_build_object('id', d.id, 'name', d.name)) FILTER (WHERE d.id IS NOT NULL) as departments
                FROM t_p66738329_webapp_functionality.courses c
                LEFT JOIN t_p66738329_webapp_functionality.course_departments cd ON cd.course_id = c.id
                LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.id = cd.department_id
                WHERE c.is_active = true
                GROUP BY c.id
                ORDER BY c.created_at DESC
            ''')
        
        courses = cur.fetchall()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps([dict(c) for c in courses], default=str)
        }
    
    # POST /courses
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        title = body.get('title')
        description = body.get('description', '')
        content = body.get('content', '')
        duration_hours = body.get('duration_hours', 0)
        department_ids = body.get('department_ids', [])
        
        if not title:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Title is required'})
            }
        
        cur.execute('''
            INSERT INTO t_p66738329_webapp_functionality.courses 
            (title, description, content, duration_hours, created_by)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, title, description, content, duration_hours, is_active, created_at
        ''', (title, description, content, duration_hours, user_id))
        
        course = cur.fetchone()
        course_id = course['id']
        
        if department_ids:
            for dept_id in department_ids:
                cur.execute('''
                    INSERT INTO t_p66738329_webapp_functionality.course_departments 
                    (course_id, department_id) VALUES (%s, %s)
                ''', (course_id, dept_id))
        
        conn.commit()
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(course), default=str)
        }
    
    # PUT /courses
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        course_id = body.get('id')
        
        if not course_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Course ID is required'})
            }
        
        updates = []
        params = []
        
        if 'title' in body:
            updates.append('title = %s')
            params.append(body['title'])
        if 'description' in body:
            updates.append('description = %s')
            params.append(body['description'])
        if 'content' in body:
            updates.append('content = %s')
            params.append(body['content'])
        if 'duration_hours' in body:
            updates.append('duration_hours = %s')
            params.append(body['duration_hours'])
        if 'is_active' in body:
            updates.append('is_active = %s')
            params.append(body['is_active'])
        
        updates.append('updated_at = NOW()')
        params.append(course_id)
        
        cur.execute(f'''
            UPDATE t_p66738329_webapp_functionality.courses
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id, title, description, content, duration_hours, is_active, updated_at
        ''', tuple(params))
        
        course = cur.fetchone()
        
        if 'department_ids' in body:
            cur.execute('DELETE FROM t_p66738329_webapp_functionality.course_departments WHERE course_id = %s', (course_id,))
            for dept_id in body['department_ids']:
                cur.execute('''
                    INSERT INTO t_p66738329_webapp_functionality.course_departments 
                    (course_id, department_id) VALUES (%s, %s)
                ''', (course_id, dept_id))
        
        conn.commit()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(course), default=str)
        }
    
    # DELETE /courses
    elif method == 'DELETE':
        query_params = event.get('queryStringParameters') or {}
        course_id = query_params.get('id')
        
        if not course_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Course ID is required'})
            }
        
        cur.execute('''
            UPDATE t_p66738329_webapp_functionality.courses
            SET is_active = false, updated_at = NOW()
            WHERE id = %s
        ''', (course_id,))
        
        conn.commit()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Course deactivated'})
        }

def handle_trainers(event: Dict[str, Any], user_id: int, conn, cur) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # GET /trainers
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        department_id = query_params.get('department_id')
        difficulty = query_params.get('difficulty')
        
        base_query = '''
            SELECT t.*, 
                   json_agg(json_build_object('id', d.id, 'name', d.name)) FILTER (WHERE d.id IS NOT NULL) as departments
            FROM t_p66738329_webapp_functionality.trainers t
            LEFT JOIN t_p66738329_webapp_functionality.trainer_departments td ON td.trainer_id = t.id
            LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.id = td.department_id
            WHERE t.is_active = true
        '''
        
        conditions = []
        params = []
        
        if department_id:
            conditions.append('td.department_id = %s')
            params.append(department_id)
        
        if difficulty:
            conditions.append('t.difficulty_level = %s')
            params.append(difficulty)
        
        if conditions:
            base_query += ' AND ' + ' AND '.join(conditions)
        
        base_query += ' GROUP BY t.id ORDER BY t.created_at DESC'
        cur.execute(base_query, tuple(params))
        trainers = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps([dict(t) for t in trainers], default=str)
        }
    
    # POST /trainers
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        title = body.get('title')
        description = body.get('description', '')
        content = body.get('content', '')
        difficulty_level = body.get('difficulty_level', 'Начальный')
        department_ids = body.get('department_ids', [])
        
        if not title:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Title is required'})
            }
        
        valid_levels = ['Начальный', 'Средний', 'Продвинутый']
        if difficulty_level not in valid_levels:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Invalid difficulty level'})
            }
        
        cur.execute('''
            INSERT INTO t_p66738329_webapp_functionality.trainers 
            (title, description, content, difficulty_level, created_by)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, title, description, content, difficulty_level, is_active, created_at
        ''', (title, description, content, difficulty_level, user_id))
        
        trainer = cur.fetchone()
        trainer_id = trainer['id']
        
        if department_ids:
            for dept_id in department_ids:
                cur.execute('''
                    INSERT INTO t_p66738329_webapp_functionality.trainer_departments 
                    (trainer_id, department_id) VALUES (%s, %s)
                ''', (trainer_id, dept_id))
        
        conn.commit()
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(trainer), default=str)
        }
    
    # PUT /trainers
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        trainer_id = body.get('id')
        
        if not trainer_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Trainer ID is required'})
            }
        
        updates = []
        params = []
        
        if 'title' in body:
            updates.append('title = %s')
            params.append(body['title'])
        if 'description' in body:
            updates.append('description = %s')
            params.append(body['description'])
        if 'content' in body:
            updates.append('content = %s')
            params.append(body['content'])
        if 'difficulty_level' in body:
            valid_levels = ['Начальный', 'Средний', 'Продвинутый']
            if body['difficulty_level'] not in valid_levels:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid difficulty level'})
                }
            updates.append('difficulty_level = %s')
            params.append(body['difficulty_level'])
        if 'is_active' in body:
            updates.append('is_active = %s')
            params.append(body['is_active'])
        
        updates.append('updated_at = NOW()')
        params.append(trainer_id)
        
        cur.execute(f'''
            UPDATE t_p66738329_webapp_functionality.trainers
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id, title, description, content, difficulty_level, is_active, updated_at
        ''', tuple(params))
        
        trainer = cur.fetchone()
        
        if 'department_ids' in body:
            cur.execute('DELETE FROM t_p66738329_webapp_functionality.trainer_departments WHERE trainer_id = %s', (trainer_id,))
            for dept_id in body['department_ids']:
                cur.execute('''
                    INSERT INTO t_p66738329_webapp_functionality.trainer_departments 
                    (trainer_id, department_id) VALUES (%s, %s)
                ''', (trainer_id, dept_id))
        
        conn.commit()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(trainer), default=str)
        }
    
    # DELETE /trainers
    elif method == 'DELETE':
        query_params = event.get('queryStringParameters') or {}
        trainer_id = query_params.get('id')
        
        if not trainer_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Trainer ID is required'})
            }
        
        cur.execute('''
            UPDATE t_p66738329_webapp_functionality.trainers
            SET is_active = false, updated_at = NOW()
            WHERE id = %s
        ''', (trainer_id,))
        
        conn.commit()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Trainer deactivated'})
        }

def handle_progress(event: Dict[str, Any], user_id: int, conn, cur) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    progress_type = query_params.get('type', 'course')
    
    # GET /progress
    if method == 'GET':
        target_user_id = query_params.get('user_id')
        
        if progress_type == 'course':
            if target_user_id:
                cur.execute('''
                    SELECT cp.*, c.title, c.description, c.duration_hours
                    FROM t_p66738329_webapp_functionality.course_progress cp
                    INNER JOIN t_p66738329_webapp_functionality.courses c ON c.id = cp.course_id
                    WHERE cp.user_id = %s
                    ORDER BY cp.updated_at DESC
                ''', (target_user_id,))
            else:
                cur.execute('''
                    SELECT cp.*, c.title, c.description, c.duration_hours,
                           u.username, u.full_name, d.name as department_name
                    FROM t_p66738329_webapp_functionality.course_progress cp
                    INNER JOIN t_p66738329_webapp_functionality.courses c ON c.id = cp.course_id
                    INNER JOIN t_p66738329_webapp_functionality.users u ON u.id = cp.user_id
                    LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.id = u.department_id
                    ORDER BY cp.updated_at DESC
                ''')
        else:
            if target_user_id:
                cur.execute('''
                    SELECT tp.*, t.title, t.description, t.difficulty_level
                    FROM t_p66738329_webapp_functionality.trainer_progress tp
                    INNER JOIN t_p66738329_webapp_functionality.trainers t ON t.id = tp.trainer_id
                    WHERE tp.user_id = %s
                    ORDER BY tp.updated_at DESC
                ''', (target_user_id,))
            else:
                cur.execute('''
                    SELECT tp.*, t.title, t.description, t.difficulty_level,
                           u.username, u.full_name, d.name as department_name
                    FROM t_p66738329_webapp_functionality.trainer_progress tp
                    INNER JOIN t_p66738329_webapp_functionality.trainers t ON t.id = tp.trainer_id
                    INNER JOIN t_p66738329_webapp_functionality.users u ON u.id = tp.user_id
                    LEFT JOIN t_p66738329_webapp_functionality.departments d ON d.id = u.department_id
                    ORDER BY tp.updated_at DESC
                ''')
        
        progress = cur.fetchall()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps([dict(p) for p in progress], default=str)
        }
    
    # POST /progress
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        item_id = body.get('item_id')
        
        if not item_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'item_id is required'})
            }
        
        if progress_type == 'course':
            cur.execute('''
                SELECT id FROM t_p66738329_webapp_functionality.course_progress
                WHERE user_id = %s AND course_id = %s
            ''', (user_id, item_id))
            
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Course already started'})
                }
            
            cur.execute('''
                INSERT INTO t_p66738329_webapp_functionality.course_progress
                (user_id, course_id, status, progress_percentage)
                VALUES (%s, %s, 'В процессе', 0)
                RETURNING *
            ''', (user_id, item_id))
        else:
            cur.execute('''
                SELECT id FROM t_p66738329_webapp_functionality.trainer_progress
                WHERE user_id = %s AND trainer_id = %s
            ''', (user_id, item_id))
            
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Trainer already started'})
                }
            
            cur.execute('''
                INSERT INTO t_p66738329_webapp_functionality.trainer_progress
                (user_id, trainer_id, status, score)
                VALUES (%s, %s, 'В процессе', 0)
                RETURNING *
            ''', (user_id, item_id))
        
        progress = cur.fetchone()
        conn.commit()
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(progress), default=str)
        }
    
    # PUT /progress
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        progress_id = body.get('id')
        
        if not progress_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Progress ID is required'})
            }
        
        if progress_type == 'course':
            updates = []
            params = []
            
            if 'progress_percentage' in body:
                updates.append('progress_percentage = %s')
                params.append(body['progress_percentage'])
            
            if 'status' in body:
                updates.append('status = %s')
                params.append(body['status'])
            
            if 'completed_at' in body:
                updates.append('completed_at = NOW()')
            
            updates.append('updated_at = NOW()')
            params.append(progress_id)
            params.append(user_id)
            
            cur.execute(f'''
                UPDATE t_p66738329_webapp_functionality.course_progress
                SET {', '.join(updates)}
                WHERE id = %s AND user_id = %s
                RETURNING *
            ''', tuple(params))
        else:
            updates = []
            params = []
            
            if 'score' in body:
                updates.append('score = %s')
                params.append(body['score'])
            
            if 'status' in body:
                updates.append('status = %s')
                params.append(body['status'])
            
            if 'completed_at' in body:
                updates.append('completed_at = NOW()')
            
            updates.append('updated_at = NOW()')
            params.append(progress_id)
            params.append(user_id)
            
            cur.execute(f'''
                UPDATE t_p66738329_webapp_functionality.trainer_progress
                SET {', '.join(updates)}
                WHERE id = %s AND user_id = %s
                RETURNING *
            ''', tuple(params))
        
        progress = cur.fetchone()
        
        if not progress:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Progress not found'})
            }
        
        conn.commit()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(progress), default=str)
        }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    headers: Dict[str, str] = event.get('headers', {})
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Check authentication
    user_id = get_user_id_from_headers(headers)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Route based on query parameter 'resource'
        query_params = event.get('queryStringParameters') or {}
        resource = query_params.get('resource', 'courses')
        
        if resource == 'courses':
            return handle_courses(event, user_id, conn, cur)
        elif resource == 'trainers':
            return handle_trainers(event, user_id, conn, cur)
        elif resource == 'progress':
            return handle_progress(event, user_id, conn, cur)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid resource. Use: courses, trainers, or progress'})
            }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()