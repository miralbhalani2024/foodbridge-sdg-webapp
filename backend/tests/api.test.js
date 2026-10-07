/**
 * API TESTS (Jest + Supertest) — send real HTTP requests to the Express app
 * WITHOUT starting a server and WITHOUT needing MongoDB.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
const request = require('supertest');
const app = require('../src/app');

describe('API basics', () => {
  test('GET /api/health → 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('unknown route → 404 Not Found', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('creating a donation without a token → 401 Unauthorized', async () => {
    const res = await request(app).post('/api/donations').send({ title: 'Rice' });
    expect(res.statusCode).toBe(401);
  });

  test('invalid token → 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not.a.real.token');
    expect(res.statusCode).toBe(401);
  });

  test('vanilla JS page is served from /public', async () => {
    const res = await request(app).get('/impact.html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('FoodBridge');
  });
});
