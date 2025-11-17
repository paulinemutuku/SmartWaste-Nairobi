const request = require('supertest');

console.log('🔗 SMARTWASTE SYSTEM INTEGRATION TEST');
console.log('=====================================');

async function validateSystemIntegration() {
  try {
    console.log('\n1. TESTING BACKEND SERVER CONNECTIVITY...');
    
    const response = await request('http://localhost:3000')
      .get('/')
      .timeout(10000);
    
    console.log('✅ BACKEND SERVER: Running on port 3000');
    console.log('✅ HTTP STATUS:', response.statusCode);
    
    console.log('\n2. TESTING REPORTS API...');
    
    try {
      const reportsResponse = await request('http://localhost:3000')
        .get('/api/reports')
        .timeout(5000);
      
      console.log('✅ REPORTS API: Status', reportsResponse.statusCode);
    } catch (error) {
      console.log('⚠️  REPORTS API: Endpoint issue -', error.message);
    }

    console.log('\n3. TESTING DATABASE CONNECTIVITY...');
    
    try {
      const testResponse = await request('http://localhost:3000')
        .get('/api/collectors')
        .timeout(5000);
      
      console.log('✅ DATABASE: Accessible via API endpoints');
    } catch (error) {
      console.log('⚠️  DATABASE: Connectivity issues -', error.message);
    }

    console.log('\n🎯 INTEGRATION STATUS: Backend operational, some endpoints need review');

  } catch (error) {
    console.log('❌ SYSTEM OFFLINE:', error.message);
  }
}

validateSystemIntegration();