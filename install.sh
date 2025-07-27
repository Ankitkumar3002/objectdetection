#!/bin/bash

echo "========================================"
echo "AI Detection App - Installation Script"
echo "========================================"
echo

echo "Installing dependencies for all services..."
echo

echo "[1/4] Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install root dependencies"
    exit 1
fi

echo "[2/4] Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies"
    exit 1
fi

echo "[3/4] Installing backend dependencies..."
cd ../backend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies"
    exit 1
fi

echo "[4/4] Installing AI service dependencies..."
cd ../ai-service
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install AI service dependencies"
    echo "Please check Python installation and try again"
    exit 1
fi

cd ..

echo
echo "========================================"
echo "Installation completed successfully!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Update .env files if needed"
echo "3. Run 'npm run dev' to start all services"
echo
echo "For detailed setup instructions, see SETUP.md"
echo
