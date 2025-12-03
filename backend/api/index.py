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

# Import the FastAPI app
from main import app

# Export for Vercel
handler = app
app = app
