#!/bin/bash
cd /Users/Rafael/Projects/JA-Distribuidora/frontend
echo "Starting JA Distribuidora Frontend Server..."
echo "Environment: VITE_API_URL=$(cat .env.local | grep VITE_API_URL)"
npm run dev