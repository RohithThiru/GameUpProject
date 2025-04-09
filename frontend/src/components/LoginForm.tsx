import React, { useState  } from 'react';
import {useNavigate } from 'react-router-dom';

interface LoginData {
  phone: string;
  password: string;
  userType: 'parent' | 'child';
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    phone: '',
    password: '',
    userType: 'parent',
  });

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted"); // debug
    alert("Submitting login...");

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Login Response:', data);

      if (response.ok) {
        if (data.userType === 'parent') {
          localStorage.setItem('parentId', data.id);
        }
        else{
          localStorage.setItem('childId', data.id);
        }
          alert('Login successful!');
          if(formData.userType === "parent"){
            navigate('/parent');
          }
          else{
            navigate('/children');
          }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-black">
      <div className="bg-dark text-white p-5 rounded shadow w-100" style={{ maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control bg-secondary text-white border-0"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control bg-secondary text-white border-0"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Login as</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="form-select bg-secondary text-white border-0"
              required
            >
              <option value="parent">Parent</option>
              <option value="child">Child</option>
            </select>
          </div>

          <button type="submit" className="btn btn-outline-light w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
