const request = require('supertest');
const express = require('express');

const app = express();
app.get('/doran', (req,res)=>{
    res.send('Test page');
});

describe('GET /', () => {
    it('should return Test page', async() => {
        const res = await request(app).get('/doran');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Test page');
    })
})