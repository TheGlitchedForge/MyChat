const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server,{cors:{origin:"*"}});

app.use(cors());
app.use(express.json());

let users = {};
function chatId(a,b){ return [a,b].sort().join("_"); }

/* SIGNUP */
app.post("/signup",(req,res)=>{
const {username,password}=req.body;
if(users[username]) return res.json({ok:false,msg:"exists"});
users[username]={password};
res.json({ok:true});
});

/* LOGIN */
app.post("/login",(req,res)=>{
const {username,password}=req.body;
if(!users[username]) return res.json({ok:false,msg:"noUser"});
if(users[username].password!==password) return res.json({ok:false,msg:"wrongPass"});
res.json({ok:true});
});

/* SOCKET */
io.on("connection",socket=>{
socket.on("joinPrivate",({me,other})=>{
socket.join(chatId(me,other));
});
socket.on("privateMsg",d=>{
io.to(chatId(d.me,d.other)).emit("privateMsg",d);
});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>console.log("Server running"));
