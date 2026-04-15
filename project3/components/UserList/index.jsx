import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import api from '../../lib/api';

import './styles.css';

function UserList() {
  const [userList, setUserList] = useState([]);// set empty array so it doesn't crash

  // basic api call gets the user list and then return displays it on sidebar
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await api.get('/user/list');
      setUserList(response.data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <List component="nav">
        {userList.map((user) => (
          <ListItem key={user._id}>
            <Link to={`/users/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </Link>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default UserList;
