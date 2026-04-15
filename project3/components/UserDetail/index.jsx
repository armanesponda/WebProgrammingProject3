import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Link, useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import api from '../../lib/api';

import './styles.css';

function UserDetail() {
  const params = useParams();

  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await api.get(`/user/${params.userId}`);
      setUserDetails(response.data);
    };
    fetchUsers();
  }, [params.userId]);

  // load guard similar to UserPhotos
  if (!userDetails) return <Typography>Loading...</Typography>;

  return (
    <Typography variant="body1">
      {/* Pretty basic display of info but pleasant I'd say */}
      <Typography>
        Name:
        {userDetails.first_name}
        {' '}
        {userDetails.last_name}
      </Typography>
      <Typography>
        Location:
        {userDetails.location}
      </Typography>
      <Typography>
        Occupation:
        {userDetails.occupation}
      </Typography>
      <Typography>
        User Description:
        {userDetails.description}
      </Typography>
      <br />
      <Link to={`/users/${params.userId}/photos`}>
        {`${userDetails.first_name}'s Photos`}
      </Link>
    </Typography>
  );
}

export default UserDetail;
