"""
Smart Reflection Analyzer
Extracts deep insights from user reflections to personalize content
"""
import logging
from typing import Dict, List
from datetime import datetime

from services.free_llm_service import get_free_llm_service
from database import db

logger = logging.getLogger(__name__)


class ReflectionAnalyzer:
    """
    Analyzes user reflections to extract:
    - Learning topics and interests
    - Knowledge gaps
    - Learning goals
    - Difficulty preferences
    - Emotional state and motivation
    """
    
    def __init__(self):
        self.llm_service = get_free_llm_service()
    
    async def analyze_reflection(
        self, 
        user_id: str, 
        reflection_text: str,
        reflection_id: str = None
    ) -> Dict:
        """
        Perform deep analysis of user reflection.
        
        Args:
            user_id: User identifier
            reflection_text: User's reflection text
            reflection_id: Optional reflection ID for tracking
            
        Returns:
            Analysis results with topics, goals, gaps, etc.
        """
        try:
            # Perform deep analysis
            analysis = await self.llm_service.analyze_reflection_deep(reflection_text)
            
            # Store analysis results
            await self._store_analysis(user_id, reflection_text, analysis, reflection_id)
            
            # Update user interests
            await self._update_user_interests(user_id, analysis)
            
            # Update user preferences
            await self._update_user_preferences(user_id, analysis)
            
            # Generate content recommendations
            recommendations = await self._generate_recommendations(user_id, analysis)
            
            logger.info(f"Analyzed reflection for user {user_id}: {len(analysis.get('topics', []))} topics")
            
            return {
                "analysis": analysis,
                "recommendations": recommendations,
                "topics_count": len(analysis.get('topics', [])),
                "goals_count": len(analysis.get('learning_goals', [])),
                "gaps_count": len(analysis.get('knowledge_gaps', []))
            }
            
        except Exception as e:
            logger.error(f"Reflection analysis failed: {e}")
            return {
                "analysis": {},
                "recommendations": [],
                "error": str(e)
            }
    
    async def _store_analysis(
        self, 
        user_id: str, 
        reflection_text: str, 
        analysis: Dict,
        reflection_id: str = None
    ):
        """Store analysis results in database."""
        try:
            client = db.client
            
            client.table('reflection_analysis').insert({
                'user_id': user_id,
                'reflection_id': reflection_id,
                'reflection_text': reflection_text,
                'topics': analysis.get('topics', []),
                'learning_goals': analysis.get('learning_goals', []),
                'knowledge_gaps': analysis.get('knowledge_gaps', []),
                'difficulty_preference': analysis.get('difficulty_preference'),
                'interests': analysis.get('interests', []),
                'challenges': analysis.get('challenges', []),
                'created_at': datetime.now().isoformat()
            }).execute()
            
        except Exception as e:
            logger.error(f"Failed to store analysis: {e}")
    
    async def _update_user_interests(self, user_id: str, analysis: Dict):
        """Update user interests based on analysis."""
        try:
            client = db.client
            
            # Store topics with priority
            topics = analysis.get('topics', [])
            for topic in topics:
                client.table('user_interests').upsert({
                    'user_id': user_id,
                    'topic': topic,
                    'source': 'reflection',
                    'priority_score': 1.5,
                    'last_updated': datetime.now().isoformat()
                }).execute()
            
            # Store learning goals (highest priority)
            goals = analysis.get('learning_goals', [])
            for goal in goals:
                client.table('user_interests').upsert({
                    'user_id': user_id,
                    'topic': goal,
                    'source': 'learning_goal',
                    'priority_score': 2.0,
                    'last_updated': datetime.now().isoformat()
                }).execute()
            
            # Store knowledge gaps
            gaps = analysis.get('knowledge_gaps', [])
            for gap in gaps:
                client.table('user_interests').upsert({
                    'user_id': user_id,
                    'topic': gap,
                    'source': 'knowledge_gap',
                    'priority_score': 1.8,
                    'last_updated': datetime.now().isoformat()
                }).execute()
            
            # Store general interests
            interests = analysis.get('interests', [])
            for interest in interests:
                if interest not in topics:  # Avoid duplicates
                    client.table('user_interests').upsert({
                        'user_id': user_id,
                        'topic': interest,
                        'source': 'reflection',
                        'priority_score': 1.2,
                        'last_updated': datetime.now().isoformat()
                    }).execute()
            
        except Exception as e:
            logger.error(f"Failed to update user interests: {e}")
    
    async def _update_user_preferences(self, user_id: str, analysis: Dict):
        """Update user preferences based on analysis."""
        try:
            client = db.client
            
            # Store difficulty preference
            difficulty = analysis.get('difficulty_preference')
            if difficulty:
                client.table('user_preferences').upsert({
                    'user_id': user_id,
                    'preference_type': 'difficulty',
                    'preference_value': difficulty,
                    'last_updated': datetime.now().isoformat()
                }).execute()
            
        except Exception as e:
            logger.error(f"Failed to update user preferences: {e}")
    
    async def _generate_recommendations(
        self, 
        user_id: str, 
        analysis: Dict
    ) -> List[Dict]:
        """Generate content recommendations based on analysis."""
        try:
            recommendations = []
            
            # Recommend lessons for learning goals
            goals = analysis.get('learning_goals', [])
            for goal in goals[:3]:  # Top 3 goals
                recommendations.append({
                    'type': 'lesson',
                    'topic': goal,
                    'reason': 'Based on your learning goal',
                    'priority': 'high'
                })
            
            # Recommend lessons for knowledge gaps
            gaps = analysis.get('knowledge_gaps', [])
            for gap in gaps[:2]:  # Top 2 gaps
                recommendations.append({
                    'type': 'lesson',
                    'topic': gap,
                    'reason': 'To fill your knowledge gap',
                    'priority': 'high'
                })
            
            # Recommend lessons for interests
            interests = analysis.get('interests', [])
            for interest in interests[:2]:  # Top 2 interests
                recommendations.append({
                    'type': 'lesson',
                    'topic': interest,
                    'reason': 'Based on your interests',
                    'priority': 'medium'
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
            return []
    
    async def get_user_learning_profile(self, user_id: str) -> Dict:
        """
        Get comprehensive learning profile for user.
        
        Returns:
            User's topics, preferences, patterns, and recommendations
        """
        try:
            client = db.client
            
            # Get top interests
            interests_response = client.table('user_interests')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('priority_score', desc=True)\
                .limit(10)\
                .execute()
            
            # Get preferences
            prefs_response = client.table('user_preferences')\
                .select('*')\
                .eq('user_id', user_id)\
                .execute()
            
            # Get recent reflections
            reflections_response = client.table('reflection_analysis')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .limit(5)\
                .execute()
            
            return {
                'interests': interests_response.data if interests_response.data else [],
                'preferences': prefs_response.data if prefs_response.data else [],
                'recent_reflections': reflections_response.data if reflections_response.data else []
            }
            
        except Exception as e:
            logger.error(f"Failed to get learning profile: {e}")
            return {
                'interests': [],
                'preferences': [],
                'recent_reflections': []
            }


# Singleton instance
_analyzer = None

def get_reflection_analyzer() -> ReflectionAnalyzer:
    """Get or create the reflection analyzer instance."""
    global _analyzer
    if _analyzer is None:
        _analyzer = ReflectionAnalyzer()
    return _analyzer
