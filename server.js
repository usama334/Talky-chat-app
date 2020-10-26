let express = require('express');
let mongoose = require('mongoose');
let cors = require('cors');
let bodyParser = require('body-parser');
let config = require('./config/config');
// let firebase=require('./config/firebase-config');
const path = require('path');
const auth = require('./middleware/auth')
const cookieParser = require('cookie-parser');
const socket = require('socket.io');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// PORT


// proxy middleware options
// const options = {
//   target: 'http:localhost:4000', // target host
//   changeOrigin: true, // needed for virtual hosted sites
//   ws: true, // proxy websockets

// };

// // create the proxy (without context)
// const apiProxy = createProxyMiddleware(options);

// var allowedOrigins = "http://localhost:3000/* http://127.0.0.1:3000*";

const app = express();
var http = require('http').Server(app);
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());
app.use(cookieParser());


// socket io


var io = require('socket.io')(server);

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});


// Express Route
const userRoute = require('./routes/user.route')
const friendsRoute = require('./routes/friends.route')
const messagesRoute = require('./routes/messages.route');

// Connecting mongoDB Database
mongoose.Promise = global.Promise;
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Database sucessfully connected!')
},
  error => {
    console.log('Could not connect to database : ' + error)
  }
)




// app.get('/users',auth, (req,res)=>{

// })
// routes
app.use('/api/users', userRoute);
app.use('/api/friends', friendsRoute);
app.use('/api/messages', messagesRoute);
// app.get('/', (req, res) => {
//   res.send('Hello from MERN');

// });




// 404 Error
// app.use((req, res, next) => {
//   next(createError(404));
// });

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});


// if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
app.use(express.static('client/build'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});
// }



// socket io 


users = [];

io.on('connection', function (socket) {
  // var roomno = socket.handshake.query.convoId;

  //  if(io.nsps['/'].adapter.rooms["room-"+roomno] );
  socket.on('startConversation', function (data) {
    socket.join("room-" + data.roomno);
    // console.log('User joined the room: '+ data.roomno);

  })
  socket.on('friendActionPerformed', function(data){
    console.log('Testtt');
    io.sockets.emit('updateFriendList', {});
  })

  //Send this event to everyone in the room.
  // io.in("room-" + roomno).emit('connectToRoom', "You are in room no. " + roomno);
  socket.emit('testConnection', { data: 'test connection success' });


  socket.on('new-msg', function (data) {
    // console.log('new-msg from: ' + data.sender_id);
    // console.log(roomno + ' is room no');
    //Send message in created room
    io.sockets.emit('updateMessagesCount',{});
    io.in('room-' + data.roomno).emit('render-msg', data);
  })
});



