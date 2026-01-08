DELETE FROM tasks;

INSERT INTO tasks (id, category, title, description, steps, state) VALUES
('CHORE-008', 'chore', 'Setup Express server', 'Create basic Express server with health check endpoint and error handling middleware.', '["Create packages/server/src/index.ts", "Setup Express app with basic middleware", "Add health check endpoint GET /health", "Add error handling middleware"]', 'ReadyForDev'),
('FIX-001', 'fix', 'Fix database connection leak', 'Ensure database connections are properly closed after queries to prevent connection pool exhaustion.', '["Review db client usage", "Add connection release logic", "Test connection pooling"]', 'ReadyForDev'),
('REFACTOR-001', 'refactor', 'Extract database queries to repository', 'Move raw SQL queries from route handlers to repository layer for better separation of concerns.', '["Identify all inline queries", "Create repository methods", "Update handlers to use repository"]', 'Done'),
('TEST-001', 'test', 'Add integration tests for PRD repository', 'Create integration tests for PRD repository methods using test database.', '["Setup test database", "Write tests for getAllPRDs()", "Write tests for getPRDById()", "Write tests for getNextPendingPRD()"]', 'ReadyForDev'),
('DOCS-001', 'docs', 'Document database schema', 'Add documentation explaining database schema design decisions and relationships.', '["Create db/README.md", "Document table structure", "Document state transitions"]', 'Done');
