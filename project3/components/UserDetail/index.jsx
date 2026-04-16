import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Link, useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

import './styles.css';

function UserDetail() {
  const params = useParams();

  const { data: userDetails, isLoading, isError } = useQuery({
    queryKey: ['user', params.userId],
    queryFn: () => api.get(`/user/${params.userId}`).then(res => res.data),
  });

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error loading user.</Typography>;

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

