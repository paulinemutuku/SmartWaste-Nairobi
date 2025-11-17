const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); 

const TEST_MONGODB_URI = 'mongodb+srv://smartwaste:SmartWaste123@cluster0.bqz6d8a.mongodb.net/smartwaste-test?retryWrites=true&w=majority&appName=Cluster0';

describe('🔐 Authentication API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_MONGODB_URI, {
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

  test('✅ User registration with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@nairobi.com',
      password: 'password123',
      role: 'resident'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('test@nairobi.com');
    expect(response.body.token).toBeDefined();
  });

  test('❌ User registration with duplicate email', async () => {
    const userData = {
      name: 'Test User',
      email: 'duplicate@nairobi.com',
      password: 'password123'
    };

    await request(app).post('/api/auth/register').send(userData);

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('already exists');
  });
});