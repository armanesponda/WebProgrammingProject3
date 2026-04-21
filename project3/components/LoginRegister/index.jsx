import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

import './styles.css';

function LoginRegister({ currentUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    login_name: '',
    password: '',
    first_name: '',
    last_name: '',
    location: '',
    description: '',
    occupation: '',
  });
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: (body) => api.post('/admin/login', body).then((res) => res.data),
    onSuccess: (user) => {
      queryClient.setQueryData(['sessionUser'], user);
      queryClient.invalidateQueries(['userList']);
      navigate(`/users/${user._id}`);
    },
    onError: (err) => {
      setError(err.response?.data || 'Login failed. Please check your credentials.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (body) => api.post('/user', body).then((res) => res.data),
    onSuccess: (user) => {
      queryClient.setQueryData(['sessionUser'], user);
      queryClient.invalidateQueries(['userList']);
      navigate(`/users/${user._id}`);
    },
    onError: (err) => {
      setError(err.response?.data || 'Registration failed. Please try again.');
    },
  });

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!form.login_name.trim() || !form.password.trim()) {
      setError('Please enter login name and password.');
      return;
    }

    loginMutation.mutate({
      login_name: form.login_name.trim(),
      password: form.password,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    const requiredFields = ['login_name', 'password', 'first_name', 'last_name'];
    const missingFields = requiredFields.filter((field) => !form[field]?.trim());
    if (missingFields.length > 0) {
      setError('login_name, password, first_name and last_name are required.');
      return;
    }

    registerMutation.mutate({
      login_name: form.login_name.trim(),
      password: form.password,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      occupation: form.occupation.trim(),
    });
    setError('');
  };

  return (
    <div>
      <h2>{isLogin ? 'Log in' : 'Register'}</h2>

      {error && <p className="errorMsg">{error}</p>}

      {isLogin ? (
        <form onSubmit={handleLogin}>
          <input
            name="login_name"
            value={form.login_name}
            onChange={(e) => setForm((prev) => ({ ...prev, login_name: e.target.value }))}
            placeholder="Login Name"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Password"
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <input
            name="login_name"
            value={form.login_name}
            onChange={(e) => setForm((prev) => ({ ...prev, login_name: e.target.value }))}
            placeholder="Login Name"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Password"
          />
          <input
            name="first_name"
            value={form.first_name}
            onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))}
            placeholder="First Name"
          />
          <input
            name="last_name"
            value={form.last_name}
            onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))}
            placeholder="Last Name"
          />
          <input
            name="location"
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="Location"
          />
          <input
            name="description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
          />
          <input
            name="occupation"
            value={form.occupation}
            onChange={(e) => setForm((prev) => ({ ...prev, occupation: e.target.value }))}
            placeholder="Occupation"
          />
          <button type="submit">Register</button>
        </form>
      )}
      <p
        onClick={() => {
          setIsLogin(!isLogin);
          setError('');
        }}
        style={{ cursor: 'pointer', marginTop: '10px' }}
      >
        {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
      </p>
    </div>
  );
}

export default LoginRegister;