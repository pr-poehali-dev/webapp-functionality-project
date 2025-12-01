'''
Business: Organization and learning management API - companies, departments, courses, trainers CRUD
Args: event with httpMethod, body, headers, path; context with request_id
Returns: HTTP response with companies/departments/courses/trainers data
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor, options='-c search_path=t_p66738329_webapp_functionality')

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
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN access_group_permissions agp ON agp.access_group_id = d.access_group_id
        LEFT JOIN access_group_permissions agp2 ON agp2.access_group_id = u.role_id
        LEFT JOIN permissions p ON p.id = COALESCE(agp.permission_id, agp2.permission_id)
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
        elif entity_type == 'course':
            return handle_courses(method, user, body_data, headers, cors_headers, event)
        elif entity_type == 'trainer':
            return handle_trainers(method, user, body_data, headers, cors_headers, event)
        elif entity_type == 'recommendations':
            return handle_recommendations(method, user, body_data, headers, cors_headers, event)
        elif entity_type == 'progress':
            return handle_progress(method, user, body_data, headers, cors_headers, event)
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

def calculate_text_similarity(text1, text2):
    """Calculate text similarity using word intersection/union ratio"""
    if not text1 or not text2:
        return 0.0
    
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    intersection = len(words1 & words2)
    union = len(words1 | words2)
    
    return intersection / union if union > 0 else 0.0

def handle_progress(method, user, body_data, headers, cors_headers, event):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            # Get user's progress
            query_params = event.get('queryStringParameters', {}) or {}
            target_user_id = int(query_params.get('user_id', user['id']))
            
            # Only allow users to view their own progress
            if target_user_id != user['id']:
                return {
                    'statusCode': 403,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Forbidden: Can only view own progress'}),
                    'isBase64Encoded': False
                }
            
            # Get course progress
            cur.execute('''
                SELECT 
                    cp.course_id,
                    c.title,
                    cp.status,
                    cp.progress_percent,
                    cp.started_at,
                    cp.completed_at,
                    cp.last_activity_at
                FROM t_p66738329_webapp_functionality.course_progress cp
                INNER JOIN t_p66738329_webapp_functionality.courses c ON c.id = cp.course_id
                WHERE cp.user_id = %s
                ORDER BY cp.last_activity_at DESC
            ''', (target_user_id,))
            courses = [dict(row) for row in cur.fetchall()]
            
            # Get trainer progress
            cur.execute('''
                SELECT 
                    tp.trainer_id,
                    t.name as title,
                    tp.status,
                    tp.progress_percent,
                    tp.started_at,
                    tp.completed_at,
                    tp.last_activity_at
                FROM t_p66738329_webapp_functionality.trainer_progress tp
                INNER JOIN t_p66738329_webapp_functionality.trainers t ON t.id = tp.trainer_id
                WHERE tp.user_id = %s
                ORDER BY tp.last_activity_at DESC
            ''', (target_user_id,))
            trainers = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'courses': courses, 'trainers': trainers}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Start or update progress
            progress_type = body_data.get('type')
            item_id = body_data.get('id')
            status = body_data.get('status', 'in_progress')
            progress_percent = body_data.get('progress_percent', 0)
            
            if not progress_type or not item_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Missing type or id'}),
                    'isBase64Encoded': False
                }
            
            if progress_type not in ['course', 'trainer']:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Invalid type. Must be course or trainer'}),
                    'isBase64Encoded': False
                }
            
            # Validate that course/trainer exists
            if progress_type == 'course':
                cur.execute('''
                    SELECT id FROM t_p66738329_webapp_functionality.courses WHERE id = %s
                ''', (item_id,))
            else:
                cur.execute('''
                    SELECT id FROM t_p66738329_webapp_functionality.trainers WHERE id = %s
                ''', (item_id,))
            
            if not cur.fetchone():
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'{progress_type.capitalize()} not found'}),
                    'isBase64Encoded': False
                }
            
            # Upsert progress
            if status == 'completed':
                progress_percent = 100
            
            if progress_type == 'course':
                if status == 'completed':
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.course_progress 
                            (user_id, course_id, status, progress_percent, started_at, last_activity_at, completed_at)
                        VALUES (%s, %s, %s, %s, NOW(), NOW(), NOW())
                        ON CONFLICT (user_id, course_id) 
                        DO UPDATE SET 
                            status = EXCLUDED.status,
                            progress_percent = EXCLUDED.progress_percent,
                            last_activity_at = NOW(),
                            completed_at = NOW()
                        RETURNING *
                    ''', (user['id'], item_id, status, progress_percent))
                else:
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.course_progress 
                            (user_id, course_id, status, progress_percent, started_at, last_activity_at)
                        VALUES (%s, %s, %s, %s, NOW(), NOW())
                        ON CONFLICT (user_id, course_id) 
                        DO UPDATE SET 
                            status = EXCLUDED.status,
                            progress_percent = EXCLUDED.progress_percent,
                            last_activity_at = NOW()
                        RETURNING *
                    ''', (user['id'], item_id, status, progress_percent))
            else:
                if status == 'completed':
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.trainer_progress 
                            (user_id, trainer_id, status, progress_percent, started_at, last_activity_at, completed_at)
                        VALUES (%s, %s, %s, %s, NOW(), NOW(), NOW())
                        ON CONFLICT (user_id, trainer_id) 
                        DO UPDATE SET 
                            status = EXCLUDED.status,
                            progress_percent = EXCLUDED.progress_percent,
                            last_activity_at = NOW(),
                            completed_at = NOW()
                        RETURNING *
                    ''', (user['id'], item_id, status, progress_percent))
                else:
                    cur.execute('''
                        INSERT INTO t_p66738329_webapp_functionality.trainer_progress 
                            (user_id, trainer_id, status, progress_percent, started_at, last_activity_at)
                        VALUES (%s, %s, %s, %s, NOW(), NOW())
                        ON CONFLICT (user_id, trainer_id) 
                        DO UPDATE SET 
                            status = EXCLUDED.status,
                            progress_percent = EXCLUDED.progress_percent,
                            last_activity_at = NOW()
                        RETURNING *
                    ''', (user['id'], item_id, status, progress_percent))
            
            progress_record = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(progress_record, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Reset progress
            progress_type = body_data.get('type')
            item_id = body_data.get('id')
            
            if not progress_type or not item_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Missing type or id'}),
                    'isBase64Encoded': False
                }
            
            if progress_type == 'course':
                cur.execute('''
                    DELETE FROM t_p66738329_webapp_functionality.course_progress 
                    WHERE user_id = %s AND course_id = %s
                ''', (user['id'], item_id))
            elif progress_type == 'trainer':
                cur.execute('''
                    DELETE FROM t_p66738329_webapp_functionality.trainer_progress 
                    WHERE user_id = %s AND trainer_id = %s
                ''', (user['id'], item_id))
            else:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Invalid type. Must be course or trainer'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'Progress reset successfully'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()

