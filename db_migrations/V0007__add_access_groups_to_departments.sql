-- Добавляем таблицу групп доступа (переименовываем роли в группы доступа)
ALTER TABLE roles RENAME TO access_groups;
ALTER TABLE access_groups RENAME COLUMN name TO group_name;

-- Переименовываем связанные таблицы
ALTER TABLE role_permissions RENAME TO access_group_permissions;
ALTER TABLE access_group_permissions RENAME COLUMN role_id TO access_group_id;

-- Добавляем связь группы доступа с подразделением
ALTER TABLE departments ADD COLUMN access_group_id INTEGER REFERENCES access_groups(id);

-- Обновляем права доступа
UPDATE permissions SET code = 'access_groups.view', name = 'Просмотр групп доступа' WHERE code = 'roles.view';
UPDATE permissions SET code = 'access_groups.create', name = 'Создание групп доступа' WHERE code = 'roles.create';
UPDATE permissions SET code = 'access_groups.edit', name = 'Редактирование групп доступа' WHERE code = 'roles.edit';
UPDATE permissions SET code = 'access_groups.remove', name = 'Удаление групп доступа' WHERE code = 'roles.remove';

-- Обновляем аудит лог
UPDATE audit_log SET action_type = 'access_groups.create' WHERE action_type = 'roles.create';
UPDATE audit_log SET action_type = 'access_groups.edit' WHERE action_type = 'roles.edit';
UPDATE audit_log SET action_type = 'access_groups.remove' WHERE action_type = 'roles.remove';
UPDATE audit_log SET entity_type = 'access_group' WHERE entity_type = 'role';

-- Назначаем группу доступа "Администратор" всем подразделениям по умолчанию
UPDATE departments SET access_group_id = (SELECT id FROM access_groups WHERE group_name = 'Администратор');