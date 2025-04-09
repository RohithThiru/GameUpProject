import React, { useState, useEffect } from 'react';
import TaskSection from '../components/TaskSection';
import { Task, TaskStatus } from '../types/Task';
import './ParentDashboard.css';

const ParentDashboard: React.FC = () => {
  const [xp, setXp] = useState<number>(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<TaskStatus>('pending');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    dueDate: '',
    xp: ''
  });

  const fetchTasks = async (status: TaskStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tasks?status=${status}`);
      const data = await res.json();

      if (res.ok) {
        const formattedTasks = data.tasks.map((task: any) => ({
          id: task.id,
          title: task.name,
          description: task.description,
          dueDate: task.due_date,
          xp: task.xp,
          status: task.status
        }));

        setTasks(formattedTasks);
        const totalXp = formattedTasks.reduce((sum: number, t: Task) => sum + t.xp, 0);
        setXp(totalXp);
      } else {
        console.error('Failed to fetch tasks:', data.error);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks(activeTab);
  }, [activeTab]);

  const handleAddTaskClick = () => setShowModal(true);

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { name, description, dueDate, xp: taskXp } = newTask;

    if (name && taskXp) {
      try {
        const response = await fetch('http://localhost:5000/api/add-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            dueDate,
            xp: parseInt(taskXp),
            parent_id: localStorage.getItem('parentId')
          })
        });

        const data = await response.json();
        if (response.ok) {
          fetchTasks(activeTab);
          setShowModal(false);
          setNewTask({ name: '', description: '', dueDate: '', xp: '' });
        } else {
          alert('Failed to add task: ' + data.error);
        }
      } catch (error) {
        console.error('Error submitting task:', error);
        alert('Something went wrong while submitting the task.');
      }
    }
  };

  const handleMarkAsReviewed = async (taskId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'reviewed' })
      });

      if (res.ok) {
        fetchTasks(activeTab);
      } else {
        const data = await res.json();
        alert('Failed to update task status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Something went wrong while updating the task.');
    }
  };

  const handleDelete = async (taskId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/delete-task/${taskId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        const data = await res.json();
        alert('Failed to delete task: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Something went wrong while deleting the task.');
    }
  };

  return (
    <div className="bg-black text-white min-h-screen px-4 py-6 page">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6 top">
          <div className="text-xl font-semibold">
            XP: <span className="text-green-400">{xp}</span>
          </div>
          <button
            onClick={handleAddTaskClick}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium transition"
          >
            Add Task
          </button>
        </div>

        <div className="tab-row">
          {(['pending', 'completed', 'reviewed'] as TaskStatus[]).map((status) => (
            <div
              key={status}
              onClick={() => setActiveTab(status)}
              className={`tab-item ${activeTab === status ? 'active' : ''} h4`}
            >
              {status}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center mt-10">Loading tasks...</div>
        ) : (
          <TaskSection
            title={activeTab}
            tasks={tasks}
            handleDelete={handleDelete}
            handleMarkAsReviewed={handleMarkAsReviewed}
          />
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content bg-dark text-white">
            <h3 className="mb-3">Add New Task</h3>

            <input
              type="text"
              name="name"
              placeholder="Task Name"
              className="modal-input"
              value={newTask.name}
              onChange={handleModalInputChange}
            />

            <textarea
              name="description"
              placeholder="Description"
              className="modal-input"
              rows={3}
              value={newTask.description}
              onChange={handleModalInputChange}
            />

            <input
              type="date"
              name="dueDate"
              className="modal-input"
              value={newTask.dueDate}
              onChange={handleModalInputChange}
            />

            <input
              type="number"
              name="xp"
              placeholder="XP Reward Points"
              className="modal-input"
              value={newTask.xp}
              onChange={handleModalInputChange}
            />

            <div className="modal-actions">
              <button className="btn btn-success" onClick={handleSubmit}>Submit</button>
              <button className="btn btn-danger" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
