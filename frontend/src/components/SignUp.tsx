import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ keep import here



interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
  phone: string;
  userType: 'parent' | 'child';
}

const SignUp: React.FC = () => {

  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'parent',
  });

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

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          userType: formData.userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('User registered successfully!');
        navigate('/login'); // redirect to login
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again later.');
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-dark d-flex justify-content-center align-items-center text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-secondary p-5 rounded shadow w-100"
        style={{ maxWidth: '400px' }}
      >
        <h2 className="text-center mb-4">Sign Up</h2>

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your name"
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
            className="form-control"
            placeholder="Enter password"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-control"
            placeholder="Re-enter password"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Login as</label>
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="form-select"
          >
            <option value="parent">Parent</option>
            <option value="child">Child</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Sign Up
        </button>

        <div className="text-center mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-light text-decoration-underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
