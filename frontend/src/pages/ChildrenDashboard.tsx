import React, { useEffect, useState } from 'react';
import './ChildDashboard.css';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  due_date: string;
  xp: number;
  parent_id: string;
}

interface ChildData {
  id: string;
  xp_point: number;
}

const ChildrenDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [xp, setXp] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');

  const navigate = useNavigate();
  const childId = localStorage.getItem('childId');

  const fetchTasks = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/children/tasks/${childId}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
      } else {
        setError(data.message || 'Failed to load tasks');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildXp = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/children/${childId}`);
      const data: ChildData = await res.json();
      if (res.ok) {
        setXp(data.xp_point);
        
      } else {
        console.error('Failed to fetch XP or child not matched');
      
      }
    } catch (err) {
      console.error('Error fetching XP:', err);
     
    }
  };

  useEffect(() => {
    if (childId) {
      fetchTasks();
      fetchChildXp();
    } else {
      setError('No child ID found in local storage');
      setLoading(false);
    }
  }, [childId]);

  const markTaskCompleted = async (taskId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Task marked as completed!');
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: 'Completed' } : task
          )
        );
        fetchChildXp(); // refresh XP
      } else {
        console.error('Failed to update task:', data.message);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('childId');
    navigate('/login');
  };

  const filteredTasks = tasks.filter((task) => {
    const status = task.status.toLowerCase();
    if (activeTab === 'Pending') return status === 'pending';
    if (activeTab === 'Completed') return status === 'completed' || status === 'reviewed';
    return false;
  });

  return (
    <div className="child-page">
      <div className="child-container">
        <div className="child-header">
          <h2>Child Dashboard</h2>
          <div className="header-right">
            <span className="xp-point">XP: {xp}</span>
            <button className="btn btn-danger logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="child-tabs">
          {['Pending', 'Completed'].map((tab) => (
            <div
              key={tab}
              className={`child-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab as 'Pending' | 'Completed')}
            >
              {tab}
            </div>
          ))}
        </div>

        {loading && <p className="child-info">Loading tasks...</p>}
        {error && <p className="child-error">{error}</p>}
        {!loading && !error && filteredTasks.length === 0 && (
          <p className="child-info">No {activeTab.toLowerCase()} tasks.</p>
        )}

        <div className="child-task-list">
          {!loading &&
            !error &&
            filteredTasks.map((task) => (
              <div key={task.id} className="child-task-card">
                <h3 className="task-title">{task.name}</h3>
                <p className="task-desc">{task.description}</p>
                <div className="task-meta">
                  <span>Status: <strong>{task.status}</strong></span>
                  <span>Due: {task.due_date}</span>
                  <span>XP: {task.xp}</span>
                </div>
                {task.status === 'pending' && (
                  <button
                    className="btn btn-success"
                    onClick={() => markTaskCompleted(task.id)}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChildrenDashboard;
