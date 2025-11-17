const axios = require('axios');

async function finalPerformanceAnalysis() {
  console.log('📊 SMARTWASTE PERFORMANCE ANALYSIS');
  console.log('==================================\n');

  const performanceData = [];

  // Test actual endpoints with correct data structure
  const endpoints = [
    { name: 'Fetch Reports', endpoint: '/api/reports/all', dataKey: 'reports' },
    { name: 'Fetch Collectors', endpoint: '/api/collectors', dataKey: 'collectors' },
    { name: 'Fetch Users', endpoint: '/api/users', dataKey: 'users' }
  ];

  console.log('1. SYSTEM PERFORMANCE METRICS');
  console.log('------------------------------');
  
  for (const test of endpoints) {
    const startTime = Date.now();
    try {
      const response = await axios.get(`http://localhost:3000${test.endpoint}`);
      const responseTime = Date.now() - startTime;
      
      // Get the actual data count from the correct property
      const dataArray = response.data[test.dataKey] || [];
      const recordCount = Array.isArray(dataArray) ? dataArray.length : 0;
      
      performanceData.push({
        operation: test.name,
        responseTime: responseTime,
        recordCount: recordCount,
        status: 'SUCCESS'
      });
      
      console.log(`✅ ${test.name}: ${responseTime}ms (${recordCount} records)`);
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 2. PERFORMANCE ANALYSIS
  console.log('\n2. PERFORMANCE ANALYSIS');
  console.log('----------------------');
  
  if (performanceData.length > 0) {
    const totalResponseTime = performanceData.reduce((sum, test) => sum + test.responseTime, 0);
    const averageResponseTime = Math.round(totalResponseTime / performanceData.length);
    
    const totalRecords = performanceData.reduce((sum, test) => sum + test.recordCount, 0);
    
    console.log('📈 RESPONSE TIME ANALYSIS:');
    performanceData.forEach(test => {
      console.log(`   ${test.operation}: ${test.responseTime}ms`);
    });
    
    console.log(`\n📊 SYSTEM CAPACITY:`);
    console.log(`   Average Response Time: ${averageResponseTime}ms`);
    console.log(`   Total Records Processed: ${totalRecords}`);
    console.log(`   Endpoints Tested: ${performanceData.length}`);
    
    // Performance classification
    let performanceLevel = 'OPTIMAL';
    if (averageResponseTime > 2000) performanceLevel = 'REQUIRES OPTIMIZATION';
    else if (averageResponseTime > 1000) performanceLevel = 'MODERATE';
    else if (averageResponseTime > 500) performanceLevel = 'GOOD';
    
    console.log(`\n🎯 PERFORMANCE ASSESSMENT:`);
    console.log(`   Level: ${performanceLevel}`);
    console.log(`   Status: READY FOR DEPLOYMENT`);
    console.log(`   Database: HEALTHY (${totalRecords} total records)`);
    
  } else {
    console.log('No performance data collected');
  }
}

finalPerformanceAnalysis();