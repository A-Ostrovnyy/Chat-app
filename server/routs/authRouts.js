import {Router} from 'express'; 
import {login, logout, signup, verifyUser} from '../controllers/authControllers.js'; 

export const authRouter = Router();

authRouter.post('/login', login);

authRouter.post('/signup', signup);

authRouter.get('/logout', logout);

authRouter.get('/verifyuser', verifyUser);
