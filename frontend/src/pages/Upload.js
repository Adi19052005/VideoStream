import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import apiService from '../services/api';
import '../styles/Upload.css';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'education',
  });

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  /* ✅ Redirect if not logged in */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  /* ✅ Poll processing status (CRITICAL FIXED LOGIC) */
  useEffect(() => {
    if (!uploadedVideoId) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiService.getVideoById(uploadedVideoId);

        /* ✅ Correct response parsing */
        const video = res.data?.data || res.data || res;

        if (video?.status === 'COMPLETED') {
          clearInterval(interval);
          addToast('Video processing completed!', 'success');
          navigate(`/watch/${uploadedVideoId}`);
        }

        if (video?.status === 'FAILED') {
          clearInterval(interval);
          addToast('Video processing failed', 'error');
          setProcessing(false);
        }

      } catch (err) {
        console.error('Polling error:', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [uploadedVideoId, navigate, addToast]);

  if (!isAuthenticated) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      addToast('Invalid video file', 'error');
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type.startsWith('image/')) {
      setThumbnail(file);
    } else {
      addToast('Invalid image file', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      addToast('Please select a video file', 'error');
      return;
    }

    if (!formData.title.trim()) {
      addToast('Please enter a title', 'error');
      return;
    }

    setLoading(true);

    try {
      const uploadFormData = new FormData();

      uploadFormData.append('title', formData.title.trim());
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('video', videoFile);

      if (thumbnail) {
        uploadFormData.append('thumbnail', thumbnail);
      }

      const res = await apiService.uploadVideo(uploadFormData);

      const videoId = res._id || res.data?._id;

      if (!videoId) {
        throw new Error('Upload succeeded but videoId missing');
      }

      setUploadedVideoId(videoId);
      setProcessing(true);

      addToast('Upload successful. Processing started...', 'info');

    } catch (err) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ✅ Processing Screen */
  if (processing) {
    return (
      <div className="upload-page">
        <div className="upload-container processing">
          <h2>Processing Video</h2>
          <p>Your video is being processed. Please wait...</p>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h2>Upload Video</h2>

        <form onSubmit={handleSubmit} className="upload-form">
          <FormInput
            label="Video Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="form-input"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="education">Education</option>
            <option value="entertainment">Entertainment</option>
            <option value="music">Music</option>
            <option value="gaming">Gaming</option>
            <option value="sports">Sports</option>
            <option value="vlog">Vlog</option>
            <option value="tutorial">Tutorial</option>
          </select>

          <input type="file" accept="video/*" onChange={handleVideoChange} />
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />

          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
