"""
Test script for intelligent API selection system
"""
import asyncio
import logging
from services.api_registry import APIRegistry, APICategory
from agents.api_selector_agent import APISelectorAgent
from services.llm_service import get_llm_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_api_registry():
    """Test API Registry functionality"""
    print("\n=== Testing API Registry ===\n")
    
    # Get all APIs
    all_apis = APIRegistry.get_all_apis()
    print(f"Total APIs registered: {len(all_apis)}")
    
    # Get APIs by category
    science_apis = APIRegistry.get_apis_by_category(APICategory.SCIENCE)
    print(f"\nScience APIs: {science_apis}")
    
    # Search APIs
    space_apis = APIRegistry.search_apis("space")
    print(f"\nAPIs matching 'space': {space_apis}")
    
    # Get API summary
    summary = APIRegistry.get_api_summary()
    print(f"\nAPI Summary (first 500 chars):\n{summary[:500]}...")


async def test_api_selector():
    """Test API Selector Agent"""
    print("\n\n=== Testing API Selector Agent ===\n")
    
    # Initialize agent
    llm_service = get_llm_service()
    selector = APISelectorAgent(llm_service=llm_service)
    
    # Test cases
    test_cases = [
        {"topic": "Mars exploration", "field": "science"},
        {"topic": "Stock market crash 2008", "field": "finance"},
        {"topic": "Shakespeare's plays", "field": "literature"},
        {"topic": "Machine learning basics", "field": "technology"},
    ]
    
    for test_case in test_cases:
        print(f"\nTest: {test_case}")
        response = await selector.process({
            **test_case,
            "max_apis": 5
        })
        
        if response.status.value == "completed":
            selected = response.result.get("selected_apis", [])
            print(f"Selected APIs: {selected}")
        else:
            print(f"Error: {response.error}")


async def test_content_orchestrator():
    """Test ContentOrchestrator with intelligent selection"""
    print("\n\n=== Testing ContentOrchestrator ===\n")
    
    from services.content_orchestrator import ContentOrchestrator
    
    orchestrator = ContentOrchestrator()
    orchestrator.use_intelligent_selection = True
    
    # Test fetching content
    topic = "NASA Mars missions"
    field = "science"
    
    print(f"\nFetching content for: {topic}")
    content = await orchestrator.fetch_multi_source(
        field=field,
        topic=topic,
        num_sources=3,
        items_per_source=2,
        use_cache=False
    )
    
    print(f"\nFetched {len(content)} items:")
    for item in content:
        print(f"  - {item.source}: {item.title[:60]}...")


async def main():
    """Run all tests"""
    try:
        await test_api_registry()
        await test_api_selector()
        await test_content_orchestrator()
        
        print("\n\n=== All Tests Complete ===\n")
        
    except Exception as e:
        logger.error(f"Test failed: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(main())
