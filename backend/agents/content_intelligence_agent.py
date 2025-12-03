"""
Content Intelligence Agent
Analyzes user behavior to guide content generation
"""
import logging
from typing import List, Dict
from datetime import datetime, timedelta
from collections import Counter

from .base_agent import BaseAgent, AgentResponse, AgentStatus
from database import db

logger = logging.getLogger(__name__)


class ContentIntelligenceAgent(BaseAgent):
    """
    Analyzes user behavior (reflections, requests, engagement)
    to intelligently guide content generation priorities.
    """
    
    async def process(self, input_data: Dict) -> AgentResponse:
        """
        Analyze user behavior and return content priorities.
        
        Args:
            input_data: Dict with optional filters
            
        Returns:
            AgentResponse with priority topics
        """
        try:
            # Collect all signals
            reflection_topics = await self.analyze_reflections()
            requested_topics = await self.analyze_manual_requests()
            engagement_data = await self.analyze_engagement()
            
            # Calculate priority scores
            priorities = self.calculate_priorities(
                reflection_topics,
                requested_topics,
                engagement_data
            )
            
            # Generate recommendations
            recommendations = self.generate_recommendations(priorities)
            
            return AgentResponse(
                status=AgentStatus.COMPLETED,
                result={
                    "priorities": priorities,
                    "recommendations": recommendations,
                    "signals": {
                        "reflections": len(reflection_topics),
                        "requests": len(requested_topics),
                        "engagement_data": len(engagement_data)
                    }
                },
                metadata={
                    "analyzed_at": datetime.now().isoformat(),
                    "lookback_days": 7
                }
            )
            
        except Exception as e:
            logger.error(f"Content intelligence analysis failed: {e}")
            return AgentResponse(
                status=AgentStatus.FAILED,
                error=str(e)
            )
    
    async def analyze_reflections(self, days: int = 7) -> List[Dict]:
        """
        Extract topics from user reflections.
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of topics with mention counts
        """
        try:
            client = db.client
            cutoff = (datetime.now() - timedelta(days=days)).isoformat()
            
            response = client.table('reflections').select('response').gte(
                'created_at', cutoff
            ).execute()
            
            # Extract topics using LLM
            all_topics = []
            for reflection in response.data:
                text = reflection.get('response', '')
                topics = await self.extract_topics_from_text(text)
                all_topics.extend(topics)
            
            # Count occurrences
            topic_counts = Counter(all_topics)
            
            return [
                {"topic": topic, "mentions": count, "source": "reflection"}
                for topic, count in topic_counts.most_common(20)
            ]
            
        except Exception as e:
            logger.error(f"Reflection analysis failed: {e}")
            return []
    
    async def analyze_manual_requests(self, days: int = 7) -> List[Dict]:
        """
        Analyze manually generated lessons to see what users want.
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of requested topics with counts
        """
        try:
            client = db.client
            cutoff = (datetime.now() - timedelta(days=days)).isoformat()
            
            # Get manually generated lessons
            response = client.table('lessons').select('title, field_id').match({
                'is_auto_generated': False
            }).gte('created_at', cutoff).execute()
            
            # Extract topics
            topics = []
            for lesson in response.data:
                title = lesson.get('title', '')
                field = lesson.get('field_id', '')
                
                # Extract key terms from title
                terms = await self.extract_topics_from_text(title)
                for term in terms:
                    topics.append(f"{field}:{term}")
            
            # Count occurrences
            topic_counts = Counter(topics)
            
            return [
                {"topic": topic, "requests": count, "source": "manual_generation"}
                for topic, count in topic_counts.most_common(20)
            ]
            
        except Exception as e:
            logger.error(f"Manual request analysis failed: {e}")
            return []
    
    async def analyze_engagement(self, days: int = 7) -> List[Dict]:
        """
        Analyze lesson engagement to see what's working.
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of topics with engagement metrics
        """
        try:
            client = db.client
            cutoff = (datetime.now() - timedelta(days=days)).isoformat()
            
            # Get lesson completions
            completions = client.table('lesson_completions').select(
                'lesson_id'
            ).gte('completed_at', cutoff).execute()
            
            # Get quiz results
            quiz_results = client.table('quiz_attempts').select(
                'lesson_id, percentage'
            ).gte('completed_at', cutoff).execute()
            
            # Calculate engagement by topic
            engagement_data = []
            
            # Group by lesson and calculate metrics
            lesson_stats = {}
            for completion in completions.data:
                lesson_id = completion['lesson_id']
                lesson_stats[lesson_id] = lesson_stats.get(lesson_id, 0) + 1
            
            # Add quiz performance
            for result in quiz_results.data:
                lesson_id = result['lesson_id']
                if lesson_id in lesson_stats:
                    lesson_stats[lesson_id] = {
                        'completions': lesson_stats[lesson_id],
                        'avg_score': result['percentage']
                    }
            
            return engagement_data
            
        except Exception as e:
            logger.error(f"Engagement analysis failed: {e}")
            return []
    
    async def extract_topics_from_text(self, text: str) -> List[str]:
        """
        Use LLM to extract topics from text.
        
        Args:
            text: Text to analyze
            
        Returns:
            List of extracted topics
        """
        try:
            prompt = f"""Extract 1-3 key topics from this text. Return only topic names, comma-separated.
            
Text: {text}

Topics:"""
            
            response = await self.llm_service.generate_text(
                prompt=prompt,
                max_tokens=50
            )
            
            # Parse response
            topics = [t.strip().lower() for t in response.split(',')]
            return [t for t in topics if len(t) > 2]
            
        except Exception as e:
            logger.error(f"Topic extraction failed: {e}")
            return []
    
    def calculate_priorities(
        self,
        reflection_topics: List[Dict],
        requested_topics: List[Dict],
        engagement_data: List[Dict]
    ) -> List[Dict]:
        """
        Calculate priority scores for topics.
        
        Args:
            reflection_topics: Topics from reflections
            requested_topics: Topics from manual requests
            engagement_data: Engagement metrics
            
        Returns:
            Sorted list of topics with priority scores
        """
        scores = {}
        
        # Weight reflection mentions
        for item in reflection_topics:
            topic = item['topic']
            scores[topic] = scores.get(topic, 0) + item['mentions'] * 2.0
        
        # Weight manual requests higher
        for item in requested_topics:
            topic = item['topic']
            scores[topic] = scores.get(topic, 0) + item['requests'] * 3.0
        
        # Weight engagement
        for item in engagement_data:
            topic = item.get('topic', '')
            engagement = item.get('engagement_score', 0)
            scores[topic] = scores.get(topic, 0) + engagement * 1.5
        
        # Sort by score
        sorted_topics = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [
            {"topic": topic, "priority_score": score}
            for topic, score in sorted_topics[:20]
        ]
    
    def generate_recommendations(self, priorities: List[Dict]) -> Dict:
        """
        Generate actionable recommendations.
        
        Args:
            priorities: Sorted priority topics
            
        Returns:
            Recommendations for content generation
        """
        if not priorities:
            return {
                "action": "continue_default",
                "message": "No strong signals, continue with default schedule"
            }
        
        top_topic = priorities[0]
        top_score = top_topic['priority_score']
        
        if top_score > 20:
            return {
                "action": "surge_generation",
                "topic": top_topic['topic'],
                "recommended_count": 5,
                "message": f"High demand for {top_topic['topic']}, generate 5 lessons"
            }
        elif top_score > 10:
            return {
                "action": "increase_generation",
                "topic": top_topic['topic'],
                "recommended_count": 3,
                "message": f"Moderate demand for {top_topic['topic']}, generate 3 lessons"
            }
        else:
            return {
                "action": "normal_generation",
                "topics": [p['topic'] for p in priorities[:5]],
                "message": "Generate 1 lesson each for top 5 topics"
            }
