const express = require("express");
const mysql = require("mysql2");
const bcrypt = require('bcrypt');
const cors = require('cors');
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
    } else {
      console.log("Connected to MySQL database");
    }
  });



app.get("/", (req, res) => {
  res.send("Welcome to the API");
}
);


app.post('/api/signup', async (req, res) => {
    const { name, phone, password, userType } = req.body;
  
    if (!name || !phone || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
      const userId = uuidv4(); // Generates a unique ID

      const table = userType === 'parent' ? 'parents' : 'children';
      const query = `INSERT INTO ${table} (id, name, phone_number, password) VALUES (?, ?, ?, ?)`;
  
      db.query(query, [userId, name, phone, hashedPassword], (err, result) => {
        if (err) {
          console.error('MySQL insert error:', err);
          return res.status(500).json({ message: 'Failed to register user' });
        }
  
        return res.status(200).json({ message: 'User registered successfully' });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });


  app.post('/api/login', (req, res) => {
    const { phone, password, userType } = req.body;
  
    if (!phone || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    const table = userType === 'parent' ? 'parents' : 'children';
    const idField = userType === 'parent' ? 'parent_id' : 'child_id';
  
    const query = `SELECT * FROM ${table} WHERE phone_number = ? LIMIT 1`;
  
    db.query(query, [phone], async (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid phone number or password' });
      }
  
      const user = results[0];
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid phone number or password' });
      }
  
      // ✅ Generate JWT token
      const token = jwt.sign(
        { userId: user[idField], userType },
        SECRET_KEY,
        { expiresIn: '30d' }
      );
  
      // ✅ Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // true if using HTTPS
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });
  
      // ✅ Send response only with parentId if user is parent
      const responsePayload = {
        message: 'Login successful',
        name: user.name,
        userType,
      };
  
      
        console.log(user.id);
        responsePayload.id = user.id;
  
  
      return res.status(200).json(responsePayload);
    });
  });
  



  app.post('/api/add-task', (req, res) => {
    const { name, description, dueDate, xp, parent_id } = req.body;
  
    if (!name || !xp) {
      return res.status(400).json({ message: 'Task name and XP are required' });
    }
  
    const taskId = uuidv4(); // optional, if you're using UUIDs; skip if using AUTO_INCREMENT
    const status = "pending"
    const query = 'INSERT INTO tasks (id, name, description, due_date, xp, status, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
    db.query(query, [taskId, name, description || '', dueDate || null, xp, status, parent_id], (err, result) => {
      if (err) {
        console.error('MySQL insert error:', err);
        return res.status(500).json({ message: 'Failed to add task' });
      }
  
      return res.status(201).json({ message: 'Task added successfully', taskId });
    });
  });


  app.get('/api/tasks', (req, res) => {
    const status = req.query.status;
  
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
  
    const query = 'SELECT * FROM tasks WHERE status = ?';
    db.query(query, [status], (err, results) => {
      if (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      res.json({ tasks: results });
    });
  });
  

  app.delete('/api/delete-task/:id', (req, res) => {
    const taskId = req.params.id;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [taskId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Task deleted successfully' });
    });
  });
  

  app.get('/api/children/tasks/:childId', (req, res) => {
    const childId = req.params.childId;
    if (!childId) {
      return res.status(400).json({ message: 'Child ID is required' });
    }
    const childPhoneQuery = `SELECT phone_number FROM children WHERE id = ?`;
  
    db.query(childPhoneQuery, [childId], (err, childResults) => {
      if (err) {
        console.error('Error fetching child:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (childResults.length === 0) {
        return res.status(404).json({ message: 'Child not found' });
      }
  
      const childPhone = childResults[0].phone_number;
      const parentQuery = `SELECT id FROM parents WHERE phone_number = ?`;
  
      db.query(parentQuery, [childPhone], (err, parentResults) => {
        if (err) {
          console.error('Error fetching parent:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        if (parentResults.length === 0) {
          return res.status(404).json({ message: 'Parent not found for this child' });
        }
        
        const parentId = parentResults[0].id;
        const taskQuery = `SELECT * FROM tasks WHERE parent_id = ?`;
  
        db.query(taskQuery, [parentId], (err, taskResults) => {
          if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ message: 'Internal server error' });
          }
  
          return res.status(200).json({ tasks: taskResults });
        });
      });
    });
  });
  
  
 
  app.patch('/api/tasks/:taskId/complete', (req, res) => {
    const { taskId } = req.params;
    const { childId } = req.body;
  
    if (!childId) {
      return res.status(400).json({ message: 'Child ID is required' });
    }
  
    // 1. Mark the task as completed
    db.query('UPDATE tasks SET status = ? WHERE id = ?', ['completed', taskId], (err, result) => {
      if (err) {
        console.error('Error updating task status:', err);
        return res.status(500).json({ message: 'Failed to update task status' });
      }
  
      // 2. Get XP from the task
      db.query('SELECT xp FROM tasks WHERE id = ?', [taskId], (err, results) => {
        if (err) {
          console.error('Error fetching task XP:', err);
          return res.status(500).json({ message: 'Failed to fetch task XP' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'Task not found' });
        }
  
        const xp = results[0].xp;
  
        // 3. Update XP for the child
        db.query(
          'UPDATE children SET xp_point = xp_point + ? WHERE id = ?',
          [xp, childId],
          (err, result) => {
            if (err) {
              console.error('Error updating child XP:', err);
              return res.status(500).json({ message: 'Failed to update child XP' });
            }
  
            res.json({ message: 'Task marked as completed and XP updated.' });
          }
        );
      });
    });
  });
  
  app.patch('/api/tasks/:taskId/review', async (req, res) => {
    const { taskId } = req.params;
  
    try {
      await db.query('UPDATE tasks SET status = ? WHERE id = ?', ['reviewed', taskId]);
      res.json({ message: 'Task marked as completed' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));