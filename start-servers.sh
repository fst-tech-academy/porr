#!/bin/bash

echo "🚀 Starting PORR Servers..."

# Start backend server
echo "📡 Starting backend server..."
cd server
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🖥️ Starting frontend server..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📡 Backend PID: $BACKEND_PID"
echo "🖥️ Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Access your application at: http://localhost:3009"
echo "🔧 Backend API at: http://localhost:5009"

# Keep script running
wait
