import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@mui/material';
import api from '../../lib/api';

import './styles.css';

function TopBar() {
  // same basic assigns of useState and params in most files
  const route = useLocation();
  const params = useParams();
  let photoStatus = false;

  const [topBar, setTopBar] = useState();

  // simple binary checkig route for photo page
  if (route.pathname.includes('photos')) {
    photoStatus = true;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await api.get(`/user/${params.userId}`);
      setTopBar(response.data);
    };
    fetchUsers();
  }, [params.userId]);

  // helper function to show context on top right topbar
  function getContextText() {
    if (!params.userId) return 'Users';
    if (!topBar) return 'Loading';
    if (photoStatus) return `Photos of ${topBar.first_name} ${topBar.last_name}`;
    return `${topBar.first_name} ${topBar.last_name}`;
  }

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit">
          Armando Esponda
        </Typography>
        <Typography sx={{ marginLeft: 'auto' }}>
          {/* Had a ternary op that I had to get rid of because of lint >:( */}
          {getContextText()}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
