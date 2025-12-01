-- Update admin password to properly hashed "admin123"
-- This uses bcrypt with cost factor 10
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY.y8p2W7Wg/lJq',
    updated_at = NOW()
WHERE username = 'admin';