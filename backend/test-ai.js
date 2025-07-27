const axios = require('axios');

async function testAIService() {
  try {
    console.log('🧪 Testing AI Service directly...');
    
    // Create a simple test image (black square 100x100)
    const canvas = require('canvas').createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 100, 100);
    
    // Add a simple face-like shape
    ctx.fillStyle = 'white';
    ctx.fillRect(30, 30, 40, 40); // face
    ctx.fillStyle = 'black';
    ctx.fillRect(35, 40, 5, 5); // left eye
    ctx.fillRect(50, 40, 5, 5); // right eye
    ctx.fillRect(40, 55, 10, 3); // mouth
    
    const testImageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    
    console.log('📊 Image data length:', testImageBase64.length);
    console.log('🖼️ Image data preview:', testImageBase64.substring(0, 100) + '...');
    
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
