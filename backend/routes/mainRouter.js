const express = require('express');
const mainRouter = express.Router();
const userRouter = require('./userRouter');
const videoRouter = require('./videoRouter');

mainRouter.use('/videos', videoRouter);
mainRouter.use('/users', userRouter);

mainRouter.get('/', (req, res) => {
    res.send('Welcome to the livestream Backend!');
});

module.exports = mainRouter;
