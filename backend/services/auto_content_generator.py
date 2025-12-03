"""
Automatic Content Generation Service
Generates fresh lessons daily from trending topics and news sources
"""
import asyncio
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict
import uuid

from services.free_llm_service import get_free_llm_service
from services.image_generation_service import get_image_generation_service
from services.audio_mixer_service import get_audio_mixer_service
from services.free_video_service import get_free_video_service
from services.supabase_storage import get_supabase_storage
from agents.video_planning_agent import get_video_planning_agent
from services.source_adapter import SourceAdapter
from services.adapters.reddit_adapter import RedditAdapter
from services.adapters.hackernews_adapter import HackerNewsAdapter
from services.adapters.rss_adapter import RSSAdapter
from database import db

logger = logging.getLogger(__name__)


class AutoContentGenerator:
    """
    Automatically generates lessons from trending topics and news.
    Runs as a background job to keep content fresh.
    """
    
    def __init__(self):
        self.llm_service = get_free_llm_service()
        self.image_service = get_image_generation_service()
        self.audio_mixer = get_audio_mixer_service()
        self.video_service = get_free_video_service()
        self.storage_service = get_supabase_storage()
        self.video_planner = get_video_planning_agent()
        
        # Check if video generation is enabled (for server deployment)
        self.enable_video_generation = os.getenv('ENABLE_VIDEO_GENERATION', 'false').lower() == 'true'
        if self.enable_video_generation:
            logger.info("✅ Video generation ENABLED (will upload to Supabase)")
        else:
            logger.info("⚠️ Video generation DISABLED (on-demand only)")
        
        # Initialize source adapters
        self.adapters = {
            'reddit': RedditAdapter(),
            'hackernews': HackerNewsAdapter(),
            'rss': RSSAdapter()
        }
        
        # Field-specific topics to track
        self.field_topics = {
            'tech': ['AI', 'machine learning', 'blockchain', 'cybersecurity', 'cloud computing'],
            'finance': ['stock market', 'cryptocurrency', 'investing', 'personal finance', 'trading'],
            'economics': ['inflation', 'GDP', 'monetary policy', 'trade', 'labor market'],
            'culture': ['social media', 'art', 'philosophy', 'communication', 'trends'],
            'influence': ['leadership', 'persuasion', 'negotiation', 'public speaking', 'emotional intelligence'],
            'global': ['breaking news', 'world news', 'international', 'geopolitics', 'current events']  # Prioritize latest news
        }
        
        # Field-specific source preferences
        self.field_sources = {
            'global': ['rss', 'hackernews'],  # Prioritize news sources for Global Events
            'tech': ['hackernews', 'reddit', 'rss'],
            'finance': ['reddit', 'rss', 'hackernews'],
            'default': ['reddit', 'hackernews', 'rss']
        }
        
        # Generation targets per day
        self.daily_targets = {
            'tech': 2,      # 2 tech lessons per day
            'finance': 2,   # 2 finance lessons per day
            'economics': 1, # 1 economics lesson per day
            'culture': 1,   # 1 culture lesson per day
            'influence': 1, # 1 influence lesson per day
            'global': 1     # 1 global lesson per day
        }
    
    async def generate_daily_content(self):
        """
        Main method to generate daily content for all fields.
        Should be called once per day (e.g., via cron job).
        """
        logger.info("Starting daily content generation...")
        
        generated_lessons = []
        
        for field_id, target_count in self.daily_targets.items():
            try:
                lessons = await self.generate_lessons_for_field(field_id, target_count)
                generated_lessons.extend(lessons)
                logger.info(f"Generated {len(lessons)} lessons for {field_id}")
            except Exception as e:
                logger.error(f"Failed to generate lessons for {field_id}: {e}")
        
        logger.info(f"Daily content generation complete. Total: {len(generated_lessons)} lessons")
        return generated_lessons
    
    async def generate_lessons_for_field(self, field_id: str, count: int = 1) -> List[Dict]:
        """
        Generate multiple lessons for a specific field.
        
        Args:
            field_id: Field identifier (tech, finance, etc.)
            count: Number of lessons to generate
            
        Returns:
            List of generated lessons
        """
        lessons = []
        topics = self.field_topics.get(field_id, [])
        
        # If no topics defined for this field, use generic topics
        if not topics:
            logger.warning(f"No topics defined for field {field_id}, using generic topics")
            topics = ['latest trends', 'key concepts', 'fundamentals', 'advanced topics', 'practical applications']
        
        for i in range(count):
            try:
                # Pick a topic (rotate through topics)
                topic = topics[i % len(topics)]
                
                # Fetch trending content for this topic
                sources = await self.fetch_trending_content(field_id, topic)
                
                if len(sources) < 2:
                    logger.warning(f"Not enough sources for {field_id}/{topic}, skipping...")
                    continue
                
                # Generate lesson from sources
                lesson = await self.generate_lesson_from_sources(
                    field_id=field_id,
                    topic=topic,
                    sources=sources
                )
                
                if lesson:
                    lessons.append(lesson)
                    
                    # Generate quiz for the lesson
                    await self.generate_quiz_for_lesson(lesson)
                    
                    # Generate flashcards for the lesson
                    await self.generate_flashcards_for_lesson(lesson)
                    
            except Exception as e:
                logger.error(f"Failed to generate lesson {i+1} for {field_id}: {e}")
        
        return lessons
    
    async def fetch_trending_content(self, field_id: str, topic: str, limit: int = 5) -> List[Dict]:
        """
        Fetch trending content from multiple sources.
        Prioritizes news sources for Global Events field.
        
        Args:
            field_id: Field identifier
            topic: Topic to search for
            limit: Maximum number of sources per adapter
            
        Returns:
            List of content sources
        """
        all_sources = []
        
        # Get preferred sources for this field
        preferred_sources = self.field_sources.get(field_id, self.field_sources['default'])
        
        # For Global Events, use latest news queries
        if field_id == 'global':
            # Override topic with "latest news" to get current events
            topic = f"breaking news {topic}" if topic not in ['breaking news', 'world news'] else topic
        
        # Try adapters in preferred order
        for adapter_name in preferred_sources:
            adapter = self.adapters.get(adapter_name)
            if not adapter:
                continue
                
            try:
                sources = await adapter.fetch(
                    topic=topic,
                    limit=limit
                )
                all_sources.extend(sources)
            except Exception as e:
                logger.warning(f"Adapter {adapter_name} failed for {topic}: {e}")
        
        # Sort by recency (most recent first) - critical for Global Events
        all_sources.sort(key=lambda x: x.get('published_date', ''), reverse=True)
        
        # For Global Events, prioritize content from last 24 hours
        if field_id == 'global':
            from datetime import datetime, timedelta
            yesterday = (datetime.now() - timedelta(days=1)).isoformat()
            recent_sources = [s for s in all_sources if s.get('published_date', '') > yesterday]
            if recent_sources:
                all_sources = recent_sources
        
        return all_sources[:10]  # Return top 10 most recent
    
    async def generate_lesson_from_sources(
        self, 
        field_id: str, 
        topic: str, 
        sources: List[Dict]
    ) -> Dict:
        """
        Generate a lesson by synthesizing multiple sources.
        
        Args:
            field_id: Field identifier
            topic: Lesson topic
            sources: List of content sources
            
        Returns:
            Generated lesson data
        """
        try:
            # Normalize sources
            normalized_sources = []
            for source in sources:
                normalized_sources.append({
                    'source_type': source.get('type', 'article'),
                    'source': source.get('source', 'Unknown'),
                    'title': source.get('title', ''),
                    'content': source.get('content', ''),
                    'url': source.get('url', ''),
                    'published_date': source.get('published_date', datetime.now().isoformat())
                })
            
            # Use free LLM service for synthesis
            lesson_content = await self.llm_service.synthesize_lesson(
                sources=normalized_sources,
                field=field_id,
                max_words=300
            )
            
            # Create lesson record
            lesson_id = str(uuid.uuid4())
            field_names = {
                'tech': 'Technology',
                'finance': 'Finance',
                'economics': 'Economics',
                'culture': 'Culture',
                'influence': 'Influence',
                'global': 'Global Events'
            }
            
            lesson = {
                'id': lesson_id,
                'title': f"{topic.title()}: {lesson_content.get('title', 'Latest Insights')}",
                'content': lesson_content.get('content', ''),
                'field_id': field_id,
                'field_name': field_names.get(field_id, 'General'),
                'difficulty_level': self.determine_difficulty(lesson_content),
                'estimated_minutes': self.estimate_reading_time(lesson_content.get('content', '')),
                'learning_objectives': lesson_content.get('learning_objectives', []),
                'key_concepts': lesson_content.get('key_concepts', []),
                'sources': normalized_sources,
                'created_at': datetime.now().isoformat(),
                'is_auto_generated': True
            }
            
            # Generate images for the lesson video using intelligent planning
            images = []
            try:
                # Get video duration based on difficulty
                # Easy: 60s, Medium: 180s, Hard: 300s
                video_duration = self.get_video_duration_for_difficulty(lesson['difficulty_level'])
                
                logger.info(f"🎬 Planning video structure for {lesson['difficulty_level']} lesson ({video_duration}s)")
                
                # Use AI agent to plan optimal video structure
                video_plan = await self.video_planner.plan_video_structure(
                    lesson_content=lesson['content'],
                    lesson_title=lesson['title'],
                    field=field_id,
                    target_duration=video_duration,
                    difficulty=lesson['difficulty_level']
                )
                
                num_slides = video_plan['total_slides']
                logger.info(f"📋 Video plan: {num_slides} slides")
                logger.info(f"💡 Reasoning: {video_plan.get('reasoning', 'N/A')[:100]}...")
                
                # Generate image prompts from video plan
                slide_prompts = await self.video_planner.generate_slide_prompts(
                    video_plan=video_plan,
                    lesson_title=lesson['title'],
                    field=field_id
                )
                
                # Generate images for each slide
                for i, prompt in enumerate(slide_prompts, 1):
                    slide_info = video_plan['slides'][i-1] if i <= len(video_plan['slides']) else {}
                    logger.info(f"🎨 Generating slide {i}/{num_slides}: {slide_info.get('title', 'Slide')}...")
                    logger.info(f"   Duration: {slide_info.get('duration_seconds', 10)}s")
                    
                    # 9:16 portrait aspect ratio for TikTok/Reels style videos
                    result = await self.image_service.generate_image(prompt, width=1080, height=1920)
                    if result.get("success") and result.get("image_url"):
                        images.append(result["image_url"])
                        logger.info(f"   ✅ Generated with {result.get('provider')}")
                
                logger.info(f"✅ Generated {len(images)} images total for {video_duration}s video")
                
                # Note: video_plan not stored in DB (would need migration)
                
            except Exception as e:
                logger.warning(f"Intelligent video planning failed: {e}, using fallback")
                # Fallback: simple calculation
                video_duration = self.get_video_duration_for_difficulty(lesson['difficulty_level'])
                num_slides = max(4, min(8, video_duration // 10))
                
                logger.info(f"🎬 Fallback: Generating {num_slides} images for {video_duration}s video")
                
                # Mascot descriptions by field (Wes Anderson claymation style)
                mascot_prompts = {
                    "tech": "Funny unique claymation mascot character, Wes Anderson aesthetic, pastel sage green background, symmetrical centered composition. A round clay figure with overly tiny glasses and exaggerated messy coder hair, wearing a miniature tech hoodie stuffed with too many gadgets. Holding a comically small laptop. Soft matte clay texture, stop-motion animation style, warm studio lighting, dry deadpan expression, full body visible with stubby arms and legs.",
                    "finance": "Funny unique claymation mascot character, Wes Anderson aesthetic, pastel light blue background, symmetrical centered composition. A plump clay figure wearing an absurdly serious banker vest and a tie that's way too short, holding an oversized piggy bank. Soft matte clay texture, stop-motion animation style, warm studio lighting, dry deadpan expression, full body visible with stubby arms and legs.",
                    "economics": "Funny unique claymation mascot character, Wes Anderson aesthetic, pastel soft yellow background, symmetrical centered composition. A quirky clay economist with giant circular glasses slipping down their face, holding a tiny supply-and-demand graph. Soft matte clay texture, stop-motion animation style, warm studio lighting, dry deadpan expression, full body visible with stubby arms and legs.",
                    "soft_skills": "Funny unique claymation mascot character, Wes Anderson aesthetic, pastel peach-coral background, symmetrical centered composition. A clay figure wearing a cardigan with comically large elbow patches, holding a miniature speech bubble. Soft matte clay texture, stop-motion animation style, warm studio lighting, dry deadpan expression, full body visible with stubby arms and legs.",
                    "events": "Funny unique claymation mascot character, Wes Anderson aesthetic, pastel lavender background, symmetrical centered composition. A clay figure dressed like an overly enthusiastic news reporter with a headset mic too big for its head, holding a wonky miniature spinning globe. Soft matte clay texture, stop-motion animation style, warm studio lighting, dry deadpan expression, full body visible with stubby arms and legs.",
                    "culture": "Funny unique claymation mascot character, Wes Anderson aesthetic, pastel warm orange background, symmetrical centered composition. A clay figure wearing a hilariously dramatic folkloric scarf, holding a tiny theater mask with a confused expression. Soft matte clay texture, stop-motion animation style, warm studio lighting, dry deadpan expression, full body visible with stubby arms and legs.",
                }
                
                # Get mascot for this field (default to tech)
                mascot_base = mascot_prompts.get(field_id.lower(), mascot_prompts["tech"])
                
                # Slide templates with mascot presenting the content
                slide_templates = [
                    f"{mascot_base} The mascot is presenting a title card that says '{lesson['title']}'. Educational slide design.",
                    f"{mascot_base} The mascot is pointing at an introduction board explaining the topic. Minimalist design.",
                    f"{mascot_base} The mascot is showing a diagram with main concepts. Infographic style with icons.",
                    f"{mascot_base} The mascot is teaching with a detailed explanation chart behind them.",
                    f"{mascot_base} The mascot is highlighting key points on a summary board.",
                    f"{mascot_base} The mascot is demonstrating practical examples with props.",
                    f"{mascot_base} The mascot is wrapping up with conclusion takeaways on a board.",
                    f"{mascot_base} The mascot is waving goodbye with a 'Keep Learning!' sign."
                ]
                
                for i, prompt in enumerate(slide_templates[:num_slides], 1):
                    logger.info(f"🎨 Generating slide {i}/{num_slides} with mascot...")
                    # 9:16 portrait aspect ratio for TikTok/Reels style videos
                    result = await self.image_service.generate_image(prompt, width=1080, height=1920)
                    if result.get("success") and result.get("image_url"):
                        images.append(result["image_url"])
                
                logger.info(f"✅ Generated {len(images)} images total")
            
            # Generate complete audio (TTS narration + background music)
            mixed_audio = None
            try:
                # Get video duration based on difficulty
                video_duration = self.get_video_duration_for_difficulty(lesson['difficulty_level'])
                
                logger.info(f"🎵 Creating complete audio track (narration + music)...")
                audio_result = await self.audio_mixer.create_lesson_audio(
                    lesson_content=lesson['content'],
                    field=field_id,
                    duration_seconds=video_duration or 60
                )
                
                if audio_result.get("success"):
                    mixed_audio = audio_result["mixed_audio"]
                    logger.info(f"✅ Complete audio track created!")
                    logger.info(f"   🎤 Narration clips: {audio_result.get('metadata', {}).get('narration_clips_used', 0)}")
                    logger.info(f"   🎵 Music style: {audio_result.get('metadata', {}).get('music_style', 'unknown')}")
                    logger.info(f"   ⏱️  Duration: {audio_result.get('duration_seconds', 0):.1f}s")
                else:
                    logger.warning(f"Audio creation failed: {audio_result.get('error')}")
                    logger.info("Lesson will be created without audio")
            except Exception as e:
                logger.warning(f"Audio generation failed: {e}")
                logger.info("Lesson will be created without audio")
            
            # Add media to lesson
            if images:
                lesson['images'] = images
            if mixed_audio:
                lesson['audio'] = mixed_audio  # Single mixed audio track
            
            # Get video duration based on difficulty
            video_duration = self.get_video_duration_for_difficulty(lesson['difficulty_level'])
            if video_duration:
                lesson['video_duration_seconds'] = video_duration
            
            # Generate video if enabled on server
            if self.enable_video_generation and images and mixed_audio:
                logger.info(f"🎬 Generating {video_duration}s video for: {lesson['title']} (Difficulty: {lesson['difficulty_level']})")
                video_b64 = await self.video_service.create_lesson_video(
                    lesson_data=lesson,
                    images=images,
                    audio_clips=[mixed_audio],  # Wrap single audio track in list
                    duration_seconds=video_duration
                )
                
                if video_b64:
                    # Upload to Supabase Storage
                    if self.storage_service.is_configured():
                        logger.info(f"📤 Uploading video to Supabase Storage...")
                        video_url = await self.storage_service.upload_video_base64(
                            video_base64=video_b64,
                            lesson_id=lesson['id']
                        )
                        
                        if video_url:
                            lesson['video_url'] = video_url  # Public Supabase URL
                            logger.info(f"✅ Video uploaded to Supabase: {video_url}")
                        else:
                            lesson['video_url'] = None
                            logger.warning(f"⚠️ Failed to upload video to Supabase")
                    else:
                        # Fallback: Store base64 in DB (not recommended)
                        logger.warning(f"⚠️ Supabase not configured, storing base64 in DB")
                        lesson['video_url'] = video_b64
                else:
                    lesson['video_url'] = None
                    logger.warning(f"⚠️ Video generation failed")
            else:
                # Video will be generated on-demand when user requests it
                lesson['video_url'] = None
                logger.info(f"📹 Video will be generated on-demand ({video_duration}s based on {lesson['difficulty_level']} difficulty)")
            
            # Store in database
            await self.store_lesson(lesson)
            
            logger.info(f"Generated complete lesson with media: {lesson['title']}")
            return lesson
            
        except Exception as e:
            logger.error(f"Failed to generate lesson from sources: {e}")
            return None
    
    async def generate_quiz_for_lesson(self, lesson: Dict):
        """
        Generate quiz questions for a lesson.
        Creates a pool of 10-15 questions so users get different questions each time.
        
        Args:
            lesson: Lesson data
        """
        try:
            # Generate a larger pool of questions (10-15)
            # Users will see random 5 questions from this pool each time
            questions = await self.llm_service.generate_quiz(
                lesson_content=lesson['content'],
                num_questions=15  # Create question pool
            )
            
            if questions:
                
                # Store quiz questions
                for question in questions:
                    options = question.get('options', [])
                    correct_answer_raw = question.get('correct_answer', '')
                    
                    # Convert correct_answer to integer index
                    # Handle formats like "A) Answer", "A", "0", or the actual answer text
                    correct_answer_idx = 0
                    if isinstance(correct_answer_raw, int):
                        correct_answer_idx = correct_answer_raw
                    elif isinstance(correct_answer_raw, str):
                        # Try to extract letter (A, B, C, D) and convert to index
                        answer_upper = correct_answer_raw.strip().upper()
                        if answer_upper.startswith('A'):
                            correct_answer_idx = 0
                        elif answer_upper.startswith('B'):
                            correct_answer_idx = 1
                        elif answer_upper.startswith('C'):
                            correct_answer_idx = 2
                        elif answer_upper.startswith('D'):
                            correct_answer_idx = 3
                        elif correct_answer_raw.isdigit():
                            correct_answer_idx = int(correct_answer_raw)
                        else:
                            # Try to find the answer in options
                            for i, opt in enumerate(options):
                                if correct_answer_raw.lower() in opt.lower():
                                    correct_answer_idx = i
                                    break
                    
                    quiz_data = {
                        'id': str(uuid.uuid4()),
                        'lesson_id': lesson['id'],
                        'question': question.get('question'),
                        'options': options,
                        'correct_answer': correct_answer_idx,
                        'explanation': question.get('explanation'),
                        'points': 5,
                        'created_at': datetime.now().isoformat()
                    }
                    db.client.table('quizzes').insert(quiz_data).execute()
                
                logger.info(f"Generated {len(questions)} quiz questions for lesson {lesson['id']}")
                
        except Exception as e:
            logger.error(f"Failed to generate quiz: {e}")
    
    async def generate_flashcards_for_lesson(self, lesson: Dict):
        """Generate flashcards for a lesson."""
        try:
            flashcards = await self.llm_service.generate_flashcards(
                lesson_content=lesson['content'],
                num_cards=10
            )
            
            if flashcards:
                for card in flashcards:
                    flashcard_data = {
                        'id': str(uuid.uuid4()),
                        'lesson_id': lesson['id'],
                        'field_id': lesson['field_id'],
                        'topic': card.get('topic', lesson['title']),
                        'front': card.get('front'),
                        'back': card.get('back'),
                        'difficulty': card.get('difficulty', 'medium'),
                        'created_at': datetime.now().isoformat()
                    }
                    db.client.table('flashcards').insert(flashcard_data).execute()
                
                logger.info(f"Generated {len(flashcards)} flashcards for lesson {lesson['id']}")
                
        except Exception as e:
            logger.error(f"Failed to generate flashcards: {e}")
    
    async def store_lesson(self, lesson: Dict):
        """
        Store lesson in database with retry logic and upsert for duplicates.
        
        Args:
            lesson: Lesson data to store
        """
        import asyncio
        max_retries = 5  # Increased from 3 to 5
        
        for attempt in range(max_retries):
            try:
                # Use upsert to handle duplicate keys (update if exists)
                db.client.table('lessons').upsert(lesson, on_conflict='id').execute()
                logger.info(f"✅ Stored lesson {lesson['id']} in database")
                return
            except Exception as e:
                error_str = str(e)
                # If duplicate key, try with new ID
                if '23505' in error_str or 'duplicate' in error_str.lower():
                    lesson['id'] = str(uuid.uuid4())
                    logger.warning(f"Duplicate key, retrying with new ID: {lesson['id']}")
                    continue
                
                # Check if it's a timeout error
                is_timeout = 'timeout' in error_str.lower() or 'timed out' in error_str.lower()
                
                logger.warning(f"Store attempt {attempt + 1}/{max_retries} failed: {e}")
                
                if attempt < max_retries - 1:
                    # Longer backoff for timeout errors: 2s, 4s, 8s, 16s
                    wait_time = (2 ** (attempt + 1)) if is_timeout else (2 ** attempt)
                    logger.info(f"Retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"❌ Failed to store lesson after {max_retries} attempts: {e}")
                    raise
    
    def determine_difficulty(self, lesson_content: Dict) -> str:
        """
        Determine lesson difficulty based on content complexity.
        Difficulty determines video length:
        - Easy: 1 minute video
        - Intermediate: 3 minutes video
        - Hard: 5 minutes video
        
        Args:
            lesson_content: Lesson content
            
        Returns:
            Difficulty level (Easy, Intermediate, Hard)
        """
        content = lesson_content.get('content', '')
        
        # Heuristic based on content length and complexity
        word_count = len(content.split())
        
        # Easy: Short, simple content (1 min video)
        if word_count < 150:
            return 'Easy'
        # Intermediate: Medium content (3 min video)
        elif word_count < 400:
            return 'Intermediate'
        # Hard: Complex, detailed content (5 min video)
        else:
            return 'Hard'
    
    def get_video_duration_for_difficulty(self, difficulty: str) -> int:
        """
        Get video duration in seconds based on difficulty.
        
        Args:
            difficulty: Difficulty level (Easy, Intermediate, Hard)
            
        Returns:
            Duration in seconds
        """
        duration_map = {
            'Easy': 60,          # 1 minute
            'Intermediate': 180, # 3 minutes
            'Hard': 300          # 5 minutes
        }
        return duration_map.get(difficulty, 180)  # Default to 3 minutes
    
    def estimate_reading_time(self, content: str) -> int:
        """
        Estimate reading time in minutes.
        
        Args:
            content: Lesson content
            
        Returns:
            Estimated minutes
        """
        words = len(content.split())
        # Average reading speed: 200 words per minute
        minutes = max(5, int(words / 200))
        return minutes
    
    async def cleanup_old_lessons(self, days_old: int = 30):
        """
        Remove auto-generated lessons older than specified days.
        Keeps database fresh and relevant.
        
        Args:
            days_old: Remove lessons older than this many days
        """
        try:
            cutoff_date = datetime.now() - timedelta(days=days_old)
            
            response = db.client.table('lessons').delete().match({
                'is_auto_generated': True
            }).lt('created_at', cutoff_date.isoformat()).execute()
            
            logger.info(f"Cleaned up old auto-generated lessons")
            
        except Exception as e:
            logger.error(f"Failed to cleanup old lessons: {e}")


# Singleton instance
_generator = None

def get_generator() -> AutoContentGenerator:
    """Get or create the auto content generator instance."""
    global _generator
    if _generator is None:
        _generator = AutoContentGenerator()
    return _generator
