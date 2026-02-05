import express from 'express';
import { loginUser, registerUser } from '../controllers/userController.js';

const userRouter = express.Router();

// user & admin login (same API)
userRouter.post('/login', loginUser);

// user register
userRouter.post('/register', registerUser);

export default userRouter;
