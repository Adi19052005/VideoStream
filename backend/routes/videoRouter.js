const express = require('express');
const videoRouter = express.Router();
const videoController = require('../controllers/videoContoller');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const Video = require('../model/videoSchema');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }
});

/* ✅ NON-PARAM ROUTES FIRST */
videoRouter.get('/', videoController.latestVideos);
videoRouter.get('/search', videoController.searchVideos);

/* ✅ CREATE */
videoRouter.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  videoController.postVideo
);

/* ✅ PARAM ROUTES */
videoRouter.get('/:videoId/stream', async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.videoId, {
      $inc: { views: 1 }
    });
  } catch (err) {}
  next();
}, videoController.getVideoStream);

videoRouter.get('/:videoId/comments', videoController.getVideoComments);
videoRouter.post('/:videoId/comments', authMiddleware, videoController.addVideoComment);

videoRouter.put('/:videoId/comments/:commentId', authMiddleware, videoController.editComment);
videoRouter.delete('/:videoId/comments/:commentId', authMiddleware, videoController.deleteComment);

videoRouter.post('/:videoId/like', authMiddleware, videoController.videoLikes);

videoRouter.put('/:videoId', authMiddleware, videoController.updateVideo);
videoRouter.delete('/:videoId', authMiddleware, videoController.deleteVideo);

/* ✅ SINGLE VIDEO FETCH LAST */
videoRouter.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId)
      .populate('owner', 'username')
      .populate('comments.user', 'username');

    if (!video) return res.status(404).json({ message: 'Video not found' });

    res.status(200).json({ data: video });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = videoRouter;
