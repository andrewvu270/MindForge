"""
Vercel serverless function handler for FastAPI
"""
import sys
import os
from pathlib import Path

# Add parent directory to path so we can import main
parent_dir = str(Path(__file__).parent.parent)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Set environment variable to indicate we're in Vercel
os.environ["VERCEL"] = "1"

try:
    # Import the FastAPI app
    from main import app
    
    # Export for Vercel
    handler = app
except Exception as e:
    # Create a minimal error app if import fails
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def error_root():
        return {"error": f"Failed to initialize app: {str(e)}"}
    
    handler = app
