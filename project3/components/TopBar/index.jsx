import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import api from '../../lib/api';

import './styles.css';

function TopBar({ currentUser }) {
  const route = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  let photoStatus = false;

  if (route.pathname.includes('photos')) {
    photoStatus = true;
  }

  const {
    data: topBar,
    isLoading: topBarLoading,
    isError: topBarError,
  } = useQuery({
    queryKey: ['userDetail', params.userId],
    queryFn: () => api.get(`/user/${params.userId}`).then((res) => res.data),
    enabled: !!params.userId,
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/admin/logout'),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessionUser']);
      queryClient.invalidateQueries(['userList']);
      navigate('/login-register');
    },
    onError: (err) => {
      console.error('Logout failed', err);
    },
  });

  function getContextText() {
    if (!params.userId) return 'Users';
    if (topBarLoading) return 'Loading';
    if (topBarError || !topBar) return 'Users';
    if (photoStatus) return `Photos of ${topBar.first_name} ${topBar.last_name}`;
    return `${topBar.first_name} ${topBar.last_name}`;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
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
