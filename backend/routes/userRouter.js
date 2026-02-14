const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userContoller');
const authMiddleware = require('../middleware/authMiddleware');

userRouter.post('/signup', userController.signUpUser);
userRouter.post('/login', userController.loginUser);

userRouter.get('/me', authMiddleware, userController.getMyProfile);
userRouter.put('/me', authMiddleware, userController.updateUserProfile);
userRouter.delete('/me', authMiddleware, userController.deleteUser);

userRouter.get('/', userController.getAllUsers);

userRouter.get('/:id', userController.getUserProfile);

/* ✅ SINGLE SOURCE OF TRUTH */
userRouter.post('/:id/toggle-follow', authMiddleware, userController.toggleFollow);

module.exports = userRouter;
