const request = require('supertest');
const app = require('../../server'); 

describe('API Integration Tests', () => {
  test('GET /api/reports/all returns 200 status', async () => {
    const response = await request(app).get('/api/reports/all');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('POST /api/reports/submit validates required fields', async () => {
    const response = await request(app)
      .post('/api/reports/submit')
      .send({
        description: 'Test report',
        userId: '507f1f77bcf86cd799439011'
      });
    
    expect(response.status).toBe(400);
  });
});