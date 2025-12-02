from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

class Database:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        self.client: Client = None
        
    def connect(self):
        """Initialize Supabase client"""
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        self.client = create_client(self.supabase_url, self.supabase_key)
        return self.client
    
    def get_client(self) -> Client:
        """Get Supabase client, initializing if necessary"""
        if self.client is None:
            self.connect()
        return self.client

# Global database instance
db = Database()