def handle_recommendations(method, user, body_data, headers, cors_headers, event):
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get user's department_id
        cur.execute('''
            SELECT u.id, u.department_id
            FROM t_p66738329_webapp_functionality.users u
            WHERE u.id = %s
        ''', (user['id'],))
        user_data = cur.fetchone()
        
        if not user_data:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        # Get completed courses
        cur.execute('''
            SELECT c.id, c.title, c.description, c.duration_hours
            FROM t_p66738329_webapp_functionality.course_progress cp
            INNER JOIN t_p66738329_webapp_functionality.courses c ON c.id = cp.course_id
            WHERE cp.user_id = %s AND cp.status = 'completed'
        ''', (user['id'],))
        completed_courses = [dict(row) for row in cur.fetchall()]
        
        # Get completed trainers
        cur.execute('''
            SELECT t.id, t.name, t.specialization, t.difficulty_level
            FROM t_p66738329_webapp_functionality.trainer_progress tp
            INNER JOIN t_p66738329_webapp_functionality.trainers t ON t.id = tp.trainer_id
            WHERE tp.user_id = %s AND tp.status = 'completed'
        ''', (user['id'],))
        completed_trainers = [dict(row) for row in cur.fetchall()]
        
        # Get available courses (not completed)
        completed_course_ids = [c['id'] for c in completed_courses]
        if completed_course_ids:
            placeholders = ','.join(['%s'] * len(completed_course_ids))
            cur.execute(f'''
                SELECT id, title, description, duration_hours, category
                FROM t_p66738329_webapp_functionality.courses
                WHERE id NOT IN ({placeholders}) AND is_active = true
            ''', completed_course_ids)
        else:
            cur.execute('''
                SELECT id, title, description, duration_hours, category
                FROM t_p66738329_webapp_functionality.courses
                WHERE is_active = true
            ''')
        available_courses = [dict(row) for row in cur.fetchall()]
        
        # Get available trainers (not completed)
        completed_trainer_ids = [t['id'] for t in completed_trainers]
        if completed_trainer_ids:
            placeholders = ','.join(['%s'] * len(completed_trainer_ids))
            cur.execute(f'''
                SELECT id, name, specialization, difficulty_level, bio
                FROM t_p66738329_webapp_functionality.trainers
                WHERE id NOT IN ({placeholders}) AND is_active = true
            ''', completed_trainer_ids)
        else:
            cur.execute('''
                SELECT id, name, specialization, difficulty_level, bio
                FROM t_p66738329_webapp_functionality.trainers
                WHERE is_active = true
            ''')
        available_trainers = [dict(row) for row in cur.fetchall()]
        
        # Calculate recommendations
        course_recommendations = []
        trainer_recommendations = []
        
        if not completed_courses and not completed_trainers:
            # Beginner-friendly recommendations
            for course in available_courses:
                score = 0
                reasons = []
                
                if course.get('duration_hours', 999) <= 10:
                    score += 5
                    reasons.append('Short duration - beginner friendly')
                
                if 'beginner' in (course.get('title', '') + ' ' + course.get('description', '')).lower():
                    score += 10
                    reasons.append('Beginner level content')
                
                if 'introduction' in (course.get('title', '') + ' ' + course.get('description', '')).lower():
                    score += 8
                    reasons.append('Introductory course')
                
                course_recommendations.append({
                    'id': course['id'],
                    'title': course['title'],
                    'description': course.get('description', ''),
                    'duration_hours': course.get('duration_hours'),
                    'score': score + 1,  # Base score for all
                    'reasons': reasons if reasons else ['Great starting point']
                })
            
            for trainer in available_trainers:
                score = 0
                reasons = []
                
                if trainer.get('difficulty_level', '').lower() in ['beginner', 'easy']:
                    score += 10
                    reasons.append('Beginner-friendly trainer')
                
                if 'introduction' in (trainer.get('name', '') + ' ' + trainer.get('specialization', '')).lower():
                    score += 5
                    reasons.append('Introductory training')
                
                trainer_recommendations.append({
                    'id': trainer['id'],
                    'name': trainer['name'],
                    'specialization': trainer.get('specialization', ''),
                    'difficulty_level': trainer.get('difficulty_level', ''),
                    'score': score + 1,  # Base score for all
                    'reasons': reasons if reasons else ['Recommended for new learners']
                })
        else:
            # AI-based recommendations using similarity
            for course in available_courses:
                score = 0
                reasons = []
                course_text = (course.get('title', '') + ' ' + course.get('description', '')).lower()
                
                # Compare with completed courses
                for completed_course in completed_courses:
                    completed_text = (completed_course.get('title', '') + ' ' + completed_course.get('description', '')).lower()
                    similarity = calculate_text_similarity(course_text, completed_text)
                    if similarity > 0.1:
                        score += 10 * similarity
                        reasons.append(f'Similar to "{completed_course["title"]}"')
                
                # Compare with completed trainers
                for completed_trainer in completed_trainers:
                    trainer_text = (completed_trainer.get('name', '') + ' ' + completed_trainer.get('specialization', '')).lower()
                    similarity = calculate_text_similarity(course_text, trainer_text)
                    if similarity > 0.1:
                        score += 5 * similarity
                        reasons.append(f'Matches trainer: {completed_trainer["name"]}')
                
                # Bonus for short duration
                if course.get('duration_hours', 999) <= 20:
                    score += 2
                    reasons.append('Manageable duration')
                
                if score > 0:
                    course_recommendations.append({
                        'id': course['id'],
                        'title': course['title'],
                        'description': course.get('description', ''),
                        'duration_hours': course.get('duration_hours'),
                        'score': round(score, 2),
                        'reasons': reasons[:3]  # Top 3 reasons
                    })
            
            for trainer in available_trainers:
                score = 0
                reasons = []
                trainer_text = (trainer.get('name', '') + ' ' + trainer.get('specialization', '')).lower()
                
                # Compare with completed trainers
                for completed_trainer in completed_trainers:
                    completed_text = (completed_trainer.get('name', '') + ' ' + completed_trainer.get('specialization', '')).lower()
                    similarity = calculate_text_similarity(trainer_text, completed_text)
                    if similarity > 0.1:
                        score += 10 * similarity
                        reasons.append(f'Similar to "{completed_trainer["name"]}"')
                
                # Compare with completed courses
                for completed_course in completed_courses:
                    course_text = (completed_course.get('title', '') + ' ' + completed_course.get('description', '')).lower()
                    similarity = calculate_text_similarity(trainer_text, course_text)
                    if similarity > 0.1:
                        score += 8 * similarity
                        reasons.append(f'Matches course: {completed_course["title"]}')
                
                # Bonus for matching difficulty level
                if completed_trainers:
                    most_common_level = completed_trainers[-1].get('difficulty_level', '')
                    if trainer.get('difficulty_level', '') == most_common_level:
                        score += 3
                        reasons.append(f'Matches your level: {most_common_level}')
                
                if score > 0:
                    trainer_recommendations.append({
                        'id': trainer['id'],
                        'name': trainer['name'],
                        'specialization': trainer.get('specialization', ''),
                        'difficulty_level': trainer.get('difficulty_level', ''),
                        'score': round(score, 2),
                        'reasons': reasons[:3]  # Top 3 reasons
                    })
        
        # Sort by score and get top 5
        course_recommendations.sort(key=lambda x: x['score'], reverse=True)
        trainer_recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        top_courses = course_recommendations[:5]
        top_trainers = trainer_recommendations[:5]
        
        result = {
            'courses': top_courses,
            'trainers': top_trainers,
            'stats': {
                'completed_courses': len(completed_courses),
                'completed_trainers': len(completed_trainers)
            }
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(result, default=str),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        cur.close()
        conn.close()
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
                SELECT d.id, d.company_id, d.name, d.description, d.access_group_id, d.is_active, 
                       d.created_at, d.updated_at, c.name as company_name, ag.group_name as access_group_name,
                       COUNT(DISTINCT u.id) as users_count
                FROM departments d
                INNER JOIN companies c ON c.id = d.company_id
                LEFT JOIN access_groups ag ON ag.id = d.access_group_id
                LEFT JOIN users u ON u.department_id = d.id
                WHERE d.company_id = %s
                GROUP BY d.id, d.company_id, d.name, d.description, d.access_group_id, d.is_active, 
                         d.created_at, d.updated_at, c.name, ag.group_name
                ORDER BY d.name
            ''', (company_id,))
        else:
            cur.execute('''
                SELECT d.id, d.company_id, d.name, d.description, d.access_group_id, d.is_active,
                       d.created_at, d.updated_at, c.name as company_name, ag.group_name as access_group_name,
                       COUNT(DISTINCT u.id) as users_count
                FROM departments d
                INNER JOIN companies c ON c.id = d.company_id
                LEFT JOIN access_groups ag ON ag.id = d.access_group_id
                LEFT JOIN users u ON u.department_id = d.id
                GROUP BY d.id, d.company_id, d.name, d.description, d.access_group_id, d.is_active,
                         d.created_at, d.updated_at, c.name, ag.group_name
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
        access_group_id = body_data.get('access_group_id')
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
            INSERT INTO departments (company_id, name, description, access_group_id, is_active)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, company_id, name, description, access_group_id, is_active, created_at, updated_at
        ''', (company_id, name, description, access_group_id, is_active))
        
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
        access_group_id = body_data.get('access_group_id')
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
            SET company_id = %s, name = %s, description = %s, access_group_id = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, company_id, name, description, access_group_id, is_active, created_at, updated_at
        ''', (company_id, name, description, access_group_id, is_active, department_id))
        
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

