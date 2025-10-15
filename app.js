const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'))

// 클라이언트에서 http 요청 메소드 중 get을 이용해서 host:port로 요청 보내면 실행되는 라우트
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/html/login.html")
});

// app.listen() 함수를 사용해서 서버 실행
// 클라이언트는 'host:port'로 노드 서버에 요청 보낼 수 있음
app.listen(port, ()=>{
    console.log(`start server http://localhost:${port}`);
})