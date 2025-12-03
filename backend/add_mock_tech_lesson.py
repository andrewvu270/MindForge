"""
Add 1 mock Technology lesson with a good quiz, video, and audio
"""
import uuid
import asyncio
from datetime import datetime
from database import db
from services.image_generation_service import ImageGenerationService
from services.auto_content_generator import AutoContentGenerator

async def add_mock_lesson():
    """Add a mock tech lesson with quiz, video, and audio"""
    
    lesson_id = str(uuid.uuid4())
    
    image_service = ImageGenerationService()
    generator = AutoContentGenerator()
    
    # Create lesson
    lesson = {
        'id': lesson_id,
        'field_id': 'tech',
        'field_name': 'Technology',
        'title': 'Introduction to Cloud Computing',
        'content': '''Cloud computing has revolutionized how businesses and individuals store, process, and access data. Instead of relying on local servers or personal computers, cloud computing allows users to access computing resources over the internet.

**What is Cloud Computing?**
Cloud computing is the delivery of computing services—including servers, storage, databases, networking, software, and analytics—over the internet ("the cloud"). This model offers faster innovation, flexible resources, and economies of scale.

**Key Benefits:**
1. **Cost Savings**: No need to invest in expensive hardware
2. **Scalability**: Easily scale resources up or down based on demand
3. **Accessibility**: Access your data from anywhere with an internet connection
4. **Reliability**: Built-in backup and disaster recovery
5. **Security**: Enterprise-grade security measures

**Types of Cloud Services:**
- **IaaS** (Infrastructure as a Service): Provides virtualized computing resources
- **PaaS** (Platform as a Service): Offers a platform for developing applications
- **SaaS** (Software as a Service): Delivers software applications over the internet

**Popular Cloud Providers:**
Major players include Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP). Each offers a comprehensive suite of services for businesses of all sizes.

Understanding cloud computing is essential in today's digital landscape, as it powers everything from mobile apps to enterprise systems.''',
        'summary': 'Learn the fundamentals of cloud computing, including key concepts, benefits, and major service providers.',
        'difficulty_level': 'beginner',
        'estimated_minutes': 8,
        'points': 15,
        'is_published': True,
        'created_at': datetime.now().isoformat()
    }
    
    # Create quiz questions (correct_answer is the index 0-3)
    questions = [
        {
            'id': str(uuid.uuid4()),
            'lesson_id': lesson_id,
            'question': 'What is cloud computing?',
            'options': [
                'A type of weather phenomenon',
                'Delivery of computing services over the internet',
                'A physical storage device',
                'A programming language'
            ],
            'correct_answer': 1,  # Index of correct option
            'explanation': 'Cloud computing is the delivery of computing services—including servers, storage, databases, and more—over the internet, allowing users to access resources remotely.',
            'points': 5
        },
        {
            'id': str(uuid.uuid4()),
            'lesson_id': lesson_id,
            'question': 'Which of the following is NOT a benefit of cloud computing?',
            'options': [
                'Cost savings',
                'Scalability',
                'Requires expensive local hardware',
                'Accessibility from anywhere'
            ],
            'correct_answer': 2,  # Index of correct option
            'explanation': 'Cloud computing actually eliminates the need for expensive local hardware, as resources are provided over the internet. This is one of its key benefits.',
            'points': 5
        },
        {
            'id': str(uuid.uuid4()),
            'lesson_id': lesson_id,
            'question': 'What does SaaS stand for?',
            'options': [
                'Server as a Service',
                'Software as a Service',
                'Security as a Service',
                'Storage as a Service'
            ],
            'correct_answer': 1,  # Index of correct option
            'explanation': 'SaaS (Software as a Service) delivers software applications over the internet, eliminating the need for local installation and maintenance.',
            'points': 5
        },
        {
            'id': str(uuid.uuid4()),
            'lesson_id': lesson_id,
            'question': 'Which company is NOT mentioned as a major cloud provider?',
            'options': [
                'Amazon Web Services (AWS)',
                'Microsoft Azure',
                'Google Cloud Platform',
                'Apple iCloud Services'
            ],
            'correct_answer': 3,  # Index of correct option
            'explanation': 'While Apple offers iCloud for consumer storage, the lesson specifically mentions AWS, Azure, and GCP as the major enterprise cloud providers.',
            'points': 5
        },
        {
            'id': str(uuid.uuid4()),
            'lesson_id': lesson_id,
            'question': 'What type of cloud service provides virtualized computing resources?',
            'options': [
                'SaaS',
                'PaaS',
                'IaaS',
                'DaaS'
            ],
            'correct_answer': 2,  # Index of correct option
            'explanation': 'IaaS (Infrastructure as a Service) provides virtualized computing resources over the internet, including servers, storage, and networking.',
            'points': 5
        }
    ]
    
    print("=" * 60)
    print("ADDING MOCK TECH LESSON WITH VIDEO & AUDIO")
    print("=" * 60)
    print()
    
    try:
        # Generate images
        print("🎨 Generating images...")
        images = []
        image_prompts = [
            "Cloud computing servers in a modern data center",
            "Digital cloud storage concept with floating data",
            "Network of connected devices in the cloud",
            "Cloud service providers AWS Azure Google Cloud logos",
            "Scalable cloud infrastructure diagram",
            "Secure cloud computing with encryption"
        ]
        
        for i, prompt in enumerate(image_prompts, 1):
            print(f"   {i}/6: {prompt[:40]}...")
            try:
                image_url = await image_service.generate_image(prompt)
                if image_url:
                    images.append(image_url)
            except Exception as e:
                print(f"      ⚠️  Image generation failed: {e}")
        
        lesson['images'] = images
        print(f"✅ Generated {len(images)} images")
        print()
        
        # Generate video using AutoContentGenerator's internal methods
        print("🎬 Generating video with TTS narration...")
        try:
            # Copy the working video generation code
            from services.free_video_service import FreeVideoService
            from services.supabase_storage import get_supabase_storage
            
            video_service = FreeVideoService()
            storage_service = get_supabase_storage()
            
            # Generate complete audio track (narration + music)
            audio_result = await generator.audio_mixer.create_lesson_audio(
                lesson_content=lesson['content'],
                field='tech',
                duration_seconds=180
            )
            
            if audio_result.get('success'):
                mixed_audio = audio_result['mixed_audio']
                
                # Create video with images and audio
                video_b64 = await video_service.create_lesson_video(
                    lesson_data=lesson,
                    images=images,
                    audio_clips=[mixed_audio],  # Wrap single audio track in list
                    duration_seconds=180
                )
                
                if video_b64 and storage_service.is_configured():
                    video_url = await storage_service.upload_video_base64(
                        video_base64=video_b64,
                        lesson_id=lesson_id
                    )
                    if video_url:
                        lesson['video_url'] = video_url
                        print(f"✅ Video: {video_url[:60]}...")
        except Exception as e:
            print(f"⚠️  Video generation failed: {e}")
        
        print()
        
        # Insert lesson
        print(f"📚 Saving lesson to database...")
        db.client.table('lessons').insert(lesson).execute()
        print(f"✅ Lesson created with ID: {lesson_id}")
        print()
        
        # Insert quiz questions
        print(f"❓ Adding {len(questions)} quiz questions...")
        for i, q in enumerate(questions, 1):
            try:
                db.client.table('quizzes').insert(q).execute()
                print(f"   {i}. {q['question'][:50]}...")
            except Exception as e:
                print(f"   ⚠️  Failed to add question {i}: {e}")
                continue
        
        print()
        print("=" * 60)
        print("SUCCESS!")
        print("=" * 60)
        print()
        print(f"✅ Added 1 Technology lesson with {len(questions)} quiz questions")
        print()
        print("View it:")
        print(f"  GET http://localhost:8000/api/lessons/{lesson_id}")
        print(f"  GET http://localhost:8000/api/quiz/lesson/{lesson_id}")
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(add_mock_lesson())
