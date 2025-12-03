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

# Import the FastAPI app
from main import app

# Vercel expects 'app' to be the ASGI application
# No need for 'handler' - just export 'app'
