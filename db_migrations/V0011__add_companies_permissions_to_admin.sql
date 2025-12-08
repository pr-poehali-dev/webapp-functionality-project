-- Add companies permissions to Administrator group
INSERT INTO access_group_permissions (access_group_id, permission_id)
VALUES 
  (2, 28), -- companies.view
  (2, 29), -- companies.create
  (2, 30), -- companies.edit
  (2, 31)  -- companies.remove
ON CONFLICT DO NOTHING;