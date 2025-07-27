# AI Detection Application Setup Guide

## Prerequisites

Before running the application, make sure you have the following installed:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Python** (v3.8 or higher) - [Download here](https://python.org/)
3. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
4. **Git** - [Download here](https://git-scm.com/)

## Installation Steps

### 1. Install Dependencies

Run the following command in the root directory to install all dependencies:

```bash
npm run install:all
```

This will install dependencies for:
- Root project (concurrently for running all services)
- Frontend (React application)
- Backend (Node.js/Express API)
- AI Service (Python packages)

### 2. Environment Configuration

The `.env` files have been created with default values. Update them as needed:

#### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/aidetection
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
AI_SERVICE_URL=http://localhost:5000
PORT=3001
NODE_ENV=development
UPLOAD_DIR=./uploads
```

#### AI Service (.env)
```
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

Or use MongoDB Atlas (cloud) and update the MONGODB_URI in backend/.env

### 4. Python Dependencies

The AI service requires specific Python packages. Install them using:

```bash
cd ai-service
pip install -r requirements.txt
```

**Note:** Some packages like `dlib` might require additional system dependencies:

**Windows:**
- Install Visual Studio Build Tools or Visual Studio Community
- Install CMake

**macOS:**
```bash
brew install cmake
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential cmake
sudo apt-get install libopenblas-dev liblapack-dev 
sudo apt-get install libx11-dev libgtk-3-dev
```

### 5. Run the Application

#### Option 1: Run All Services (Recommended)
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:3001
- AI Service on http://localhost:5000

#### Option 2: Run Services Individually

**Frontend:**
```bash
npm run dev:frontend
```

**Backend:**
```bash
npm run dev:backend
```

**AI Service:**
```bash
npm run dev:ai
```

## Default Admin Account

To create an admin account, register a new user and then manually update the role in MongoDB:

1. Register a new account through the frontend
2. Connect to MongoDB:
   ```bash
   mongo aidetection
   ```
3. Update the user role:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## API Testing

The backend provides the following endpoints:

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Detection
- POST `/api/detection/upload` - Upload file for detection
- POST `/api/detection/realtime` - Real-time detection
- GET `/api/detection/history` - Get detection history

### Health Check
- GET `/api/health` - Backend health check
- GET `http://localhost:5000/api/health` - AI service health check

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in backend/.env

2. **Python Package Installation Errors**
   - Make sure you have the required system dependencies
   - Try using a virtual environment:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     pip install -r requirements.txt
     ```

3. **Port Already in Use**
   - Check if ports 3000, 3001, or 5000 are being used by other applications
   - Change ports in the respective .env files

4. **CORS Errors**
   - Ensure the frontend and backend URLs are correctly configured
   - Check the CORS configuration in backend/server.js

5. **AI Service Errors**
   - Make sure all Python dependencies are installed correctly
   - Check Python version compatibility
   - Ensure you have sufficient memory for AI models

### Performance Tips

1. **AI Service Optimization**
   - The AI service loads models on startup, which may take some time
   - Consider implementing model caching for production
   - Use GPU acceleration if available (CUDA for TensorFlow)

2. **Database Optimization**
   - Create indexes for frequently queried fields
   - Consider using MongoDB Atlas for better performance
   - Implement data archival for old detections

3. **Frontend Optimization**
   - Build the React app for production: `npm run build`
   - Use a CDN for static assets
   - Implement lazy loading for better performance

## Production Deployment

For production deployment:

1. **Security**
   - Change all default secrets and passwords
   - Use HTTPS for all communications
   - Implement rate limiting and input validation
   - Set secure environment variables

2. **Scaling**
   - Use PM2 for Node.js process management
   - Consider using Docker containers
   - Implement load balancing for multiple instances
   - Use a reverse proxy (nginx)

3. **Monitoring**
   - Implement logging with services like Winston
   - Set up error tracking (Sentry)
   - Monitor API performance and database queries
   - Set up health checks for all services

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all dependencies are correctly installed
3. Ensure all services are running on the correct ports
4. Check the GitHub issues for known problems
5. Create a new issue with detailed error information

## License

This project is licensed under the MIT License - see the LICENSE file for details.
