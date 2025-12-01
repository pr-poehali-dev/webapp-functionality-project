-- Таблица ролей (профилей прав)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица прав/разрешений
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь ролей и прав (многие ко многим)
CREATE TABLE role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id),
    permission_id INTEGER NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Таблица сессий для авторизации
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Индексы для оптимизации
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Вставка базовых разрешений
INSERT INTO permissions (code, name, description, category) VALUES
('users.view', 'Просмотр пользователей', 'Просмотр списка пользователей и их профилей', 'users'),
('users.create', 'Создание пользователей', 'Создание новых учетных записей', 'users'),
('users.edit', 'Редактирование пользователей', 'Изменение данных пользователей', 'users'),
('users.block', 'Блокировка пользователей', 'Блокировка и разблокировка учетных записей', 'users'),
('users.remove', 'Удаление пользователей', 'Удаление учетных записей', 'users'),
('roles.view', 'Просмотр ролей', 'Просмотр списка ролей и их настроек', 'roles'),
('roles.create', 'Создание ролей', 'Создание новых ролей', 'roles'),
('roles.edit', 'Редактирование ролей', 'Изменение настроек ролей и прав', 'roles'),
('roles.remove', 'Удаление ролей', 'Удаление ролей', 'roles'),
('courses.view', 'Просмотр курсов', 'Просмотр списка курсов', 'courses'),
('courses.create', 'Создание курсов', 'Создание новых курсов', 'courses'),
('courses.edit', 'Редактирование курсов', 'Изменение курсов', 'courses'),
('courses.remove', 'Удаление курсов', 'Удаление курсов', 'courses'),
('courses.assign', 'Назначение курсов', 'Назначение курсов пользователям', 'courses'),
('tests.view', 'Просмотр тестов', 'Просмотр списка тестов', 'tests'),
('tests.create', 'Создание тестов', 'Создание новых тестов', 'tests'),
('tests.edit', 'Редактирование тестов', 'Изменение тестов', 'tests'),
('tests.remove', 'Удаление тестов', 'Удаление тестов', 'tests'),
('tests.results', 'Просмотр результатов', 'Просмотр результатов тестов', 'tests'),
('trainers.view', 'Просмотр тренажеров', 'Просмотр списка тренажеров', 'trainers'),
('trainers.create', 'Создание тренажеров', 'Создание новых тренажеров', 'trainers'),
('trainers.edit', 'Редактирование тренажеров', 'Изменение тренажеров', 'trainers'),
('trainers.remove', 'Удаление тренажеров', 'Удаление тренажеров', 'trainers'),
('reports.view', 'Просмотр отчетов', 'Просмотр отчетов и статистики', 'reports'),
('reports.export', 'Экспорт отчетов', 'Экспорт отчетов в файлы', 'reports'),
('system.settings', 'Настройки системы', 'Доступ к системным настройкам', 'system'),
('system.logs', 'Системные логи', 'Просмотр логов системы', 'system');

-- Создание базовых ролей
INSERT INTO roles (name, description) VALUES
('Супер-администратор', 'Полный доступ ко всем функциям системы'),
('Администратор', 'Управление пользователями и контентом'),
('Менеджер обучения', 'Управление курсами и тестами'),
('Врач', 'Доступ к обучающим материалам'),
('Администратор клиники', 'Доступ к обучающим материалам и базовой аналитике');

-- Назначение всех прав супер-администратору
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Назначение прав администратору (все кроме системных настроек)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE category != 'system';

-- Назначение прав менеджеру обучения
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE category IN ('courses', 'tests', 'trainers', 'reports');

-- Назначение прав врачу (только просмотр)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code IN ('courses.view', 'tests.view', 'trainers.view');

-- Назначение прав администратору клиники
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE code IN ('courses.view', 'tests.view', 'trainers.view', 'reports.view', 'users.view');

-- Создание дефолтного суперадминистратора (пароль: admin123)
INSERT INTO users (username, email, password_hash, full_name, role_id, is_blocked)
VALUES ('admin', 'admin@clinic.local', '$2b$10$rW5HAXqXugFqYBVEQNfmVuKqN8YfXKZKBW2fVhZJOEqe4oHKKUJ6W', 'Системный администратор', 1, FALSE);