-- Insert test users for sales managers (8 users for 2 companies)
INSERT INTO t_p66738329_webapp_functionality.users 
(username, email, password_hash, full_name, role_id, is_blocked, company_id) VALUES
('Анна Петрова', 'anna.petrova@company1.test', 'dummyhash', 'Анна Петрова', 4, false, 1),
('Игорь Смирнов', 'igor.smirnov@company1.test', 'dummyhash', 'Игорь Смирнов', 4, false, 1),
('Мария Козлова', 'maria.kozlova@company1.test', 'dummyhash', 'Мария Козлова', 4, false, 1),
('Дмитрий Волков', 'dmitry.volkov@company1.test', 'dummyhash', 'Дмитрий Волков', 4, false, 1),
('Елена Новикова', 'elena.novikova@company2.test', 'dummyhash', 'Елена Новикова', 4, false, 4),
('Сергей Морозов', 'sergey.morozov@company2.test', 'dummyhash', 'Сергей Морозов', 4, false, 4),
('Ольга Соколова', 'olga.sokolova@company2.test', 'dummyhash', 'Ольга Соколова', 4, false, 4),
('Алексей Лебедев', 'alexey.lebedev@company2.test', 'dummyhash', 'Алексей Лебедев', 4, false, 4);