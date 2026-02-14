import React, { useState } from 'react';
import apiService from '../services/api';
import '../styles/FollowButton.css';

const FollowButton = ({ targetUserId, isFollowing: initialFollowing = false, onChange, onUpdateCount }) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(initialFollowing);

  const toggleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await apiService.toggleFollow(targetUserId);
      const newState = !!res.following;
      setFollowing(newState);
      onChange?.(newState);
      onUpdateCount?.(newState ? 1 : -1);
    } catch (err) {
      console.error('Follow toggle failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={"follow-btn " + (following ? 'following' : '')} onClick={toggleFollow} disabled={loading}>
      {following ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