def handle_courses(method, user, body_data, headers, cors_headers, event):
    if method == 'GET':
        if not has_permission(user['id'], 'courses.view'):
            return {'statusCode': 403, 'headers': cors_headers, 'body': json.dumps({'error': 'Permission denied'}), 'isBase64Encoded': False}
        
        query_params = event.get('queryStringParameters', {}) or {}
        course_id = query_params.get('id')
        conn = get_db_connection()
        cur = conn.cursor()
        
        if course_id:
            cur.execute('SELECT c.*, u.full_name as creator_name FROM courses c LEFT JOIN users u ON u.id = c.created_by WHERE c.id = %s', (course_id,))
            course = cur.fetchone()
            if not course:
                cur.close()
                conn.close()
                return {'statusCode': 404, 'headers': cors_headers, 'body': json.dumps({'error': 'Not found'}), 'isBase64Encoded': False}
            course = dict(course)
            cur.execute('SELECT d.id, d.name, c.name as company_name FROM course_departments cd INNER JOIN departments d ON d.id = cd.department_id INNER JOIN companies c ON c.id = d.company_id WHERE cd.course_id = %s', (course_id,))
            course['departments'] = [dict(r) for r in cur.fetchall()]
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'course': course}, default=str), 'isBase64Encoded': False}
        
        cur.execute('SELECT c.id, c.title, c.description, c.duration_hours, c.is_active, c.created_at, u.full_name as creator_name, COUNT(DISTINCT cd.department_id) as departments_count FROM courses c LEFT JOIN users u ON u.id = c.created_by LEFT JOIN course_departments cd ON cd.course_id = c.id GROUP BY c.id, c.title, c.description, c.duration_hours, c.is_active, c.created_at, u.full_name ORDER BY c.created_at DESC')
        courses = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'courses': courses}, default=str), 'isBase64Encoded': False}
    
    elif method == 'POST':
        if not has_permission(user['id'], 'courses.create'):
            return {'statusCode': 403, 'headers': cors_headers, 'body': json.dumps({'error': 'Permission denied'}), 'isBase64Encoded': False}
        title = body_data.get('title', '').strip()
        if not title:
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Title required'}), 'isBase64Encoded': False}
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO courses (title, description, content, duration_hours, is_active, created_by) VALUES (%s, %s, %s, %s, %s, %s) RETURNING *', 
                    (title, body_data.get('description', ''), body_data.get('content', ''), body_data.get('duration_hours'), body_data.get('is_active', True), user['id']))
        course = dict(cur.fetchone())
        for dept_id in body_data.get('department_ids', []):
            cur.execute('INSERT INTO course_departments (course_id, department_id) VALUES (%s, %s)', (course['id'], dept_id))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 201, 'headers': cors_headers, 'body': json.dumps({'course': course}, default=str), 'isBase64Encoded': False}
    
    elif method == 'PUT':
        if not has_permission(user['id'], 'courses.edit'):
            return {'statusCode': 403, 'headers': cors_headers, 'body': json.dumps({'error': 'Permission denied'}), 'isBase64Encoded': False}
        course_id = body_data.get('id')
        title = body_data.get('title', '').strip()
        if not course_id or not title:
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'ID and title required'}), 'isBase64Encoded': False}
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE courses SET title=%s, description=%s, content=%s, duration_hours=%s, is_active=%s WHERE id=%s RETURNING *',
                    (title, body_data.get('description'), body_data.get('content'), body_data.get('duration_hours'), body_data.get('is_active'), course_id))
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': cors_headers, 'body': json.dumps({'error': 'Not found'}), 'isBase64Encoded': False}
        course = dict(cur.fetchone())
        if 'department_ids' in body_data:
            cur.execute('UPDATE course_departments SET course_id = NULL WHERE course_id = %s', (course_id,))
            for dept_id in body_data['department_ids']:
                cur.execute('INSERT INTO course_departments (course_id, department_id) VALUES (%s, %s) ON CONFLICT DO NOTHING', (course_id, dept_id))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'course': course}, default=str), 'isBase64Encoded': False}

