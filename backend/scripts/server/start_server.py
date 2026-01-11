"""
Start Development Server
Runs uvicorn with auto-reload for development.

Usage:
    python -m scripts.server.start_server
    OR
    cd backend && python scripts/server/start_server.py
"""

import os
import sys
from pathlib import Path

# Set the working directory to the backend folder
backend_root = Path(__file__).parent.parent.parent
os.chdir(backend_root)

# Add the backend directory to sys.path
sys.path.insert(0, str(backend_root))

# Run uvicorn
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
