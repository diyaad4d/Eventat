
const request = require('supertest');
const express = require('express');
const app = express();


app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

describe('Functional MVP Test', () => {


    it('GET /api/health should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('OK');
    });


    it('Response time should be less than 200ms', async () => {
        const start = Date.now();
        await request(app).get('/api/health');
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(200);
    });

});