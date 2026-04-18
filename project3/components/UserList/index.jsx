import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import api from '../../lib/api';

import './styles.css';

function UserList() {

  const { data: userList, isLoading, isError } = useQuery({
    queryKey: ['userList'],
    queryFn: () => api.get(`/user/list`).then(res => res.data),
  });

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error loading user.</Typography>;

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
