const mongoose = require('mongoose');
const Video = require('../model/videoSchema');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');

const getS3KeyFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch {
    return url;
  }
};

const latestVideos = async (req, res) => {
  try {
    let { page = 1, limit = 10, category, search, sortBy } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = { status: 'COMPLETED' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    let sort = { createdAt: -1 };

    if (sortBy === 'oldest') sort = { createdAt: 1 };
    if (sortBy === 'popular') sort = { views: -1 };

    const total = await Video.countDocuments(query);

    let videos = await Video.find(query)
      .populate('owner', 'username')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    if (sortBy === 'trending') {
      videos = videos.sort((a, b) => b.likes.length - a.likes.length);
    }

    res.status(200).json({
      data: videos,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


const getVideoStream = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }

    const video = await Video.findById(videoId).populate('owner', 'username');

    if (!video || video.status !== 'COMPLETED') {
      return res.status(404).json({ message: 'Video not found or not ready' });
    }

    if (!video.hlsKey) {
      return res.status(400).json({ message: 'HLS not generated yet' });
    }

    const domain = process.env.CLOUDFRONT_DOMAIN.replace(/\/$/, '');
    const streamUrl = `${domain}/${video.hlsKey}`;

    res.json({ streamUrl, owner: video.owner });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};const postVideo = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const videoFile = req.files.video[0];

    const ext = videoFile.originalname.split('.').pop();

    const videoKey = `videos/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: videoKey,
        Body: videoFile.buffer,
        ContentType: videoFile.mimetype
      })
    );

    const rawS3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`;

    let thumbnailUrl = null;

    if (req.files.thumbnail) {
      const thumb = req.files.thumbnail[0];
      const thumbExt = thumb.originalname.split('.').pop();

      const thumbKey = `thumbnails/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${thumbExt}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: thumbKey,
          Body: thumb.buffer,
          ContentType: thumb.mimetype
        })
      );

      thumbnailUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbKey}`;
    }

    const video = await Video.create({
      title,
      description,
      category,
      owner: userId,
      rawS3Url,
      thumbnailUrl,
      status: 'PENDING'
    });

    res.status(201).json(video);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (video.rawS3Url) {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: getS3KeyFromUrl(video.rawS3Url)
      }));
    }

    await Video.findByIdAndDelete(videoId);

    res.status(200).json({ message: 'Video deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { title, description, category } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    video.title = title ?? video.title;
    video.description = description ?? video.description;
    video.category = category ?? video.category;

    await video.save();

    res.status(200).json(video);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
      .populate('comments.user', 'username');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json(video.comments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const addVideoComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text required' });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.comments.push({ user: userId, text });

    await video.save();

    const populatedVideo = await Video.findById(videoId)
      .populate('comments.user', 'username');

    res.status(201).json(populatedVideo.comments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const editComment = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    comment.text = text;
    await video.save();

    const populatedVideo = await Video.findById(videoId).populate('comments.user', 'username avatar');
    res.status(200).json(populatedVideo.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // allow deletion by comment owner or video owner
    if (comment.user.toString() !== userId && video.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    comment.remove();
    await video.save();

    const populatedVideo = await Video.findById(videoId).populate('comments.user', 'username avatar');
    res.status(200).json(populatedVideo.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const videoLikes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const index = video.likes.findIndex(id => id.toString() === userId);

    let liked;

    if (index === -1) {
      video.likes.push(userId);
      liked = true;
    } else {
      video.likes.splice(index, 1);
      liked = false;
    }

    await video.save();

    res.status(200).json({
      likesCount: video.likes.length,
      liked
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getUserVideos = async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await Video.find({
      owner: userId,
      status: 'COMPLETED'
    })
    .sort({ createdAt: -1 })
    .populate('owner', 'username');

    res.json(videos);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchVideos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(200).json({ users: [], videos: [] });
    }

    const regex = { $regex: q, $options: 'i' };

    const users = await mongoose.model('User').find({ username: regex }).select('username avatar');

    const videos = await Video.find({ title: regex, status: 'COMPLETED' })
      .limit(50)
      .populate('owner', 'username avatar');

    res.status(200).json({ users, videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  latestVideos,
  getVideoStream,
  postVideo,
  deleteVideo,
  updateVideo,
  getVideoComments,
  addVideoComment,
  editComment,
  deleteComment,
  videoLikes,
  getUserVideos,
  searchVideos
};
