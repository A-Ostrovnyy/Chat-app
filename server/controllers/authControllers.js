import { User } from "../models/user.js";
import jwt from 'jsonwebtoken';

const maxAge = 60 * 60 * 24 * 5; // 5 days

const createJWT = (id) => jwt.sign({id}, 'secret chat room', {expiresIn: maxAge});

const alertErrors = (err) => {
  console.log('err.message: ', err.message);
  console.log('err.code: ', err.code);
  const errors = {};
  if (err.code === 11000) {
    errors.email = 'This email already registered';
    return errors;
  }
  
  if (err.message === 'incorrect email') {
    errors.email = 'This email not found';
    return errors;
  }

  if (err.message === 'incorrect password') {
    errors.password = 'The password is incorrect';
    return errors;
  }

  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      const {path, message} = properties;
      errors[path] = message;
    })
  }
  return errors;
}

export const login = async (req, res) => {
  const {email, password} = req.body;
  try {
    const user = await User.login(email, password);
    const token = createJWT(user._id);
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
    res.status(201).json({user});
  } catch (err) {
    const errors = alertErrors(err);
    res.status(400).json({errors});
  }
};

export const signup = async (req, res) => {
  const {name, email, password} = req.body;
  try {
    const user = await User.create({name, email, password});
    const token = createJWT(user._id);
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
    res.status(201).json({user});
  } catch (err) {
    const errors = alertErrors(err);
    res.status(400).json({errors});
  }
};


export const logout = (req, res) => {
  res.cookie('jwt', '', {maxAge: 1});
  res.status(200).json({logout: true});
};

export const verifyUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'secret chat room', async (err, decodedToken) => {
      if (err) {
        console.log(message);
      } else {
        const user = await User.findById(decodedToken.id);
        res.json(user);
        next();
      }
    });
  } else {
    next();
  }
};
