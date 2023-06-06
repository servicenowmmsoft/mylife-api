// import dependencies
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import logger from 'morgan';
import cors from 'cors';

// import mainRoutes from './routes/main.js';
// import uploadRoutes from './routes/upload.js';
// import userRoutes from './routes/user.js';
// import realestateRoutes from './routes/realestate.route.js';
// import reBookingsRoutes from './routes/reBookings.route.js';
// import reReviewsRoutes from './routes/reReviews.route.js';
// import reInvoiceRoutes from './routes/reInvoice.route.js';

import { Server } from "socket.io";
import { createServer } from 'http';

// set up dependencies
const app = express();
app.use(cors());
app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));

// set up mongoose
const username = "admin", password = "UX1NOyjuL4BFxaO7", database = "production", server = "1ibyk";
const URLDATABASE = `mongodb+srv://${username}:${password}@cluster0.${server}.mongodb.net/${database}?retryWrites=true&w=majority`;
mongoose.connect(URLDATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database mongodb connected');
  })
  .catch((error) => {
    console.log('Error connecting to database');
  });

// set up route
// app.use('/api', mainRoutes);
// app.use('/api', uploadRoutes);
// app.use('/api', userRoutes);
// app.use('/api', realestateRoutes);
// app.use('/api', reBookingsRoutes);
// app.use('/api', reReviewsRoutes);
// app.use('/api', reInvoiceRoutes);

app.get('/', (req, res) => {
  res.status(200).json('Welcome to MYLIFE - API');
});

// Start the server
const PORT = process.env.PORT || 6868;

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

let users = []

io.on("connection", (socket) => {

  var sessionId = socket.id;

  socket.on("disconnect", () => {
    users = users.filter(v => v.sessionId != sessionId);
    socket.emit('getUsers', users)
    console.log("user disconnected");
  });
  socket.on("messageOnServer", (res) => {
    console.log(res + " connected");
    io.emit("ServerSend", res);
  });

  socket.on('addUser', (userId) => {
    if(!users.some((user) => user.userId === userId))
      users.push({userId, sessionId})
    socket.emit('getUsers', users)
  });

  socket.on("join", (roomName) => {
    // console.log(" - RoomId: " + roomName)
    socket.join(roomName);
  });

  socket.on("message", ({ message, roomName }) => {
    const outgoingMessage = {
      message,
    };
    socket.to(roomName).emit("message", outgoingMessage);
  });

  socket.on("messageWithData", ({ data, prevSelected, turnIs, roomName }) => {
    var datasource = {
      data, prevSelected, turnIs
    }
    socket.to(roomName).emit("messageWithData", datasource);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Our server is running on port ${PORT}`);
});