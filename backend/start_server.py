import os
import sys

# Set the working directory to the backend folder
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

# Add the backend directory to sys.path
sys.path.insert(0, backend_dir)

# Run uvicorn
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
