DELETE FROM tasks;

INSERT INTO tasks (id, category, title, description, steps, state) VALUES
('FEAT-001', 'feat', 'Initialize empty javascript project', 'Initialize empty javascript project using pnpm init', '["Use pnpm init to create a new typescript project", "Create index file that logs hello world", "Add dev script to package json that would node start this"]', 'ReadyForDev')