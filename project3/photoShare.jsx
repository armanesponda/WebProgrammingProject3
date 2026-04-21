import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Typography, Paper, Button } from '@mui/material';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import {
  createBrowserRouter, RouterProvider, Outlet, useParams, Navigate, useNavigate
} from 'react-router-dom';

import './styles/main.css';
import api from './lib/api';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import LoginRegister from './components/LoginRegister';

const queryClient = new QueryClient();

function Home() {
  
  const navigate = useNavigate();
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/user/list');
      return response.data;
    },
  });

  const handleRandomUser = () => {
    if (users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      navigate(`/users/${randomUser._id}`);
    }
  };

  return (
    <div className="home-container">
      <Typography variant="body1" className="home-text">
        Welcome to our photo sharing app!
        Select a user from the side, or use the button below to view a random user.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleRandomUser}
        disabled={users.length === 0}
        className="home-button"
      >
        View Random User
      </Button>
    </div>
  );
}

function UserDetailRoute({ currentUser }) {
  const { userId } = useParams();

  if (!currentUser) {
    return <Navigate to="/login-register" />;
  }

  // eslint-disable-next-line no-console
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute({ currentUser }) {
  const { userId } = useParams();

  if (!currentUser) {
    return <Navigate to="/login-register" />;
  }

  return <UserPhotos userId={userId} />;
}

function LoginRegisterRoute({ currentUser }) {
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  return <LoginRegister currentUser={currentUser} />;
}

function Root({ currentUser }) {
  return (
    <div>
      <Grid container spacing={2}>
        {currentUser && (
          <>
            <Grid item xs={12}>
              <TopBar currentUser={currentUser} />
            </Grid>
            <div className="main-topbar-buffer" />
          </>
        )}

        {currentUser && (
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList />
            </Paper>
          </Grid>
        )}

        <Grid item sm={currentUser ? 9 : 12}>
          <Paper className="main-grid-item">
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

function UserLayout() {
  return <Outlet />;
}

function AppRoutes() {
  const { data: currentUser, isLoading, isError } = useQuery({
    queryKey: ['sessionUser'],
    queryFn: async () => {
      try {
        //attempt to get current session user
        const response = await api.get('/admin/me');
        return response.data;
      } catch (err) {
        if (err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
  });

  const router = React.useMemo(
    () => createBrowserRouter([
      {
        path: '/',
        element: <Root currentUser={currentUser} />,
        children: [
          {
            index: true,
            element: currentUser ? <Home /> : <Navigate to="/login-register" replace />,
          },
          {
            path: 'login-register',
            element: <LoginRegisterRoute currentUser={currentUser} />,
          },
          {
            path: 'users',
            element: currentUser ? <UserList /> : <Navigate to="/login-register" replace />,
          },
          {
            path: 'users/:userId',
            element: <UserLayout />,
            children: [
              {
                index: true,
                element: <UserDetailRoute currentUser={currentUser} />,
              },
              {
                path: 'photos',
                element: <UserPhotosRoute currentUser={currentUser} />,
              },
            ],
          },
          {
            path: '*',
            element: <Navigate to="/login-register" />,
          },
        ],
      },
    ]),
    [currentUser],
  );
  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (isError) {
    return <Typography>Error loading session.</Typography>;
  }

  return <RouterProvider router={router} />;
}

function PhotoShareApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(<PhotoShareApp />);
