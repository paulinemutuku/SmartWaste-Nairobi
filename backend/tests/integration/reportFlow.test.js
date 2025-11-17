const request = require('supertest');
const app = require('../../server');
const Report = require('../../models/Report');

async function integrationTest() {
  console.log('🚀 STARTING INTEGRATION TEST...');
  
  try {
    console.log('1. Testing database connection...');
    const testReport = await Report.findOne();
    console.log('✅ Database connected - Found reports:', !!testReport);
    
    console.log('2. Testing API endpoint...');
    const response = await request(app).get('/api/reports');
    console.log('✅ API working - Status:', response.statusCode);
    
    console.log('3. Testing report submission...');
    const reportData = {
      description: "Integration test waste",
      location: "Test Location",
      latitude: -1.2921,
      longitude: 36.8219
    };
    
    const submitResponse = await request(app)
      .post('/api/reports')
      .send(reportData);
    
    console.log('✅ Report submitted - Status:', submitResponse.statusCode);
    console.log('📝 Report ID:', submitResponse.body._id);
    
    console.log('🎉 ALL INTEGRATION TESTS PASSED!');
    
  } catch (error) {
    console.log('❌ Integration test failed:', error.message);
  }
}

integrationTest();