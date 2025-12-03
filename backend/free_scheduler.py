"""
Free Content Generation Scheduler
Generates 100 lessons/day using completely free services
"""
import asyncio
import schedule
import time
import logging
from datetime import datetime

from services.auto_content_generator import get_generator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def run_free_generation():
    """Run free content generation (100 lessons/day)."""
    logger.info("=" * 60)
    logger.info("🚀 Starting FREE content generation")
    logger.info(f"⏰ Time: {datetime.now().isoformat()}")
    logger.info("💰 Cost: $0.00 (100% FREE)")
    logger.info("=" * 60)
    
    try:
        generator = get_generator()
        
        # Generate 100 lessons across all fields
        field_targets = {
            'tech': 25,
            'finance': 25,
            'economics': 15,
            'culture': 15,
            'influence': 10,
            'global': 10
        }
        
        total_generated = 0
        
        for field_id, count in field_targets.items():
            logger.info(f"📚 Generating {count} lessons for {field_id}...")
            
            lessons = await generator.generate_lessons_for_field(
                field_id=field_id,
                count=count
            )
            
            generated_count = len(lessons)
            total_generated += generated_count
            
            logger.info(f"✅ Generated {generated_count}/{count} lessons for {field_id}")
        
        logger.info("=" * 60)
        logger.info(f"🎉 SUCCESS: Generated {total_generated} lessons")
        logger.info("💰 Total cost: $0.00")
        logger.info("📊 Free tier usage:")
        logger.info("   - Groq API: ~300 requests (limit: 14,400)")
        logger.info("   - HuggingFace: ~600 requests (limit: 1,000)")
        logger.info("   - FFmpeg: Local processing (FREE)")
        logger.info("=" * 60)
        
        # Cleanup old lessons
        await generator.cleanup_old_lessons(days_old=7)
        logger.info("🧹 Cleaned up old lessons")
        
    except Exception as e:
        logger.error(f"❌ Free generation failed: {e}", exc_info=True)
    
    logger.info("✨ Free content generation complete!")


def run_async_job(coro):
    """Helper to run async function in sync context."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(coro)
    finally:
        loop.close()


def start_free_scheduler():
    """
    Start the free content generation scheduler.
    Generates 100 lessons daily at 2 AM.
    """
    logger.info("🚀 Starting FREE content generation scheduler...")
    logger.info("📅 Schedule: Daily at 2:00 AM")
    logger.info("📊 Target: 100 lessons per day")
    logger.info("💰 Cost: $0.00 per day")
    logger.info("🔧 Stack: Groq + HuggingFace + FFmpeg")
    
    # Schedule daily generation at 2 AM
    schedule.every().day.at("02:00").do(
        lambda: run_async_job(run_free_generation())
    )
    
    # Optional: Run immediately for testing
    # logger.info("🧪 Running test generation...")
    # run_async_job(run_free_generation())
    
    logger.info("⏰ Scheduler started. Waiting for 2:00 AM...")
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    start_free_scheduler()
