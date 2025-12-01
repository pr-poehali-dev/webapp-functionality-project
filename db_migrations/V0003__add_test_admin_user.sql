-- Add test admin user for testing
-- Username: testadmin, Password: Test123!@#
INSERT INTO users (username, email, password_hash, full_name, role_id, is_blocked)
VALUES ('testadmin', 'testadmin@clinic.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY.y8p2W7Wg/lJq', 'Тестовый администратор', 1, FALSE);