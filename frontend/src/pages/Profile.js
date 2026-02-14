import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import apiService from '../services/api';
import '../styles/Profile.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import FollowButton from '../components/FollowButton';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getUserProfile(userId);

      setUser(response.user);
      setVideos(response.videos || []);

      // determine whether current user follows this profile
      if (isAuthenticated && currentUser) {
        const isFollowing = (response.user.followers || []).some(f => (f._id || f) === (currentUser._id || currentUser.id));
        setUser(prev => ({ ...prev, _isFollowing: isFollowing }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!user) return <div>User not found</div>;

  // Create initials badge
  const userInitials = (user.username || 'U').charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-banner"></div>

        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {userInitials}
            </div>
          </div>

          <div className="profile-details">
            <h1>{user.username}</h1>

            <p className="profile-subscriber-count">
              {user.followers?.length || 0} subscribers
            </p>

            {user.bio && <p className="profile-bio">{user.bio}</p>}

            {isAuthenticated && currentUser?._id !== userId && (
              <FollowButton
                targetUserId={userId}
                isFollowing={user._isFollowing}
              />
            )}
          </div>
        </div>
      </div>

      <div className="profile-container">
        <h2>Videos ({videos.length})</h2>

        {videos.length > 0 ? (
          <div className="videos-grid">
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="no-videos">
            <p>No videos yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
