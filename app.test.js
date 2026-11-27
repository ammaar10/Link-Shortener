const request = require('supertest');
const app = require('./app');

test('health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('nope');
});

test('rejects an invalid URL', async () => {
  const res = await request(app).post('/api/links').send({ url: 'not a url' });
  expect(res.statusCode).toBe(400);
});
