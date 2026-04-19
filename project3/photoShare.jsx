import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Typography, Paper } from '@mui/material';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import {
  createBrowserRouter, RouterProvider, Outlet, useParams, Navigate
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
  return (
    <Typography variant="body1">
      Welcome to your photosharing app! This
      {' '}
      <a href="https://mui.com/components/paper/" rel="noreferrer" target="_blank">Paper</a>
      {' '}
      component displays the main content of the application. The
      {/* {sm={9}} */}
      {' '}
      prop in the
      {' '}
      <a href="https://mui.com/components/grid/" rel="noreferrer" target="_blank">Grid</a>
      {' '}
      item
      component makes it responsively display 9/12 of the
      window. The Routes definitions enables us to conditionally
      render different components to this part of the screen.
      There is nothing specific to display here. Use your creativity
      and show some interesting content here.
    </Typography>
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
