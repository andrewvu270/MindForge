"""
Video Planning Agent
Intelligently determines optimal video structure based on lesson content
"""
import logging
from typing import Dict, List, Any
from services.free_llm_service import get_free_llm_service

logger = logging.getLogger(__name__)


class VideoPlanningAgent:
    """
    AI agent that analyzes lesson content and plans optimal video structure.
    
    Determines:
    - Number of slides needed
    - Content for each slide
    - Timing for each slide
    - Visual style for each slide
    """
    
    def __init__(self):
        self.llm = get_free_llm_service()
    
    async def plan_video_structure(
        self,
        lesson_content: str,
        lesson_title: str,
        field: str,
        target_duration: int = 60,
        difficulty: str = "Easy"
    ) -> Dict[str, Any]:
        """
        Analyze lesson content and create optimal video plan.
        
        Args:
            lesson_content: Full lesson text
            lesson_title: Title of the lesson
            field: Subject field (Technology, Finance, etc.)
            target_duration: Target video duration in seconds
            difficulty: Lesson difficulty level
            
        Returns:
            Dict with video plan including slides, timing, and prompts
        """
        try:
            # Use LLM to analyze content and create video plan
            prompt = f"""Analyze this educational lesson and create an optimal video structure.

Lesson Title: {lesson_title}
Field: {field}
Difficulty: {difficulty}
Target Duration: {target_duration} seconds

Lesson Content:
{lesson_content}

Create a video plan with:
1. Optimal number of slides (4-8 slides recommended)
2. Content breakdown for each slide
3. Duration for each slide (total should equal {target_duration}s)
4. Visual description for each slide

Consider:
- Content complexity (more complex = more slides)
- Key concepts that need visual explanation
- Natural content breaks
- Engagement (vary slide duration to maintain interest)

Return as JSON:
{{
    "total_slides": 6,
    "total_duration": {target_duration},
    "slides": [
        {{
            "slide_number": 1,
            "title": "Introduction",
            "content_summary": "Brief overview of the topic",
            "duration_seconds": 10,
            "visual_prompt": "Title slide with engaging visual for {lesson_title}",
            "key_points": ["point 1", "point 2"]
        }},
        ...
    ],
    "reasoning": "Why this structure works for this content"
}}"""

            response = await self.llm.generate_text(prompt, max_tokens=800)
            
            # Parse JSON response
            import json
            import re
            
            try:
                # Try to extract JSON from response (LLM might add extra text)
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                    video_plan = json.loads(json_str)
                else:
                    # Try parsing the whole response
                    video_plan = json.loads(response)
                
                # Validate and adjust if needed
                video_plan = self._validate_and_adjust_plan(
                    video_plan, 
                    target_duration,
                    lesson_content
                )
                
                logger.info(f"✅ Video plan created: {video_plan['total_slides']} slides")
                return video_plan
                
            except (json.JSONDecodeError, AttributeError) as e:
                logger.warning(f"LLM response not valid JSON ({e}), using fallback plan")
                logger.debug(f"LLM response was: {response[:200]}...")
                return self._create_fallback_plan(
                    lesson_content,
                    lesson_title,
                    field,
                    target_duration
                )
        
        except Exception as e:
            logger.error(f"Video planning failed: {e}")
            return self._create_fallback_plan(
                lesson_content,
                lesson_title,
                field,
                target_duration
            )
    
    def _validate_and_adjust_plan(
        self,
        plan: Dict[str, Any],
        target_duration: int,
        lesson_content: str
    ) -> Dict[str, Any]:
        """Validate and adjust the video plan to ensure it's optimal."""
        
        # Ensure slide count is reasonable
        if plan.get('total_slides', 0) < 4:
            plan['total_slides'] = 4
        elif plan.get('total_slides', 0) > 8:
            plan['total_slides'] = 8
        
        # Ensure total duration matches target
        slides = plan.get('slides', [])
        if slides:
            total_slide_duration = sum(s.get('duration_seconds', 10) for s in slides)
            
            if total_slide_duration != target_duration:
                # Adjust slide durations proportionally
                adjustment_factor = target_duration / total_slide_duration
                for slide in slides:
                    slide['duration_seconds'] = int(
                        slide.get('duration_seconds', 10) * adjustment_factor
                    )
        
        # Ensure each slide has required fields
        for i, slide in enumerate(slides):
            if 'slide_number' not in slide:
                slide['slide_number'] = i + 1
            if 'duration_seconds' not in slide:
                slide['duration_seconds'] = target_duration // max(1, len(slides))
            if 'visual_prompt' not in slide:
                slide['visual_prompt'] = f"Educational slide {i+1}"
        
        return plan
    
    def _create_fallback_plan(
        self,
        lesson_content: str,
        lesson_title: str,
        field: str,
        target_duration: int
    ) -> Dict[str, Any]:
        """Create a simple fallback plan if LLM fails."""
        
        # Calculate optimal slides based on duration
        seconds_per_slide = 10
        num_slides = max(4, min(8, target_duration // seconds_per_slide))
        
        # Split content into sections
        sentences = lesson_content.split('. ')
        sentences_per_slide = max(1, len(sentences) // num_slides)
        
        slides = []
        
        # Slide 1: Title/Introduction
        slides.append({
            "slide_number": 1,
            "title": "Introduction",
            "content_summary": f"Introduction to {lesson_title}",
            "duration_seconds": seconds_per_slide,
            "visual_prompt": f"Title slide: '{lesson_title}', modern educational design, {field} theme",
            "key_points": [lesson_title]
        })
        
        # Middle slides: Content breakdown
        for i in range(1, num_slides - 1):
            start_idx = i * sentences_per_slide
            end_idx = min((i + 1) * sentences_per_slide, len(sentences))
            slide_content = '. '.join(sentences[start_idx:end_idx])
            
            slides.append({
                "slide_number": i + 1,
                "title": f"Key Concept {i}",
                "content_summary": slide_content[:100] + "...",
                "duration_seconds": seconds_per_slide,
                "visual_prompt": f"Educational slide about {lesson_title}, concept {i}, infographic style",
                "key_points": [s.strip() for s in sentences[start_idx:end_idx][:2]]
            })
        
        # Final slide: Summary
        slides.append({
            "slide_number": num_slides,
            "title": "Summary",
            "content_summary": "Key takeaways and conclusion",
            "duration_seconds": seconds_per_slide,
            "visual_prompt": f"Summary slide with key points, {lesson_title}, clean layout",
            "key_points": ["Review", "Practice", "Learn more"]
        })
        
        return {
            "total_slides": num_slides,
            "total_duration": target_duration,
            "slides": slides,
            "reasoning": "Fallback plan: evenly distributed content across slides"
        }
    
    async def generate_slide_prompts(
        self,
        video_plan: Dict[str, Any],
        lesson_title: str,
        field: str
    ) -> List[str]:
        """
        Generate detailed image prompts for each slide based on the video plan.
        
        Args:
            video_plan: Video plan from plan_video_structure
            lesson_title: Lesson title
            field: Subject field
            
        Returns:
            List of image generation prompts
        """
        prompts = []
        
        # Base style for consistency (can be adjusted per field if needed)
        base_style = "High quality educational illustration, modern flat design with subtle texture, professional color palette."
        
        for i, slide in enumerate(video_plan.get('slides', [])):
            # Use the specific visual prompt from the plan if available
            visual_prompt = slide.get('visual_prompt', '')
            slide_title = slide.get('title', 'Slide')
            
            if not visual_prompt:
                # Fallback if no visual prompt in plan
                visual_prompt = f"Educational illustration for '{slide_title}' related to {lesson_title}"
            
            # Combine into a full image generation prompt
            # 9:16 aspect ratio is handled by the image service, but we specify the composition here
            enhanced_prompt = f"{visual_prompt}. {base_style} 9:16 portrait composition, clear focal point, minimal text."
            
            prompts.append(enhanced_prompt)
        
        return prompts
    
    def calculate_optimal_slides(
        self,
        content_length: int,
        target_duration: int,
        complexity: str = "medium"
    ) -> int:
        """
        Quick calculation for optimal slide count without LLM.
        
        Args:
            content_length: Length of content in characters
            target_duration: Target video duration in seconds
            complexity: Content complexity (simple, medium, complex)
            
        Returns:
            Optimal number of slides
        """
        # Base calculation on duration
        base_slides = target_duration // 10  # 10 seconds per slide
        
        # Adjust for content length
        if content_length < 200:
            base_slides = max(4, base_slides - 1)
        elif content_length > 500:
            base_slides = min(8, base_slides + 1)
        
        # Adjust for complexity
        complexity_adjustments = {
            "simple": -1,
            "medium": 0,
            "complex": 1
        }
        base_slides += complexity_adjustments.get(complexity.lower(), 0)
        
        # Ensure within bounds
        return max(4, min(8, base_slides))


# Singleton instance
_video_planning_agent = None


def get_video_planning_agent() -> VideoPlanningAgent:
    """Get or create the video planning agent singleton"""
    global _video_planning_agent
    if _video_planning_agent is None:
        _video_planning_agent = VideoPlanningAgent()
    return _video_planning_agent
