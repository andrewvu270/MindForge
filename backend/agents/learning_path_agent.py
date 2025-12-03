"""
Learning Path Generation Agent
Creates structured learning paths with lesson outlines for each field
"""

from typing import List, Dict, Any
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm_service import LLMService

class LearningPathAgent:
    def __init__(self):
        self.llm_service = LLMService()
    
    async def generate_curriculum_for_field(self, field_name: str, lessons_per_path: int = 5) -> List[Dict[str, Any]]:
        """
        Generate complete learning path curriculum for a field.
        Creates 3 paths (Beginner, Intermediate, Advanced) with lesson outlines.
        
        Args:
            field_name: Name of the field (e.g., "Economics", "Culture")
            lessons_per_path: Number of lessons per difficulty level
            
        Returns:
            List of paths with lesson outlines
        """
        
        prompt = f"""You are a curriculum designer creating a structured learning path for {field_name}.

Create a comprehensive curriculum with 3 difficulty levels:
1. Beginner Path: Foundational concepts for newcomers
2. Intermediate Path: Building on basics, moderate complexity
3. Advanced Path: Complex topics requiring prior knowledge

For EACH path, create {lessons_per_path} lessons with:
- Title: Clear, descriptive lesson title
- Summary: 2-3 sentence overview
- Key Concepts: 3-5 main concepts covered
- Estimated Minutes: Realistic time estimate (10-20 min)
- Prerequisites: What should be learned first (if any)

Ensure lessons build on each other logically within each path.

Return ONLY valid JSON in this exact format:
{{
  "paths": [
    {{
      "name": "Beginner Path",
      "difficulty": "Beginner",
      "description": "Start here if you're new to {field_name}",
      "lessons": [
        {{
          "title": "Introduction to Supply and Demand",
          "summary": "Learn the fundamental economic principle...",
          "key_concepts": ["Supply curve", "Demand curve", "Market equilibrium"],
          "estimated_minutes": 15,
          "prerequisites": []
        }}
      ]
    }},
    {{
      "name": "Intermediate Path",
      "difficulty": "Intermediate",
      "description": "Build on your foundation",
      "lessons": [...]
    }},
    {{
      "name": "Advanced Path",
      "difficulty": "Advanced",
      "description": "Master advanced concepts",
      "lessons": [...]
    }}
  ]
}}"""
        
        try:
            # Use the LLM service's internal method
            messages = [{"role": "user", "content": prompt}]
            completion = await self.llm_service._call_llm(
                messages=messages,
                temperature=0.3,
                max_tokens=3000
            )
            response = completion.choices[0].message.content
            
            # Parse the JSON response
            import json
            result = json.loads(response)
            
            return result.get('paths', [])
            
        except Exception as e:
            print(f"Error generating curriculum: {e}")
            # Fallback: Create basic structure
            return self._fallback_curriculum_generation(field_name, lessons_per_path)
    
    def _fallback_curriculum_generation(self, field_name: str, lessons_per_path: int) -> List[Dict[str, Any]]:
        """Fallback method if LLM fails - creates basic curriculum structure"""
        
        difficulties = ['Beginner', 'Intermediate', 'Advanced']
        paths = []
        
        for difficulty in difficulties:
            lessons = []
            for i in range(lessons_per_path):
                lessons.append({
                    'title': f'{field_name} {difficulty} Lesson {i+1}',
                    'summary': f'A {difficulty.lower()} level lesson covering important {field_name} concepts.',
                    'key_concepts': [f'Concept {i+1}', f'Concept {i+2}', f'Concept {i+3}'],
                    'estimated_minutes': 15,
                    'prerequisites': [] if i == 0 else [f'Lesson {i}']
                })
            
            paths.append({
                'name': f'{difficulty} Path',
                'difficulty': difficulty,
                'description': f'{difficulty} level {field_name} curriculum',
                'lessons': lessons
            })
        
        return paths
    
    async def generate_paths_for_field(self, field_name: str, existing_lessons: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        DEPRECATED: Use generate_curriculum_for_field instead.
        This method organizes existing lessons into paths (old behavior).
        """
        if not existing_lessons:
            return []
        
        prompt = f"""You are a curriculum designer. Given these lessons in the {field_name} field, organize them into 3 learning paths: Beginner, Intermediate, and Advanced.

Available Lessons:
{self._format_lessons(existing_lessons)}

Create a structured curriculum with:
1. Beginner Path: Foundational concepts, easiest lessons first
2. Intermediate Path: Building on basics, moderate complexity
3. Advanced Path: Complex topics, requires prior knowledge

For each path, specify:
- Path name and description
- Which lessons belong to it (by number)
- The order they should be taken
- Why this sequence makes sense

Return ONLY valid JSON in this exact format:
{{
  "paths": [
    {{
      "name": "Beginner Path",
      "difficulty": "Beginner",
      "description": "Start here if you're new to {field_name}",
      "lesson_ids": [1, 2, 3],
      "rationale": "These lessons introduce core concepts..."
    }}
  ]
}}"""
        
        try:
            messages = [{"role": "user", "content": prompt}]
            completion = await self.llm_service._call_llm(
                messages=messages,
                temperature=0.3,
                max_tokens=1500
            )
            response = completion.choices[0].message.content
            
            import json
            result = json.loads(response)
            
            # Map lesson indices to actual lesson objects
            paths = []
            for path_data in result.get('paths', []):
                lesson_indices = path_data.get('lesson_ids', [])
                path_lessons = []
                
                for idx in lesson_indices:
                    if 0 < idx <= len(existing_lessons):
                        lesson = existing_lessons[idx - 1]
                        path_lessons.append({
                            'id': lesson['id'],
                            'title': lesson['title'],
                            'order': len(path_lessons) + 1,
                            'estimated_minutes': lesson.get('estimated_minutes', 5),
                            'difficulty_level': lesson.get('difficulty_level', 'Beginner')
                        })
                
                if path_lessons:
                    paths.append({
                        'name': path_data['name'],
                        'difficulty': path_data['difficulty'],
                        'description': path_data['description'],
                        'lessons': path_lessons,
                        'rationale': path_data.get('rationale', '')
                    })
            
            return paths
            
        except Exception as e:
            print(f"Error generating learning paths: {e}")
            return self._fallback_path_generation(field_name, existing_lessons)
    
    def _format_lessons(self, lessons: List[Dict[str, Any]]) -> str:
        """Format lessons for prompt"""
        return "\n".join([
            f"- {i+1}. {lesson['title']} (Difficulty: {lesson.get('difficulty_level', 'Unknown')})"
            for i, lesson in enumerate(lessons)
        ])
    
    def _fallback_path_generation(self, field_name: str, lessons: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Fallback method if LLM fails"""
        # Group by difficulty
        beginner = [l for l in lessons if l.get('difficulty_level', '').lower() == 'beginner']
        intermediate = [l for l in lessons if l.get('difficulty_level', '').lower() == 'intermediate']
        advanced = [l for l in lessons if l.get('difficulty_level', '').lower() == 'advanced']
        
        paths = []
        
        if beginner:
            paths.append({
                'name': 'Beginner Path',
                'difficulty': 'Beginner',
                'description': f'Start your {field_name} journey',
                'lessons': [{'id': l['id'], 'title': l['title'], 'order': i+1, 
                            'estimated_minutes': l.get('estimated_minutes', 5),
                            'difficulty_level': l.get('difficulty_level', 'Beginner')} 
                           for i, l in enumerate(beginner[:5])],
                'rationale': 'Foundational concepts'
            })
        
        if intermediate:
            paths.append({
                'name': 'Intermediate Path',
                'difficulty': 'Intermediate',
                'description': f'Deepen your {field_name} knowledge',
                'lessons': [{'id': l['id'], 'title': l['title'], 'order': i+1,
                            'estimated_minutes': l.get('estimated_minutes', 5),
                            'difficulty_level': l.get('difficulty_level', 'Intermediate')} 
                           for i, l in enumerate(intermediate[:5])],
                'rationale': 'Building on basics'
            })
        
        if advanced:
            paths.append({
                'name': 'Advanced Path',
                'difficulty': 'Advanced',
                'description': f'Master {field_name}',
                'lessons': [{'id': l['id'], 'title': l['title'], 'order': i+1,
                            'estimated_minutes': l.get('estimated_minutes', 5),
                            'difficulty_level': l.get('difficulty_level', 'Advanced')} 
                           for i, l in enumerate(advanced[:5])],
                'rationale': 'Complex topics'
            })
        
        return paths

