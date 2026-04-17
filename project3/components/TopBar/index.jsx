import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import api from '../../lib/api';

import './styles.css';

function TopBar({ currentUser, onLogout }) {
  const route = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  let photoStatus = false;

  const [topBar, setTopBar] = useState();

  if (route.pathname.includes('photos')) {
    photoStatus = true;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await api.get(`/user/${params.userId}`);
      setTopBar(response.data);
    };
    if (params.userId) {
      fetchUsers();
    }
  }, [params.userId]);

  function getContextText() {
    if (!params.userId) return 'Users';
    if (!topBar) return 'Loading';
    if (photoStatus) return `Photos of ${topBar.first_name} ${topBar.last_name}`;
    return `${topBar.first_name} ${topBar.last_name}`;
  }

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
      onLogout();
      navigate('/login-register');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit">
          Hi {currentUser ? currentUser.first_name : 'Guest'}!
        </Typography>
        <Typography sx={{ marginLeft: 'auto', marginRight: 2 }}>
          {getContextText()}
        </Typography>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
