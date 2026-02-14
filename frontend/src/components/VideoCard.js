import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, truncateText } from '../utils/helpers';
import noThumb from '../assests/no-thumbnail.jpg';
import '../styles/VideoCard.css';

const VideoCard = ({ video }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!video) return null;

  const uploaderId =
    typeof video.owner === 'object' ? video.owner._id : video.owner;

  const uploaderName =
    typeof video.owner === 'object' ? video.owner.username : 'Unknown creator';

  return (
    <div className="video-card">
      <Link to={`/watch/${video._id}`} className="video-thumbnail">
        {!imgLoaded && <div className="thumbnail-skeleton" />}

        <img
          src={video.thumbnailUrl || noThumb}
          alt={video.title || 'Video thumbnail'}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.src = noThumb;
            setImgLoaded(true);
          }}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />

        {video.duration && (
          <span className="duration">{video.duration}</span>
        )}
      </Link>

      <div className="video-info">
        <Link to={`/watch/${video._id}`} className="video-title">
          {truncateText(video.title || 'Untitled', 50)}
        </Link>

        <div className="video-metadata">
          <Link to={`/profile/${uploaderId}`} className="uploader-name">
            {uploaderName}
          </Link>
          <div className="video-stats">
            <span>{video.views || 0} views</span>
            <span className="separator">•</span>
            <span>{video.createdAt ? formatDate(video.createdAt) : 'recently'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
