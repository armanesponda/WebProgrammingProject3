import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Typography, Paper } from '@mui/material';
import {
  createBrowserRouter, RouterProvider, Outlet, useParams, Navigate
} from 'react-router-dom';

import './styles/main.css';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import LoginRegister from './components/LoginRegister';

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

function UserDetailRoute({currentUser}) {
  const { userId } = useParams();

  //if not logged in, default to login-register page
  if (!currentUser) {
    return <Navigate to="/login-register" />
  }

  // eslint-disable-next-line no-console
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute({currentUser}) {
  const { userId } = useParams();
  
  //if not logged in, default to login-register page
  if (!currentUser) {
    return <Navigate to="/login-register" />
  }

  return <UserPhotos userId={userId} />;
}

function LoginRegisterRoute({setCurrentUser}) {
  return <LoginRegister setCurrentUser={setCurrentUser} />;
}

function Root({ currentUser}) {
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

function PhotoShareApp() {
  const [currentUser, setCurrentUser] = React.useState(null);
  console.log('PhotoShareApp: currentUser is:', currentUser);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Root currentUser={currentUser} />,
      children: [
        //redirect root to login-register if not logged in
        {
          index: true,
          element: currentUser ? <Home/> : <Navigate to="/login-register" replace />,
        },

        //can be accessed while not logged in
        {
          path: 'login-register',
          element: (
            <LoginRegisterRoute setCurrentUser={setCurrentUser} />
          ),
        },

        //must be logged in
        { path: 'users', element: <UserList /> },

        {
          path: 'users/:userId',
          element: <UserLayout />,
          children: [
            { index: true, element: <UserDetailRoute /> },
            { path: 'photos', element: <UserPhotosRoute /> },
          ],
        },

        //default to login-register
        {
          path: '*',
          element: <Navigate to="/login-register" />
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
//root.render(<RouterProvider router={router} />);
root.render(<PhotoShareApp/>);