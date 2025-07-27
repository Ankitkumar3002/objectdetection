import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Play, Square, AlertCircle, Smile, Frown } from 'lucide-react';
import { detectionAPI } from '../services/api';

const Detection = () => {
  const [activeTab, setActiveTab] = useState('camera');
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionType, setDetectionType] = useState('all'); // New state for detection type
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        
        // Start detection loop
        intervalRef.current = setInterval(detectFromCamera, 2000); // Detect every 2 seconds
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
    setDetectionResults(null);
  };

  const detectFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    try {
      setIsProcessing(true);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('📸 Sending image data for detection...');
      console.log('📊 Image data format:', imageData.substring(0, 50) + '...');
      console.log('📊 Image data length:', imageData.length);
      console.log('🎯 Detection type:', detectionType);
      
      const result = await detectionAPI.detectFromImage(imageData, detectionType);
      console.log('✅ Detection result received:', result);
      
      // Extract the actual detection data
      const detectionData = result.data || result;
      setDetectionResults(detectionData.results || detectionData);
      setError('');
    } catch (err) {
      console.error('❌ Detection error:', err);
      setError('Detection failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setIsProcessing(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await detectionAPI.detectFromFile(formData);
      setDetectionResults(result);
    } catch (err) {
      console.error('Upload detection error:', err);
      setError('Upload detection failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTopEmotion = (emotions) => {
    if (!emotions) return { emotion: 'neutral', confidence: 0 };
    
    const topEmotion = Object.entries(emotions).reduce((a, b) => 
      emotions[a[0]] > emotions[b[0]] ? a : b
    );
    
    return {
      emotion: topEmotion[0],
      confidence: (topEmotion[1] * 100).toFixed(1)
    };
  };

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy': return <Smile className="w-5 h-5 text-green-500" />;
      case 'sad': return <Frown className="w-5 h-5 text-blue-500" />;
      case 'angry': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'surprised': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'fear': return <AlertCircle className="w-5 h-5 text-purple-500" />;
      case 'disgust': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <div className="w-5 h-5 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI Detection & Expression Analysis
        </h1>

        {/* Detection Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detection Type
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All (Face + Body + Objects)', icon: '🔍' },
              { value: 'face', label: 'Face Detection', icon: '👤' },
              { value: 'body', label: 'Body Pose', icon: '🦴' },
              { value: 'objects', label: 'Object Detection', icon: '🎯' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setDetectionType(type.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  detectionType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'camera'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Camera className="w-4 h-4 inline mr-2" />
            Live Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload File
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detection Input */}
          <div className="card">
            {activeTab === 'camera' ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Live Camera Detection</h2>
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p>Detecting...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {!isStreaming ? (
                      <button
                        onClick={startCamera}
                        className="btn-primary flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Camera
                      </button>
                    ) : (
                      <button
                        onClick={stopCamera}
                        className="btn-secondary flex items-center"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop Camera
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Image/Video</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Choose a file
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                    />
                  </label>
                  <p className="text-gray-500 mt-2">
                    or drag and drop an image or video file
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detection Results */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {detectionResults ? (
              <div className="space-y-6">
                {/* Face Detection Results */}
                {detectionResults.faces && detectionResults.faces.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Faces Detected: {detectionResults.faces.length}
                    </h3>
                    {detectionResults.faces.map((face, index) => {
                      const topEmotion = getTopEmotion(face.emotions);
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">Face {index + 1}</span>
                            <span className="text-sm text-gray-500">
                              Confidence: {(face.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          {/* Expression Analysis */}
                          <div className="mb-3">
                            <div className="flex items-center mb-2">
                              {getEmotionIcon(topEmotion.emotion)}
                              <span className="ml-2 font-medium capitalize">
                                {topEmotion.emotion}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                ({topEmotion.confidence}%)
                              </span>
                            </div>
                            
                            {/* All Emotions */}
                            <div className="space-y-1">
                              {Object.entries(face.emotions).map(([emotion, confidence]) => (
                                <div key={emotion} className="flex items-center">
                                  <span className="w-16 text-sm capitalize">{emotion}:</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${confidence * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-sm text-gray-600">
                                    {(confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Objects Detection Results */}
                {detectionResults.objects && detectionResults.objects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      🎯 Objects Detected: {detectionResults.objects.length}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detectionResults.objects.map((object, index) => (
                        <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-green-800 capitalize">
                              📦 {object.name}
                            </span>
                            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {(object.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Position: ({object.boundingBox.x}, {object.boundingBox.y})
                            <br />
                            Size: {object.boundingBox.width} × {object.boundingBox.height}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body Parts Detection */}
                {detectionResults.bodyParts && detectionResults.bodyParts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Body Parts Detected: {detectionResults.bodyParts.length}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {detectionResults.bodyParts.map((part, index) => (
                        <div key={index} className="bg-gray-50 rounded p-2">
                          <span className="text-sm font-medium capitalize">
                            {part.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {(part.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!detectionResults.faces || detectionResults.faces.length === 0) &&
                 (!detectionResults.bodyParts || detectionResults.bodyParts.length === 0) &&
                 (!detectionResults.objects || detectionResults.objects.length === 0) && (
                  <div className="text-center text-gray-500 py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No objects detected in this image.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>Start camera or upload a file to see detection results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detection;
