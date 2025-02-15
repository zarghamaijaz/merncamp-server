import express from "express"
import mongoose from "mongoose"
import cors from "cors"
require("dotenv").config();

// import {readdirSync} from "fs"



const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    path: "/socket.io",
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-type"],
}});

//db
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser:true,
    useFindAndModify:false,
    useUniFiedTopology:true,
    useCreateIndex:true
}).then(()=>console.log("Database connected"))
.catch(err=>console.log(err));

// Middlewares

app.use(express.json({
    limit:"5mb"
}))
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:["http://localhost:3000", process.env.CLIENT_URL],
}))

// autoload routes from directory
// readdirSync('./api/routes').map(r => app.use('/api', require(`./routes/${r}`)));

app.get('/', (req,res) => {
    return res.send("HOME");
});
app.get('/test', (req,res) => {
    return res.send("Hello");
});
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/post'));

// socket.io
// io.on('connect', (socket)=>{
//     console.log("SOCKET => ", socket.id)
//     socket.on('send-message', (message) => {
//         console.log("Message Received", message);
//     })
// })
io.on('connect', (socket)=>{
    console.log("SOCKET => ", socket.id)
    socket.on('new-post', (newPost) => {
        console.log("New post created", newPost);
        socket.broadcast.emit('new-post', newPost);
    })
})


const port = process.env.PORT || 8000;


http.listen(port, ()=>console.log("App is running on port ", port))
module.exports = app;