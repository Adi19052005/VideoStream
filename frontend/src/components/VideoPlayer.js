import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import '../styles/VideoPlayer.css';

const VideoPlayer = ({ src, poster, autoplay = false }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [qualities, setQualities] = useState([]);
  const [showQuality, setShowQuality] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((l, i) => ({
          index: i,
          label: `${l.height}p`
        }));
        setQualities(levels);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    const updateTime = () => {
      if (!video.duration) return;
      setProgress((video.currentTime / video.duration) * 100);
    };

    const setMeta = () => {
      setDuration(video.duration || 0);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', setMeta);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', setMeta);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  const seekVideo = (value) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const newTime = (value / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(value);
  };

  const changeQuality = (index) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = index;
    setShowQuality(false);
  };

  const changeSpeed = (speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setShowSpeed(false);
  };

  const togglePIP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch {
      console.warn('PIP not supported');
    }
  };

  return (
    <div className="video-player-wrapper">
      <video
        ref={videoRef}
        className="video-player-native"
        autoPlay={autoplay}
        poster={poster}
        preload="auto"
      />

      {/* ✅ Timeline */}
      <div className="timeline-container">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => seekVideo(Number(e.target.value))}
          className="timeline"
        />
      </div>

      <div className="custom-controls">

        <button onClick={() => videoRef.current?.paused
          ? videoRef.current.play()
          : videoRef.current.pause()}
        >
          ▶ / ❚❚
        </button>

        <div className="control-group">
          <button onClick={() => setShowQuality(q => !q)}>Quality</button>

          {showQuality && (
            <div className="menu">
              {qualities.map(q => (
                <div key={q.index} onClick={() => changeQuality(q.index)}>
                  {q.label}
                </div>
              ))}
              <div onClick={() => changeQuality(-1)}>Auto</div>
            </div>
          )}
        </div>

        <div className="control-group">
          <button onClick={() => setShowSpeed(s => !s)}>Speed</button>

          {showSpeed && (
            <div className="menu">
              {[0.5, 1, 1.25, 1.5, 2].map(s => (
                <div key={s} onClick={() => changeSpeed(s)}>
                  {s}x
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={togglePIP}>PIP</button>

      </div>
    </div>
  );
};

export default VideoPlayer;
