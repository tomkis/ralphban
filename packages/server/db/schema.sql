DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT NOT NULL,
  state TEXT DEFAULT 'ReadyForDev' CHECK (state IN ('ReadyForDev', 'Done')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_state ON tasks(state);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
