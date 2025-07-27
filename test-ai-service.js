const axios = require('axios');

async function testAIService() {
  try {
    console.log('🧪 Testing AI Service directly...');
    
    // Create a simple base64 test image (1x1 pixel red dot)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
    
    const response = await axios.post('http://localhost:5000/api/detect-realtime', {
      image_data: testImageBase64,
      detection_type: 'both'
    }, {
      timeout: 10000
    });
    
    console.log('✅ AI Service Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ AI Service Error:', error.message);
    if (error.response) {
      console.error('Error Response:', error.response.data);
    }
  }
}

testAIService();
