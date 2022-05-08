import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { Server } from "socket.io";

import {Room} from './models/room.js';
import {Message} from './models/message.js';
import { authRouter } from './routs/authRouts.js';
import { addUser, getUser, removeUser } from './helper.js';
import { loggerService } from './services/logger.js';
import { configService } from './services/config.js';


const corsOptions = {
  origin: `http://localhost:${configService.get('CLIENT_PORT')}`,
  credentials: true,
  optionSuccessStatus: 200
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(authRouter);
const mongodb = `mongodb+srv://${configService.get('USER_NAME')}:${configService.get('USER_PASSWORD')}@cluster0.9dkd8.mongodb.net/${configService.get('DB_NAME')}?retryWrites=true&w=majority`;
const PORT = configService.get('PORT') || 5001;
const server = http.createServer(app);
mongoose.connect(mongodb, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => loggerService.log('DB connected'))
  .catch((err) => loggerService.error(`Oops! Houston we have a problem with DB connection: ${err}`)); 

const io = new Server(server, {
  cors: {
    origin: `http://localhost:${configService.get('CLIENT_PORT')}`,
    credentials: true
  }
});

app.get('/set-cookie', (req, res) => {
  res.cookie('username', 'tony');
  res.cookie('isAuthenticated', true);
  res.send('cookies are set');
});

app.get('/get-cookie', (req, res) => {
  const cookies = req.cookies;
  res.json(cookies);
});

io.on('connection', (socket) => {
  Room.find().then((res) => {
    socket.emit('output-rooms', res);
  })
  socket.on('create-room', (name) => {
    const newRoom = new Room({name});
    newRoom.save().then((result) => {
      io.emit('room-created', result);
    })
  });
  socket.on('join', ({name, user_id, room_id}) => {
    const {error, user} = addUser({
      socket_id: socket.id,
      name,
      room_id,
      user_id,
    });

    socket.join(room_id); 

    if (error) {
      loggerService.error('join error', error);
    }
  });

  // TODO: add callback call after all
  socket.on('sendMessage', (message, room_id) => {
    const user = getUser(socket.id);
    const messageToStore = {
      name: user.name,
      user_id: user.user_id,
      room_id,
      text: message
    }
    const newMessage = new Message(messageToStore);
    newMessage.save().then((res) => {
      io.to(user.room_id).emit('message', res);
    });
  });

  socket.on('get-messages-history', (room_id) => {
    Message.find({ room_id }).then(result => {
        socket.emit('output-messages', result)
    })
})

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
  });
});

server.listen(PORT, () => {
  loggerService.log(`listening on http://localhost:${PORT}`);
});
