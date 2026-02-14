import React, { useState } from 'react';
import '../styles/Comment.css';

const Comment = ({ comment, onReply, onDelete, currentUserId, videoOwnerId, onEdit }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment._id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const canModify = currentUserId && (currentUserId === comment.user?._id || currentUserId === videoOwnerId);

  return (
    <div className="comment">
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">
            {comment.user?.username || 'Unknown user'}
          </span>
          <span className="comment-date">
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleDateString()
              : ''}
          </span>
        </div>

        <p className="comment-text">{comment.text}</p>

        <div className="comment-actions">
          <button
            className="comment-btn"
            onClick={() => setIsReplying(!isReplying)}
          >
            Reply
          </button>

          {canModify && (
            <>
              <button className="comment-btn" onClick={() => onEdit?.(comment)}>Edit</button>
              <button className="comment-btn delete" onClick={() => onDelete?.(comment._id)}>Delete</button>
            </>
          )}
        </div>

        {isReplying && (
          <div className="comment-reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="What's your reply?"
              rows="2"
            />
            <div className="reply-actions">
              <button onClick={handleReply} className="btn btn-sm btn-primary">
                Reply
              </button>
              <button
                onClick={() => setIsReplying(false)}
                className="btn btn-sm btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                currentUserId={currentUserId}
                videoOwnerId={videoOwnerId}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
