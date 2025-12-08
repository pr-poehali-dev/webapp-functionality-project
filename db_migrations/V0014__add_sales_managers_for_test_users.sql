-- Insert sales managers for test users
INSERT INTO t_p66738329_webapp_functionality.sales_managers 
(user_id, company_id, avatar, level, wins, losses, total_score, status)
SELECT 
    u.id,
    u.company_id,
    CASE 
        WHEN u.username = 'Анна Петрова' THEN 'АП'
        WHEN u.username = 'Игорь Смирнов' THEN 'ИС'
        WHEN u.username = 'Мария Козлова' THEN 'МК'
        WHEN u.username = 'Дмитрий Волков' THEN 'ДВ'
        WHEN u.username = 'Елена Новикова' THEN 'ЕН'
        WHEN u.username = 'Сергей Морозов' THEN 'СМ'
        WHEN u.username = 'Ольга Соколова' THEN 'ОС'
        WHEN u.username = 'Алексей Лебедев' THEN 'АЛ'
    END,
    CASE 
        WHEN u.username IN ('Анна Петрова', 'Елена Новикова') THEN 8
        WHEN u.username IN ('Игорь Смирнов', 'Сергей Морозов') THEN 7
        WHEN u.username = 'Мария Козлова' THEN 9
        WHEN u.username = 'Ольга Соколова' THEN 10
        ELSE 6
    END,
    CASE 
        WHEN u.username = 'Анна Петрова' THEN 24
        WHEN u.username = 'Игорь Смирнов' THEN 18
        WHEN u.username = 'Мария Козлова' THEN 31
        WHEN u.username = 'Дмитрий Волков' THEN 15
        WHEN u.username = 'Елена Новикова' THEN 22
        WHEN u.username = 'Сергей Морозов' THEN 19
        WHEN u.username = 'Ольга Соколова' THEN 35
        WHEN u.username = 'Алексей Лебедев' THEN 12
    END,
    CASE 
        WHEN u.username = 'Анна Петрова' THEN 6
        WHEN u.username = 'Игорь Смирнов' THEN 12
        WHEN u.username = 'Мария Козлова' THEN 4
        WHEN u.username = 'Дмитрий Волков' THEN 15
        WHEN u.username = 'Елена Новикова' THEN 8
        WHEN u.username = 'Сергей Морозов' THEN 11
        WHEN u.username = 'Ольга Соколова' THEN 2
        WHEN u.username = 'Алексей Лебедев' THEN 18
    END,
    0,
    'active'
FROM t_p66738329_webapp_functionality.users u
WHERE u.username IN ('Анна Петрова', 'Игорь Смирнов', 'Мария Козлова', 'Дмитрий Волков', 
                     'Елена Новикова', 'Сергей Морозов', 'Ольга Соколова', 'Алексей Лебедев');