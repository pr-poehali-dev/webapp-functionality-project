-- Переводим категории разрешений на русский язык
UPDATE permissions SET category = 'Пользователи' WHERE category = 'users';
UPDATE permissions SET category = 'Система' WHERE category = 'system';
UPDATE permissions SET category = 'Курсы' WHERE category = 'courses';
UPDATE permissions SET category = 'Тесты' WHERE category = 'tests';
UPDATE permissions SET category = 'Тренажеры' WHERE category = 'trainers';
UPDATE permissions SET category = 'Отчеты' WHERE category = 'reports';
UPDATE permissions SET category = 'Группы доступа' WHERE category = 'roles';