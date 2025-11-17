const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('🚮 Waste Reporting API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb+srv://smartwaste:SmartWaste123@cluster0.bqz6d8a.mongodb.net/smartwaste-test?retryWrites=true&w=majority&appName=Cluster0', {
      serverSelectionTimeoutMS: 5000,
    });
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('✅ Submit waste report with GPS coordinates', async () => {
    const reportData = {
      description: 'Overflowing bin near Dandora Market',
      location: 'Dandora Phase 4',
      latitude: -1.2833,
      longitude: 36.8167,
      wasteType: 'general',
      userId: '65a1b2c3d4e5f67890123456'
    };

    const response = await request(app)
      .post('/api/reports/submit')
      .send(reportData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.report.latitude).toBe(-1.2833);
    expect(response.body.report.longitude).toBe(36.8167);
    expect(response.body.report.status).toBe('submitted');
  });

  test('✅ Retrieve all waste reports', async () => {
    const response = await request(app)
      .get('/api/reports/all');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.reports)).toBe(true);
  });

  test('✅ Update report priority and status', async () => {
    const reportResponse = await request(app)
      .post('/api/reports/submit')
      .send({
        description: 'Test report for update',
        location: 'Kayole',
        latitude: -1.2765,
        longitude: 36.9087,
        userId: '65a1b2c3d4e5f67890123456'
      });

    const reportId = reportResponse.body.report._id;

    const updateResponse = await request(app)
      .put(`/api/reports/${reportId}`)
      .send({ priority: 'high', status: 'in-progress' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.report.priority).toBe('high');
    expect(updateResponse.body.report.status).toBe('in-progress');
  });
});