require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

// public 폴더 정적 서빙
app.use(express.static('public'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// .env 값을 브라우저에서 바로 가져올 수 없어서 config.js 파일을 웹 서버가 실행될 때 만듦
app.get('/config.js', (req, res) => {
    res.type('.js');
    res.send(`window.CONFIG = {
        BASE_URL: '${process.env.BASE_URL}'
        };`);
});

// 클라이언트에서 http 요청 메소드 중 get을 이용해서 host:port로 요청 보내면 실행되는 라우트
app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/public/page/login/login.html")
})

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + "/public/page/signup/signup.html")
})

app.get('/home', (req, res) => {
    res.sendFile(__dirname + "/public/page/home/home.html")
})

app.get('/write', (req, res) => {
    res.sendFile(__dirname + "/public/page/write_post/write_post.html")
})

app.get('/detail', (req,res)=>{
    res.sendFile(__dirname+"/public/page/post_detail/post_detail.html")
})

app.get('/my', (req,res)=>{
    res.sendFile(__dirname + "/public/page/my/my.html")
})

// app.listen() 함수를 사용해서 서버 실행
// 클라이언트는 'host:port'로 노드 서버에 요청 보낼 수 있음
app.listen(process.env.PORT, () => {
    console.log(`start server http://localhost:${process.env.PORT}`);
})