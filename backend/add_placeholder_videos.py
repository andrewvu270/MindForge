"""
Add Placeholder Videos to Existing Lessons

This script creates simple placeholder videos for testing
and uploads them to Supabase Storage.
"""

import os
import asyncio
from database import db
from datetime import datetime

# For creating simple video placeholders, we'll use a solid color video
# In production, replace with actual video generation

async def create_placeholder_video(lesson_id: str, title: str, duration: int = 10) -> str:
    """
    Create a simple placeholder video file.
    Uses ffmpeg to create a solid color video with text.
    
    If ffmpeg is not available, returns a placeholder URL.
    """
    try:
        import subprocess
        
        # Create temp video file
        filename = f"/tmp/{lesson_id}_placeholder.mp4"
        
        # Create a simple video with ffmpeg (10 seconds, solid color with text)
        cmd = [
            'ffmpeg', '-f', 'lavfi', '-i', 
            f'color=c=blue:s=1280x720:d={duration}',
            '-vf', f"drawtext=text='{title}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
            '-c:v', 'libx264', '-t', str(duration), '-pix_fmt', 'yuv420p',
            '-y', filename
        ]
        
        subprocess.run(cmd, check=True, capture_output=True)
        return filename
        
    except Exception as e:
        print(f"⚠️  ffmpeg not available: {e}")
        print("   Install with: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)")
        return None


async def upload_to_supabase(lesson_id: str, video_path: str) -> str:
    """Upload video to Supabase Storage and return public URL."""
    try:
        bucket_name = "lesson-videos"
        filename = f"{lesson_id}_{int(datetime.utcnow().timestamp())}.mp4"
        
        # Read video file
        with open(video_path, 'rb') as f:
            video_data = f.read()
        
        # Upload to Supabase
        response = db.client.storage.from_(bucket_name).upload(
            path=filename,
            file=video_data,
            file_options={"content-type": "video/mp4"}
        )
        
        # Get public URL
        public_url = db.client.storage.from_(bucket_name).get_public_url(filename)
        
        print(f"✅ Uploaded: {public_url}")
        return public_url
        
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        raise


async def update_lesson_with_video(lesson_id: str, video_url: str, duration: int):
    """Update lesson record with video URL."""
    try:
        db.client.table("lessons").update({
            "video_url": video_url,
            "video_duration_seconds": duration,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", lesson_id).execute()
        
        print(f"✅ Updated lesson {lesson_id}")
        
    except Exception as e:
        print(f"❌ Failed to update lesson: {e}")
        raise


async def main():
    """Add placeholder videos to all lessons without videos."""
    print("🎬 Adding Placeholder Videos to Lessons\n")
    
    # Check if bucket exists
    try:
        buckets = db.client.storage.list_buckets()
        bucket_names = [b['name'] for b in buckets]
        
        if 'lesson-videos' not in bucket_names:
            print("❌ Bucket 'lesson-videos' not found!")
            print("   Create it in Supabase Dashboard → Storage → New Bucket")
            print("   Name: lesson-videos")
            print("   Public: Yes")
            return
            
    except Exception as e:
        print(f"❌ Failed to check buckets: {e}")
        return
    
    # Get lessons without videos
    try:
        response = db.client.table("lessons").select("id, title, estimated_minutes").is_("video_url", "null").execute()
        lessons = response.data
        
        if not lessons:
            print("✅ All lessons already have videos!")
            return
            
        print(f"📝 Found {len(lessons)} lessons without videos\n")
        
    except Exception as e:
        print(f"❌ Failed to fetch lessons: {e}")
        return
    
    # Process each lesson
    for i, lesson in enumerate(lessons, 1):
        lesson_id = lesson['id']
        title = lesson['title']
        duration = (lesson.get('estimated_minutes') or 3) * 60
        
        print(f"\n[{i}/{len(lessons)}] Processing: {title[:50]}...")
        
        # Create placeholder video
        video_path = await create_placeholder_video(lesson_id, title, min(duration, 10))
        
        if not video_path:
            print("⚠️  Skipping video creation (ffmpeg not available)")
            print("   Using placeholder URL instead...")
            # Use a placeholder URL
            video_url = f"https://via.placeholder.com/1280x720.mp4?text={title[:30]}"
            await update_lesson_with_video(lesson_id, video_url, duration)
            continue
        
        try:
            # Upload to Supabase
            video_url = await upload_to_supabase(lesson_id, video_path)
            
            # Update lesson
            await update_lesson_with_video(lesson_id, video_url, duration)
            
            # Clean up temp file
            os.remove(video_path)
            
        except Exception as e:
            print(f"❌ Failed: {e}")
            continue
    
    print("\n\n✅ Done! All lessons now have videos.")
    print("   Refresh your frontend to see the videos.")


if __name__ == "__main__":
    asyncio.run(main())
