import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

import VideoPlayer from '../components/VideoPlayer';
import FollowButton from '../components/FollowButton';
import VideoCard from '../components/VideoCard';
import Comment from '../components/Comment';
import Loading from '../components/Loading';
import Error from '../components/Error';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import apiService from '../services/api';

import '../styles/Watch.css';

const Watch = () => {
  const { videoId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  const [video, setVideo] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [theaterMode, setTheaterMode] = useState(false);
  const [recommended, setRecommended] = useState([]);

  const fetchVideo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiService.getVideoById(videoId);

      /* ✅ SAFE RESPONSE PARSING */
      const v = res.data?.data || res.data || res;

      setVideo(v);
      setLikeCount(v.likes?.length || 0);
      setComments(v.comments || []);
      setLiked(
        user && v.likes
          ? v.likes.some(id => id.toString() === (user._id || user.id))
          : false
      );

      const streamRes = await apiService.getVideoStream(videoId);
      setStreamUrl(streamRes.streamUrl);

    } catch (err) {
      setError(err.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  }, [videoId, user]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await apiService.getVideos({ page: 1, limit: 12 });
        const vids = res.data || [];
        setRecommended(
          vids.filter(v => v._id !== videoId).slice(0, 8)
        );
      } catch (err) {}
    };

    fetchRecommended();
  }, [videoId]);

  const toggleTheater = () => {
    setTheaterMode(s => !s);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      addToast('Login required', 'info');
      return;
    }

    try {
      const res = await apiService.likeVideo(videoId);
      setLikeCount(res.likesCount);
      setLiked(res.liked);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    try {
      const updatedComments = await apiService.addComment(videoId, commentText.trim());
      setComments(updatedComments);
      setCommentText('');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const refreshComments = async () => {
    try {
      const refreshed = await apiService.getVideoById(videoId);
      const refreshedVideo = refreshed.data?.data || refreshed.data || refreshed;
      setComments(refreshedVideo.comments || []);
    } catch (err) {}
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!video) return <div>Video not found</div>;

  return (
    <div className={`watch-page ${theaterMode ? 'theater' : ''}`}>
      <div className="watch-container">

        <div className="left-column">
          <div className="player-controls-top">
            <button onClick={toggleTheater} className="theater-btn">
              {theaterMode ? 'Exit Theater' : 'Theater'}
            </button>
          </div>

          <div className="player-wrapper">
            <VideoPlayer
              src={streamUrl}
              poster={video.thumbnailUrl}
              autoplay={false}
            />
          </div>

          <div className="video-details">
            <h1>{video.title}</h1>

            <div className="video-header-row">
              <div className="channel-info">
                <Link to={`/profile/${video.owner?._id}`} className="channel-name">
                  {video.owner?.username}
                </Link>
                <span className="channel-subscribers">
                  {video.owner?.followers?.length || 0} subscribers
                </span>
              </div>

              <FollowButton
                targetUserId={video.owner?._id}
                isFollowing={
                  user && video.owner?.followers
                    ? video.owner.followers.some(f =>
                        (f._id || f).toString() === (user._id || user.id)
                      )
                    : false
                }
              />

              <button onClick={handleLike} className="like-btn">
                👍 {likeCount}
              </button>
            </div>

            <div className="description-box">
              {video.description}
            </div>
          </div>
        </div>

        <aside className="right-column">
          <h3>Recommended</h3>
          {recommended.map(r => (
            <VideoCard key={r._id} video={r} />
          ))}
        </aside>

        <div className="comments-section">
          <h3>Comments ({comments.length})</h3>

          {isAuthenticated && (
            <form onSubmit={handleComment} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
              />
              <button type="submit">Post</button>
            </form>
          )}

          {comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map(c => (
              <Comment
                key={c._id}
                comment={c}
                currentUserId={user?._id}
                videoOwnerId={video.owner?._id}
                onDelete={async (commentId) => {
                  await apiService.deleteComment(videoId, commentId);
                  refreshComments();
                }}
                onEdit={async (comment) => {
                  const newText = prompt('Edit comment', comment.text);
                  if (!newText) return;
                  await apiService.editComment(videoId, comment._id, newText);
                  refreshComments();
                }}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Watch;
