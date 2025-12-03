"""
Background Scheduler for Automatic Content Generation
Runs daily to generate fresh lessons
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


async def run_daily_generation():
    """Run the daily content generation job."""
    logger.info("=" * 50)
    logger.info("Starting daily content generation job")
    logger.info(f"Time: {datetime.now().isoformat()}")
    logger.info("=" * 50)
    
    try:
        generator = get_generator()
        lessons = await generator.generate_daily_content()
        
        logger.info(f"✓ Successfully generated {len(lessons)} lessons")
        
        # Also cleanup old lessons (30+ days old)
        await generator.cleanup_old_lessons(days_old=30)
        logger.info("✓ Cleaned up old lessons")
        
    except Exception as e:
        logger.error(f"✗ Daily generation failed: {e}", exc_info=True)
    
    logger.info("=" * 50)
    logger.info("Daily content generation job complete")
    logger.info("=" * 50)


def run_async_job(coro):
    """Helper to run async function in sync context."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(coro)
    finally:
        loop.close()


def start_scheduler():
    """
    Start the background scheduler.
    Generates content daily at 2 AM.
    """
    logger.info("Starting content generation scheduler...")
    logger.info("Schedule: Daily at 2:00 AM")
    logger.info("Targets: 8 lessons per day across all fields")
    
    # Schedule daily generation at 2 AM
    schedule.every().day.at("02:00").do(
        lambda: run_async_job(run_daily_generation())
    )
    
    # Optional: Run immediately on startup for testing
    # run_async_job(run_daily_generation())
    
    logger.info("Scheduler started. Waiting for scheduled time...")
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


if __name__ == "__main__":
    start_scheduler()