def handle_trainers(method, user, body_data, headers, cors_headers, event):
    if method == 'GET':
        if not has_permission(user['id'], 'trainers.view'):
            return {'statusCode': 403, 'headers': cors_headers, 'body': json.dumps({'error': 'Permission denied'}), 'isBase64Encoded': False}
        query_params = event.get('queryStringParameters', {}) or {}
        trainer_id = query_params.get('id')
        conn = get_db_connection()
        cur = conn.cursor()
        
        if trainer_id:
            cur.execute('SELECT t.*, u.full_name as creator_name FROM trainers t LEFT JOIN users u ON u.id = t.created_by WHERE t.id = %s', (trainer_id,))
            trainer = cur.fetchone()
            if not trainer:
                cur.close()
                conn.close()
                return {'statusCode': 404, 'headers': cors_headers, 'body': json.dumps({'error': 'Not found'}), 'isBase64Encoded': False}
            trainer = dict(trainer)
            cur.execute('SELECT d.id, d.name, c.name as company_name FROM trainer_departments td INNER JOIN departments d ON d.id = td.department_id INNER JOIN companies c ON c.id = d.company_id WHERE td.trainer_id = %s', (trainer_id,))
            trainer['departments'] = [dict(r) for r in cur.fetchall()]
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'trainer': trainer}, default=str), 'isBase64Encoded': False}
        
        cur.execute('SELECT t.id, t.title, t.description, t.difficulty_level, t.is_active, t.created_at, u.full_name as creator_name, COUNT(DISTINCT td.department_id) as departments_count FROM trainers t LEFT JOIN users u ON u.id = t.created_by LEFT JOIN trainer_departments td ON td.trainer_id = t.id GROUP BY t.id, t.title, t.description, t.difficulty_level, t.is_active, t.created_at, u.full_name ORDER BY t.created_at DESC')
        trainers = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'trainers': trainers}, default=str), 'isBase64Encoded': False}
    
    elif method == 'POST':
        if not has_permission(user['id'], 'trainers.create'):
            return {'statusCode': 403, 'headers': cors_headers, 'body': json.dumps({'error': 'Permission denied'}), 'isBase64Encoded': False}
        title = body_data.get('title', '').strip()
        if not title:
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Title required'}), 'isBase64Encoded': False}
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO trainers (title, description, content, difficulty_level, is_active, created_by) VALUES (%s, %s, %s, %s, %s, %s) RETURNING *',
                    (title, body_data.get('description', ''), body_data.get('content', ''), body_data.get('difficulty_level', ''), body_data.get('is_active', True), user['id']))
        trainer = dict(cur.fetchone())
        for dept_id in body_data.get('department_ids', []):
            cur.execute('INSERT INTO trainer_departments (trainer_id, department_id) VALUES (%s, %s)', (trainer['id'], dept_id))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 201, 'headers': cors_headers, 'body': json.dumps({'trainer': trainer}, default=str), 'isBase64Encoded': False}
    
    elif method == 'PUT':
        if not has_permission(user['id'], 'trainers.edit'):
            return {'statusCode': 403, 'headers': cors_headers, 'body': json.dumps({'error': 'Permission denied'}), 'isBase64Encoded': False}
        trainer_id = body_data.get('id')
        title = body_data.get('title', '').strip()
        if not trainer_id or not title:
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'ID and title required'}), 'isBase64Encoded': False}
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE trainers SET title=%s, description=%s, content=%s, difficulty_level=%s, is_active=%s WHERE id=%s RETURNING *',
                    (title, body_data.get('description'), body_data.get('content'), body_data.get('difficulty_level'), body_data.get('is_active'), trainer_id))
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': cors_headers, 'body': json.dumps({'error': 'Not found'}), 'isBase64Encoded': False}
        trainer = dict(cur.fetchone())
        if 'department_ids' in body_data:
            cur.execute('UPDATE trainer_departments SET trainer_id = NULL WHERE trainer_id = %s', (trainer_id,))
            for dept_id in body_data['department_ids']:
                cur.execute('INSERT INTO trainer_departments (trainer_id, department_id) VALUES (%s, %s) ON CONFLICT DO NOTHING', (trainer_id, dept_id))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'trainer': trainer}, default=str), 'isBase64Encoded': False}