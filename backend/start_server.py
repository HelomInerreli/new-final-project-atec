"""
Simple script to start the uvicorn server from the correct directory
"""
import os
import sys

# Change to the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)
print(f"Changed working directory to: {backend_dir}")

# Start uvicorn
os.system("python -m uvicorn app.main:app --reload --port 8000")
