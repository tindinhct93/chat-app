const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');

const models = require('../models');
const {User,Message} = models;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const TODAY_START = new Date().setHours(0, 0, 0, 0);

const Filter = require('bad-words');
const {generateMessage} = require('./utils/messages.js')
const expressHbs = require('express-handlebars');
const moment = require('moment')

const app = express();
//Body Parser
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))

//Cookie parser
let cookieParser = require('cookie-parser');
app.use(cookieParser('tin'));

// Static
app.use('/img',(req,res,next)=> {
    if (!req.cookie.user) {
        res.redirect('/login')
    }
})
const publicDirectoryPath = path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));

//Appp

const server = http.createServer(app);
const io = socketio(server);

//Constant
const port = process.env.PORT || 3000;
const ALERT_DANGER = 'alert-danger';
const LOGIN_ERR_MSG = 'Incorrect username or password';

//HBS
let hbs = expressHbs.create({
    handlebars:require('handlebars'),
    extname: 'hbs',
    helpers: {
        displayTime: function (time) {
            return moment(time).format("hh:mm a")
        }
    }
});
app.set('views', path.join(__dirname, "../views"));
app.engine('hbs',hbs.engine);
app.set('view engine', 'hbs');

//Login
app.get('/login',(req,res) => {
    res.render('login',{
        layout: false
    })
});

app.post('/login',async (req,res,next)=> {
    try    {
        const {username,password} = req.body;
        let user = await User.findOne({
            where: {
                username
            }})
        if (!user) {
            return res.render('login', {
                message: LOGIN_ERR_MSG,
                type: ALERT_DANGER
            })
        }
        // Sửa thành middleware.......
        let isMatch = password === user.password
        if (isMatch) {
            res.cookie('user',user.username, {
                signed:true,
                httpOnly: true,
                maxAge: 30000000000,
            });
            res.locals.user = user.username;
            return res.redirect('/');
        }
        else {
            return res.render('login', {
                message: LOGIN_ERR_MSG,
                type: ALERT_DANGER,
            })
        }
    } catch (e) {
        console.error(`Can not login with error ${String(e)}`)
        next(e)
    }
})

app.get('/',async (req,res)=>{
    if (!req.signedCookies.user) {
        res.locals.message = LOGIN_ERR_MSG;
        res.locals.type = ALERT_DANGER;
        return res.redirect('/login')
    }
    res.locals.user = req.signedCookies.user;
    let messages = await Message.findAll({
        where: {
            createdAt : {
                [Op.gte]: TODAY_START
            }
        },
        include: [{model: User}],
    })
    messageHTML = "";
    messages.forEach(item => {
        messageHTML += `<div class="message">
    <p>
        <span class="message__name">${item.User ? item.User.username :null}</span>
        <span class="message__meta">${moment(item.createdAt).format("hh:mm a")}</span>
    </p>
    <p>${item.message}</p>
    </div>`
    })

    res.locals.messageHTML = messageHTML;
    res.render("index", {layout:false})
})

let room = [];
const cookie = require('cookie');
io.on('connection', async (socket)=>{
    console.log("New Socket");
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    const user = cookies.user.toString().split(".")[0].split(":")[1];
    let userDB = await User.findOne({
        where: {
            username:user
        }})
    room.push(user)
    io.emit('join',JSON.stringify(room));

    socket.on('sendMessage', async (message,callback)=>{
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed")
        }
        await Message.create({message,userId:userDB.id});
        io.emit('message', generateMessage(message,user));
        callback()
    })

    socket.on('sendLocation',(coords,callback)=>{
        io.emit('message',`Location: ${coords.latitude}, ${coords.longitude}`);
        callback()
    })

    socket.on('disconnect', ()=>{
        index = room.indexOf(user)
        room.splice(index,1)
        io.emit('left', JSON.stringify(room))
    })
});

app.use((err,req,res,next)=> {
    res.send(JSON.stringify(err));
})
/*
server.listen(port,"192.168.1.19", ()=>{
    console.log('server is ok on ',port)
})
*/

app.get('/sync',async (req,res)=> {
    let model =require('../models');
    await model.sequelize.sync();
    res.send('Sync completed');
})

server.listen(port, ()=>{
    console.log('server is ok on ',port)
})

//Thứ tự thực hiện:
//Render ra index.hbs
//Nhập tên và password user vào
// Nếu ok chuyển qua màn hình chat // đặt 1 middleware cho màn hình chat
// Chuyển thành hbs hết
//OK//Tạo database posegre vs 2 bảng post/user
//OK//Post: createdAt, user, message
//Render ra tin nhắn của 1 ngày trước nằm trong cái hbs
// Tin nhắn mới sẽ lưu vào DB và khi nào reload lại link sẽ render lại.
// Nếu đăng nhập sẽ lấy sessionnname để render tao username.
// Tìm cách up hình
// TÌm cách scrooll trang
// Nghiên cứu việc thêm avartar kế

//Model: user
//Model message Message, sentBy

//sequelize model:generate --name User --attributes username:string password:string avatarPath:text
//sequelize model:generate --name Message --attributes message:text

//migrate thêm 1 trường displayname

// Còn 3 vấn đề:
//ok 1 lúc render ra 2 tin nhắn
//ok Cuộn trang xuống cuối.
// Display username in the list
// Nếu vô thì thêm vô, ra thì rút ra.
// Change the nickname.
// Up hình lên avartar
// Up hình vào khung chat
// Xem lịch sử chat theo ngày

// Room bao nhiêu người thì render ra, nếu có thì tô màu xanh/ Không có tô màu đỏ.