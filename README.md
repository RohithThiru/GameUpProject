<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  
</head>
<body>

  <h1>📚 Task Management API</h1>
  <p>
    A Node.js backend to manage task assignments between parents and children. Parents assign tasks, children complete them, and earn XP points.
  </p>

  <h2>🚀 Features</h2>
  <ul>
    <li>User registration/login with JWT</li>
    <li>Role-based user types: <code>parent</code> and <code>child</code></li>
    <li>Task assignment, status updates, and XP tracking</li>
    <li>Secure password storage and protected routes</li>
  </ul>

  <h2>🛠 Tech Stack</h2>
  <ul>
    <li>Node.js, Express.js</li>
    <li>MySQL (mysql2)</li>
    <li>JWT, bcrypt, uuid, dotenv, cors</li>
  </ul>

  <h2>🔐 Environment Variables</h2>
  <pre><code>
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=task_management
  </code></pre>

  <h2>📦 Installation</h2>
  <pre><code>
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm start
  </code></pre>

  <h2>📁 API Endpoints</h2>

  <h3>Authentication</h3>

  <h4>POST /api/signup</h4>
  <p>Register new user (parent/child)</p>
  <pre><code>
{
  "name": "John",
  "phone": "1234567890",
  "password": "secret123",
  "userType": "parent"
}
  </code></pre>

  <h4>POST /api/login</h4>
  <p>Login user and receive JWT</p>
  <pre><code>
{
  "phone": "1234567890",
  "password": "secret123",
  "userType": "parent"
}
  </code></pre>

  <h3>Task Management</h3>

  <h4>POST /api/add-task</h4>
  <p>Add a new task</p>

  <h4>GET /api/tasks?status=pending</h4>
  <p>Fetch all tasks by status</p>

  <h4>DELETE /api/delete-task/:id</h4>
  <p>Delete a task by ID</p>

  <h3>Child Task Access</h3>

  <h4>GET /api/children/tasks/:childId</h4>
  <p>Get all tasks for a child</p>

  <h4>PATCH /api/tasks/:taskId/complete</h4>
  <p>Mark task completed by child</p>
  <pre><code>
{
  "childId": "uuid-of-child"
}
  </code></pre>

  <h4>PATCH /api/tasks/:taskId/review</h4>
  <p>Mark task as reviewed by parent</p>

  <h3>XP Tracking</h3>
  <h4>GET /api/children/:id</h4>
  <p>Get XP of a child</p>

  <h2>📊 Database Tables</h2>

  <h3>parents</h3>
  <pre><code>
CREATE TABLE parents (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  phone_number VARCHAR(20) UNIQUE,
  password VARCHAR(255)
);
  </code></pre>

  <h3>children</h3>
  <pre><code>
CREATE TABLE children (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  phone_number VARCHAR(20) UNIQUE,
  password VARCHAR(255),
  xp_point INT DEFAULT 0
);
  </code></pre>

  <h3>tasks</h3>
  <pre><code>
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  due_date DATE,
  xp INT,
  status ENUM('pending', 'completed', 'reviewed') DEFAULT 'pending',
  parent_id VARCHAR(255),
  child_id VARCHAR(255),
  FOREIGN KEY (parent_id) REFERENCES parents(id),
  FOREIGN KEY (child_id) REFERENCES children(id)
);
  </code></pre>

  <h2>🧪 Sample Flow</h2>
  <ol>
    <li>Parent signs up and logs in</li>
    <li>Child registers and logs in</li>
    <li>Parent adds a task for the child</li>
    <li>Child fetches and completes task</li>
    <li>XP added to child automatically</li>
    <li>Parent reviews task</li>
  </ol>

  <h2>🧑‍💻 Author</h2>
  <p>Created by <a href="https://github.com/RohithThiru" target="_blank">Rohith</a></p>
</body>
</html>
