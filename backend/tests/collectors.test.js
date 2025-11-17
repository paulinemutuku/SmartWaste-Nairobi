const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('👷 Collector Management API Tests', () => {
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

  test('✅ Create new collector account', async () => {
    const collectorData = {
      name: 'John Collector',
      email: 'john.collector@smartwaste.com',
      phone: '+254712345678',
      zone: 'Dandora'
    };

    const response = await request(app)
      .post('/api/collectors')
      .send(collectorData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.collector.name).toBe('John Collector');
    expect(response.body.collector.zone).toBe('Dandora');
  });

  test('✅ Get all collectors', async () => {
    const response = await request(app)
      .get('/api/collectors');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.collectors)).toBe(true);
  });

  test('✅ Assign route to collector', async () => {
    const collectorResponse = await request(app)
      .post('/api/collectors')
      .send({
        name: 'Test Collector',
        email: 'test.collector@smartwaste.com',
        phone: '+254712345679',
        zone: 'Kayole'
      });

    const collectorId = collectorResponse.body.collector._id;

    const routeData = {
      routeId: 'ROUTE_TEST_001',
      clusterId: 'CLUSTER_TEST_001',
      clusterName: 'Test Cluster Area',
      gpsCoordinates: [-1.2765, 36.9087],
      assignedDate: new Date().toISOString(),
      scheduledDate: new Date().toISOString(),
      status: 'scheduled',
      reportCount: 5,
      notes: 'Test route assignment'
    };

    const routeResponse = await request(app)
      .post(`/api/collectors/${collectorId}/assign-route`)
      .send(routeData);

    expect(routeResponse.status).toBe(200);
    expect(routeResponse.body.route.status).toBe('scheduled');
    expect(routeResponse.body.route.reportCount).toBe(5);
  });

  test('✅ Update collector route status', async () => {
    const collectorResponse = await request(app)
      .post('/api/collectors')
      .send({
        name: 'Status Test Collector',
        email: 'status.test@smartwaste.com',
        phone: '+254712345680',
        zone: 'Kilimani'
      });

    const collectorId = collectorResponse.body.collector._id;

    const routeResponse = await request(app)
      .post(`/api/collectors/${collectorId}/assign-route`)
      .send({
        routeId: 'ROUTE_STATUS_TEST',
        clusterId: 'CLUSTER_STATUS_TEST',
        clusterName: 'Status Test Area',
        gpsCoordinates: [-1.2921, 36.8219],
        status: 'scheduled'
      });

    const routeId = routeResponse.body.route._id;

    const updateResponse = await request(app)
      .put(`/api/collectors/${collectorId}/routes/${routeId}/status`)
      .send({ status: 'completed' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.route.status).toBe('completed');
    expect(updateResponse.body.route.completedAt).toBeDefined();
  });
});