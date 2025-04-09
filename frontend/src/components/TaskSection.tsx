import React from 'react';
import { Task } from '../types/Task';
import './TaskSection.css';

interface Props {
  title: string;
  tasks: Task[];
  handleDelete: (id: number) => void;
  handleMarkAsReviewed?: (id: number) => void;
}

const TaskSection: React.FC<Props> = ({ title, tasks, handleDelete, handleMarkAsReviewed }) => {
  return (
    <div className="task-section">
      <h2 className="task-section-title">{title} Tasks</h2>

      <div className="task-grid">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <h3 className="task-title">{task.title}</h3>
            <p className="task-desc">{task.description}</p>

            <div className="task-meta">
              <span className="task-due">
                <strong>Due:</strong>{' '}
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
              </span>
              <span className="task-xp">
                <strong>XP:</strong> <span className="xp-points">{task.xp}</span>
              </span>
            </div>

            <div className="task-actions">
              {handleMarkAsReviewed && title === 'completed' && (
                <button className="review-btn review-button" onClick={() => handleMarkAsReviewed(task.id)}>
                  Mark as Reviewed
                </button>
              )}
              <button className="delete-btn" onClick={() => handleDelete(task.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSection;
