// eslint-disable-next-line import/no-extraneous-dependencies
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import api from '../../lib/api';

import './styles.css';

function UserPhotos() {
  const params = useParams();
  const queryClient = useQueryClient();
  const [commentErrors, setCommentErrors] = useState({});

  const { data: userPhotos, isLoading, isError } = useQuery({
    queryKey: ['photos', params.userId],
    queryFn: () => api.get(`/photosOfUser/${params.userId}`).then(res => res.data),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ photoId, comment }) =>
      api.post(`/commentsOfPhoto/${photoId}`, { comment }),
    onSuccess: () => {
      // Invalidate the photos query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['photos', params.userId] });
      // Clear all comment errors on success
      setCommentErrors({});
    },
    onError: (error, variables) => {
      // Store error for this specific photo
      const errorMessage = error.response?.data || 'Failed to post comment';
      setCommentErrors(prev => ({
        ...prev,
        [variables.photoId]: errorMessage,
      }));
    },
  });

  // load guard so it doesn't access userPhotos before fetched, when updated it runs right return
  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error loading user.</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Nsted maps for phtos and comnts inside phtos, styling for look, messed up by lint ofc */}
      {userPhotos.map((photo) => (
        <Box
          key={photo._id}
          sx={{
            display: 'flex', flexDirection: 'column', gap: 1, padding: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2,
          }}
        >
          <Typography>{new Date(photo.date_time).toLocaleString()}</Typography>
          <img src={`/images/${photo.file_name}`} alt="User Upload" />
          {(photo.comments || []).map((details) => (
            <div key={details._id} className="comments" style={{ borderLeft: '3px solid #ccc', paddingLeft: '12px', marginTop: '8px' }}>
              <Link to={`/users/${details.user._id}`}>{`${details.user.first_name} ${details.user.last_name}`}</Link>
              <Typography>{`${details.comment}`}</Typography>
              <Typography>{new Date(details.date_time).toLocaleString()}</Typography>
            </div>
          ))}

          {/* Comment input section */}
          <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              placeholder="Add a comment..."
              multiline
              rows={2}
              fullWidth
              id={`comment-input-${photo._id}`}
              disabled={addCommentMutation.isPending}
            />
            <Button
              variant="contained"
              onClick={() => {
                const input = document.getElementById(`comment-input-${photo._id}`);
                const commentText = input.value.trim();
                if (commentText) {
                  addCommentMutation.mutate({
                    photoId: photo._id,
                    comment: commentText,
                  });
                  input.value = '';
                }
              }}
              disabled={addCommentMutation.isPending}
            >
              Post Comment
            </Button>
            {commentErrors[photo._id] && (
              <Alert severity="error">
                {commentErrors[photo._id]}
              </Alert>
            )}
          </Box>
        </Box>
      ))}

    </Box>
  );
}

export default UserPhotos;

