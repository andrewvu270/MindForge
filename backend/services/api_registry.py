"""
API Registry - Metadata catalog for all available content APIs
"""
from typing import List, Dict, Optional
from enum import Enum


class APICategory(str, Enum):
    """Categories matching public-apis repository structure"""
    ANIMALS = "animals"
    ANIME = "anime"
    ANTI_MALWARE = "anti_malware"
    ART_DESIGN = "art_design"
    AUTHENTICATION = "authentication"
    BLOCKCHAIN = "blockchain"
    BOOKS = "books"
    BUSINESS = "business"
    CALENDAR = "calendar"
    CLOUD_STORAGE = "cloud_storage"
    CONTINUOUS_INTEGRATION = "continuous_integration"
    CRYPTOCURRENCY = "cryptocurrency"
    CURRENCY_EXCHANGE = "currency_exchange"
    DATA_VALIDATION = "data_validation"
    DEVELOPMENT = "development"
    DICTIONARIES = "dictionaries"
    DOCUMENTS_PRODUCTIVITY = "documents_productivity"
    EMAIL = "email"
    ENTERTAINMENT = "entertainment"
    ENVIRONMENT = "environment"
    EVENTS = "events"
    FINANCE = "finance"
    FOOD_DRINK = "food_drink"
    GAMES_COMICS = "games_comics"
    GEOCODING = "geocoding"
    GOVERNMENT = "government"
    HEALTH = "health"
    JOBS = "jobs"
    MACHINE_LEARNING = "machine_learning"
    MUSIC = "music"
    NEWS = "news"
    OPEN_DATA = "open_data"
    OPEN_SOURCE = "open_source"
    PATENT = "patent"
    PERSONALITY = "personality"
    PHONE = "phone"
    PHOTOGRAPHY = "photography"
    PROGRAMMING = "programming"
    SCIENCE = "science"  # Added for NASA, arXiv, etc.
    SCIENCE_MATH = "science_math"
    SECURITY = "security"
    SHOPPING = "shopping"
    SOCIAL = "social"
    SPORTS_FITNESS = "sports_fitness"
    TEST_DATA = "test_data"
    TEXT_ANALYSIS = "text_analysis"
    TRACKING = "tracking"
    TRANSPORTATION = "transportation"
    URL_SHORTENERS = "url_shorteners"
    VEHICLE = "vehicle"
    VIDEO = "video"
    WEATHER = "weather"
    
    # Legacy categories for backward compatibility
    EDUCATION = "education"
    TECHNOLOGY = "technology"
    GENERAL_KNOWLEDGE = "general_knowledge"
    CULTURE = "culture"


class APIMetadata:
    """Metadata for a single API"""
    def __init__(
        self,
        name: str,
        description: str,
        categories: List[APICategory],
        keywords: List[str],
        requires_auth: bool = False,
        rate_limit: Optional[str] = None
    ):
        self.name = name
        self.description = description
        self.categories = categories
        self.keywords = keywords
        self.requires_auth = requires_auth
        self.rate_limit = rate_limit


class APIRegistry:
    """
    Central registry of all available APIs with metadata.
    Used by the API Selector Agent to intelligently choose APIs.
    """
    
    # Registry of all available APIs
    APIS: Dict[str, APIMetadata] = {
        # Existing adapters
        "wikipedia": APIMetadata(
            name="wikipedia",
            description="Free encyclopedia with articles on virtually any topic",
            categories=[APICategory.GENERAL_KNOWLEDGE, APICategory.EDUCATION],
            keywords=["encyclopedia", "knowledge", "facts", "history", "science", "general"],
            requires_auth=False
        ),
        "youtube": APIMetadata(
            name="youtube",
            description="Video content and educational tutorials",
            categories=[APICategory.EDUCATION, APICategory.ENTERTAINMENT],
            keywords=["video", "tutorial", "visual", "learning", "entertainment"],
            requires_auth=True
        ),
        "google_books": APIMetadata(
            name="google_books",
            description="Books, academic texts, and literature",
            categories=[APICategory.BOOKS, APICategory.EDUCATION],
            keywords=["books", "literature", "academic", "reading", "text"],
            requires_auth=True
        ),
        "reddit": APIMetadata(
            name="reddit",
            description="Community discussions and diverse perspectives",
            categories=[APICategory.GENERAL_KNOWLEDGE, APICategory.TECHNOLOGY],
            keywords=["discussion", "community", "opinions", "social", "diverse"],
            requires_auth=False
        ),
        "hackernews": APIMetadata(
            name="hackernews",
            description="Technology news and startup discussions",
            categories=[APICategory.TECHNOLOGY, APICategory.NEWS],
            keywords=["tech", "startups", "programming", "innovation", "technology"],
            requires_auth=False
        ),
        "bbc_news": APIMetadata(
            name="bbc_news",
            description="Global news and current events",
            categories=[APICategory.NEWS],
            keywords=["news", "current events", "world", "politics", "global"],
            requires_auth=False
        ),
        "finance": APIMetadata(
            name="finance",
            description="Stock market data and financial information",
            categories=[APICategory.FINANCE],
            keywords=["stocks", "finance", "market", "economy", "trading", "investment"],
            requires_auth=False
        ),
        "fred": APIMetadata(
            name="fred",
            description="Economic data from Federal Reserve",
            categories=[APICategory.FINANCE],
            keywords=["economics", "federal reserve", "economic data", "statistics"],
            requires_auth=True
        ),
        
        # New adapters to be implemented
        "nasa": APIMetadata(
            name="nasa",
            description="Space exploration, astronomy, and NASA missions",
            categories=[APICategory.SCIENCE, APICategory.EDUCATION],
            keywords=["space", "astronomy", "planets", "nasa", "rockets", "mars", "moon"],
            requires_auth=False
        ),
        "open_library": APIMetadata(
            name="open_library",
            description="Open access to books and literature",
            categories=[APICategory.BOOKS, APICategory.EDUCATION],
            keywords=["books", "library", "literature", "reading", "authors"],
            requires_auth=False
        ),
        "numbers_api": APIMetadata(
            name="numbers_api",
            description="Interesting facts about numbers",
            categories=[APICategory.EDUCATION, APICategory.GENERAL_KNOWLEDGE],
            keywords=["math", "numbers", "trivia", "facts", "mathematics"],
            requires_auth=False
        ),
        "dictionary": APIMetadata(
            name="dictionary",
            description="Word definitions, synonyms, and language learning",
            categories=[APICategory.EDUCATION],
            keywords=["words", "definitions", "language", "vocabulary", "dictionary"],
            requires_auth=False
        ),
        "quotes": APIMetadata(
            name="quotes",
            description="Inspirational and educational quotes",
            categories=[APICategory.GENERAL_KNOWLEDGE, APICategory.CULTURE],
            keywords=["quotes", "inspiration", "wisdom", "philosophy", "motivation"],
            requires_auth=False
        ),
        "arxiv": APIMetadata(
            name="arxiv",
            description="Scientific research papers and preprints",
            categories=[APICategory.SCIENCE, APICategory.EDUCATION],
            keywords=["research", "papers", "science", "academic", "physics", "math"],
            requires_auth=False
        ),
        "open_trivia": APIMetadata(
            name="open_trivia",
            description="Trivia questions across various categories",
            categories=[APICategory.EDUCATION, APICategory.ENTERTAINMENT],
            keywords=["trivia", "quiz", "questions", "knowledge", "facts"],
            requires_auth=False
        ),
        "rest_countries": APIMetadata(
            name="rest_countries",
            description="Information about countries, geography, and demographics",
            categories=[APICategory.EDUCATION, APICategory.GENERAL_KNOWLEDGE],
            keywords=["countries", "geography", "world", "demographics", "flags"],
            requires_auth=False
        ),
        "weather": APIMetadata(
            name="weather",
            description="Weather data and climate information",
            categories=[APICategory.SCIENCE, APICategory.GENERAL_KNOWLEDGE],
            keywords=["weather", "climate", "temperature", "forecast", "meteorology"],
            requires_auth=False
        ),
        "usgs_earthquake": APIMetadata(
            name="usgs_earthquake",
            description="Earthquake data and seismic activity",
            categories=[APICategory.SCIENCE],
            keywords=["earthquake", "seismic", "geology", "natural disasters"],
            requires_auth=False
        ),
        "spacex": APIMetadata(
            name="spacex",
            description="SpaceX launches, rockets, and missions",
            categories=[APICategory.SCIENCE, APICategory.TECHNOLOGY],
            keywords=["spacex", "rockets", "launches", "space", "elon musk"],
            requires_auth=False
        ),
        "pokemon": APIMetadata(
            name="pokemon",
            description="Pokemon data and game information",
            categories=[APICategory.ENTERTAINMENT, APICategory.GENERAL_KNOWLEDGE],
            keywords=["pokemon", "games", "nintendo", "entertainment"],
            requires_auth=False
        ),
        "marvel": APIMetadata(
            name="marvel",
            description="Marvel comics characters and stories",
            categories=[APICategory.ENTERTAINMENT, APICategory.CULTURE],
            keywords=["marvel", "comics", "superheroes", "entertainment"],
            requires_auth=True
        ),
        "recipe": APIMetadata(
            name="recipe",
            description="Cooking recipes and food information",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["cooking", "food", "recipes", "nutrition", "culinary"],
            requires_auth=False
        ),
        "art_institute": APIMetadata(
            name="art_institute",
            description="Art collections and museum pieces",
            categories=[APICategory.CULTURE, APICategory.EDUCATION],
            keywords=["art", "museum", "paintings", "culture", "artists"],
            requires_auth=False
        ),
        
        # Science & Math APIs
        "wolframalpha": APIMetadata(
            name="wolframalpha",
            description="Computational knowledge engine for math, science, and more",
            categories=[APICategory.SCIENCE, APICategory.EDUCATION],
            keywords=["math", "science", "calculations", "knowledge", "wolfram"],
            requires_auth=True
        ),
        "newton_math": APIMetadata(
            name="newton_math",
            description="Symbolic and arithmetic math calculator",
            categories=[APICategory.SCIENCE, APICategory.EDUCATION],
            keywords=["math", "calculator", "equations", "algebra", "calculus"],
            requires_auth=False
        ),
        "usgs_earthquake": APIMetadata(
            name="usgs_earthquake",
            description="Real-time earthquake data and seismic information",
            categories=[APICategory.SCIENCE],
            keywords=["earthquake", "seismic", "geology", "disasters", "earth"],
            requires_auth=False
        ),
        
        # Books & Literature APIs
        "open_library": APIMetadata(
            name="open_library",
            description="Open access to millions of books",
            categories=[APICategory.BOOKS, APICategory.EDUCATION],
            keywords=["books", "library", "literature", "reading", "authors", "isbn"],
            requires_auth=False
        ),
        "gutendex": APIMetadata(
            name="gutendex",
            description="Project Gutenberg books library API",
            categories=[APICategory.BOOKS, APICategory.EDUCATION],
            keywords=["books", "classics", "literature", "free", "gutenberg"],
            requires_auth=False
        ),
        "poetry_db": APIMetadata(
            name="poetry_db",
            description="Poetry database with poems and poets",
            categories=[APICategory.BOOKS, APICategory.CULTURE],
            keywords=["poetry", "poems", "literature", "poets", "verses"],
            requires_auth=False
        ),
        
        # Language & Dictionary APIs
        "dictionary": APIMetadata(
            name="dictionary",
            description="Free dictionary with definitions, phonetics, and examples",
            categories=[APICategory.EDUCATION],
            keywords=["dictionary", "words", "definitions", "language", "vocabulary"],
            requires_auth=False
        ),
        "wordnik": APIMetadata(
            name="wordnik",
            description="Comprehensive dictionary and word data",
            categories=[APICategory.EDUCATION],
            keywords=["dictionary", "words", "definitions", "etymology", "examples"],
            requires_auth=True
        ),
        "datamuse": APIMetadata(
            name="datamuse",
            description="Word-finding query engine for rhymes, synonyms, and more",
            categories=[APICategory.EDUCATION],
            keywords=["words", "rhymes", "synonyms", "language", "vocabulary"],
            requires_auth=False
        ),
        
        # History & Culture APIs
        "rest_countries": APIMetadata(
            name="rest_countries",
            description="Information about all countries in the world",
            categories=[APICategory.EDUCATION, APICategory.GENERAL_KNOWLEDGE],
            keywords=["countries", "geography", "flags", "capitals", "world"],
            requires_auth=False
        ),
        "metropolitan_museum": APIMetadata(
            name="metropolitan_museum",
            description="Metropolitan Museum of Art collection",
            categories=[APICategory.CULTURE, APICategory.EDUCATION],
            keywords=["art", "museum", "history", "culture", "artifacts"],
            requires_auth=False
        ),
        "rijksmuseum": APIMetadata(
            name="rijksmuseum",
            description="Dutch national museum art collection",
            categories=[APICategory.CULTURE, APICategory.EDUCATION],
            keywords=["art", "museum", "dutch", "paintings", "culture"],
            requires_auth=True
        ),
        
        # News & Current Events APIs
        "newsapi": APIMetadata(
            name="newsapi",
            description="News headlines from multiple sources worldwide",
            categories=[APICategory.NEWS],
            keywords=["news", "headlines", "current events", "journalism", "media"],
            requires_auth=True
        ),
        "guardian": APIMetadata(
            name="guardian",
            description="The Guardian newspaper content and articles",
            categories=[APICategory.NEWS],
            keywords=["news", "guardian", "journalism", "articles", "uk"],
            requires_auth=True
        ),
        "nytimes": APIMetadata(
            name="nytimes",
            description="New York Times articles and content",
            categories=[APICategory.NEWS],
            keywords=["news", "nytimes", "journalism", "articles", "usa"],
            requires_auth=True
        ),
        
        # Entertainment & Pop Culture APIs
        "tmdb": APIMetadata(
            name="tmdb",
            description="The Movie Database - movies and TV shows",
            categories=[APICategory.ENTERTAINMENT, APICategory.CULTURE],
            keywords=["movies", "tv", "entertainment", "films", "cinema"],
            requires_auth=True
        ),
        "omdb": APIMetadata(
            name="omdb",
            description="Open Movie Database with film information",
            categories=[APICategory.ENTERTAINMENT],
            keywords=["movies", "films", "imdb", "entertainment", "cinema"],
            requires_auth=True
        ),
        "spotify": APIMetadata(
            name="spotify",
            description="Music streaming data and recommendations",
            categories=[APICategory.ENTERTAINMENT, APICategory.CULTURE],
            keywords=["music", "songs", "artists", "albums", "streaming"],
            requires_auth=True
        ),
        "pokemon": APIMetadata(
            name="pokemon",
            description="Pokemon data including species, abilities, and moves",
            categories=[APICategory.ENTERTAINMENT, APICategory.GENERAL_KNOWLEDGE],
            keywords=["pokemon", "games", "nintendo", "anime", "creatures"],
            requires_auth=False
        ),
        
        # Quotes & Inspiration APIs
        "quotable": APIMetadata(
            name="quotable",
            description="Random quotes and quotations database",
            categories=[APICategory.GENERAL_KNOWLEDGE, APICategory.CULTURE],
            keywords=["quotes", "inspiration", "wisdom", "sayings", "authors"],
            requires_auth=False
        ),
        "zen_quotes": APIMetadata(
            name="zen_quotes",
            description="Inspirational and zen quotes",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["quotes", "zen", "inspiration", "mindfulness", "wisdom"],
            requires_auth=False
        ),
        "advice_slip": APIMetadata(
            name="advice_slip",
            description="Random advice and life tips",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["advice", "tips", "wisdom", "guidance", "life"],
            requires_auth=False
        ),
        
        # Trivia & Facts APIs
        "open_trivia": APIMetadata(
            name="open_trivia",
            description="Trivia questions across multiple categories",
            categories=[APICategory.EDUCATION, APICategory.ENTERTAINMENT],
            keywords=["trivia", "quiz", "questions", "knowledge", "facts"],
            requires_auth=False
        ),
        "numbers_api": APIMetadata(
            name="numbers_api",
            description="Interesting facts about numbers",
            categories=[APICategory.EDUCATION, APICategory.GENERAL_KNOWLEDGE],
            keywords=["numbers", "math", "facts", "trivia", "mathematics"],
            requires_auth=False
        ),
        "useless_facts": APIMetadata(
            name="useless_facts",
            description="Random useless but true facts",
            categories=[APICategory.GENERAL_KNOWLEDGE, APICategory.ENTERTAINMENT],
            keywords=["facts", "trivia", "random", "knowledge", "fun"],
            requires_auth=False
        ),
        "cat_facts": APIMetadata(
            name="cat_facts",
            description="Random cat facts",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["cats", "animals", "facts", "pets", "trivia"],
            requires_auth=False
        ),
        
        # Weather & Environment APIs
        "openweather": APIMetadata(
            name="openweather",
            description="Weather data and forecasts worldwide",
            categories=[APICategory.SCIENCE, APICategory.GENERAL_KNOWLEDGE],
            keywords=["weather", "forecast", "climate", "temperature", "meteorology"],
            requires_auth=True
        ),
        "air_quality": APIMetadata(
            name="air_quality",
            description="Air quality and pollution data",
            categories=[APICategory.SCIENCE, APICategory.HEALTH],
            keywords=["air quality", "pollution", "environment", "health", "aqi"],
            requires_auth=False
        ),
        
        # Space & Astronomy APIs
        "spacex": APIMetadata(
            name="spacex",
            description="SpaceX launches, rockets, and mission data",
            categories=[APICategory.SCIENCE, APICategory.TECHNOLOGY],
            keywords=["spacex", "rockets", "launches", "space", "mars", "falcon"],
            requires_auth=False
        ),
        "iss_location": APIMetadata(
            name="iss_location",
            description="International Space Station current location",
            categories=[APICategory.SCIENCE],
            keywords=["iss", "space station", "orbit", "space", "location"],
            requires_auth=False
        ),
        "launch_library": APIMetadata(
            name="launch_library",
            description="Spaceflight launches and events database",
            categories=[APICategory.SCIENCE, APICategory.TECHNOLOGY],
            keywords=["space", "launches", "rockets", "missions", "satellites"],
            requires_auth=False
        ),
        
        # Health & Nutrition APIs
        "nutrition": APIMetadata(
            name="nutrition",
            description="Nutritional information for foods",
            categories=[APICategory.HEALTH, APICategory.GENERAL_KNOWLEDGE],
            keywords=["nutrition", "food", "health", "calories", "diet"],
            requires_auth=True
        ),
        "edamam_nutrition": APIMetadata(
            name="edamam_nutrition",
            description="Nutrition analysis and food database",
            categories=[APICategory.HEALTH],
            keywords=["nutrition", "food", "recipes", "health", "diet"],
            requires_auth=True
        ),
        
        # Sports APIs
        "sports_db": APIMetadata(
            name="sports_db",
            description="Sports teams, players, and events database",
            categories=[APICategory.SPORTS_FITNESS, APICategory.ENTERTAINMENT],
            keywords=["sports", "teams", "players", "games", "leagues"],
            requires_auth=True
        ),
        "football_data": APIMetadata(
            name="football_data",
            description="Football/soccer data and statistics",
            categories=[APICategory.SPORTS_FITNESS],
            keywords=["football", "soccer", "sports", "teams", "matches"],
            requires_auth=True
        ),
        
        # Technology & Programming APIs
        "github": APIMetadata(
            name="github",
            description="GitHub repositories, users, and code",
            categories=[APICategory.TECHNOLOGY, APICategory.EDUCATION],
            keywords=["github", "code", "programming", "repositories", "developers"],
            requires_auth=True
        ),
        "stackoverflow": APIMetadata(
            name="stackoverflow",
            description="Stack Overflow questions and answers",
            categories=[APICategory.TECHNOLOGY, APICategory.EDUCATION],
            keywords=["programming", "coding", "questions", "answers", "developers"],
            requires_auth=False
        ),
        
        # Animals & Nature APIs
        "dog_api": APIMetadata(
            name="dog_api",
            description="Dog breeds and images",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["dogs", "animals", "breeds", "pets", "pictures"],
            requires_auth=False
        ),
        "cat_api": APIMetadata(
            name="cat_api",
            description="Cat breeds and images",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["cats", "animals", "breeds", "pets", "pictures"],
            requires_auth=True
        ),
        "zoo_animals": APIMetadata(
            name="zoo_animals",
            description="Zoo animals facts and information",
            categories=[APICategory.GENERAL_KNOWLEDGE, APICategory.EDUCATION],
            keywords=["animals", "zoo", "wildlife", "nature", "facts"],
            requires_auth=False
        ),
        
        # Food & Recipes APIs
        "spoonacular": APIMetadata(
            name="spoonacular",
            description="Recipes, ingredients, and meal planning",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["recipes", "cooking", "food", "ingredients", "meals"],
            requires_auth=True
        ),
        "themealdb": APIMetadata(
            name="themealdb",
            description="Meal recipes from around the world",
            categories=[APICategory.GENERAL_KNOWLEDGE, APICategory.CULTURE],
            keywords=["recipes", "meals", "cooking", "food", "cuisine"],
            requires_auth=True
        ),
        
        # Government & Open Data APIs
        "world_bank": APIMetadata(
            name="world_bank",
            description="World Bank economic and development data",
            categories=[APICategory.FINANCE, APICategory.EDUCATION],
            keywords=["economics", "development", "statistics", "world", "data"],
            requires_auth=False
        ),
        "census": APIMetadata(
            name="census",
            description="US Census Bureau demographic data",
            categories=[APICategory.EDUCATION, APICategory.GENERAL_KNOWLEDGE],
            keywords=["census", "demographics", "population", "statistics", "usa"],
            requires_auth=False
        ),
        
        # Miscellaneous Educational APIs
        "jservice": APIMetadata(
            name="jservice",
            description="Jeopardy questions database",
            categories=[APICategory.EDUCATION, APICategory.ENTERTAINMENT],
            keywords=["jeopardy", "trivia", "questions", "quiz", "knowledge"],
            requires_auth=False
        ),
        "random_user": APIMetadata(
            name="random_user",
            description="Generate random user data for examples",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["random", "users", "data", "generator", "examples"],
            requires_auth=False
        ),
        "agify": APIMetadata(
            name="agify",
            description="Predict age from name",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["names", "age", "demographics", "prediction", "data"],
            requires_auth=False
        ),
        "genderize": APIMetadata(
            name="genderize",
            description="Predict gender from name",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["names", "gender", "demographics", "prediction", "data"],
            requires_auth=False
        ),
        "nationalize": APIMetadata(
            name="nationalize",
            description="Predict nationality from name",
            categories=[APICategory.GENERAL_KNOWLEDGE],
            keywords=["names", "nationality", "countries", "prediction", "data"],
            requires_auth=False
        ),
        
        # ANIME Category
        "jikan": APIMetadata(
            name="jikan",
            description="Unofficial MyAnimeList API for anime data",
            categories=[APICategory.ANIME, APICategory.ENTERTAINMENT],
            keywords=["anime", "manga", "myanimelist", "japanese", "animation"],
            requires_auth=False
        ),
        "studio_ghibli": APIMetadata(
            name="studio_ghibli",
            description="Studio Ghibli films, characters, and locations",
            categories=[APICategory.ANIME, APICategory.ENTERTAINMENT],
            keywords=["ghibli", "anime", "films", "miyazaki", "japanese"],
            requires_auth=False
        ),
        
        # GAMES & COMICS Category
        "marvel": APIMetadata(
            name="marvel",
            description="Marvel comics characters and stories",
            categories=[APICategory.GAMES_COMICS, APICategory.ENTERTAINMENT],
            keywords=["marvel", "comics", "superheroes", "characters", "stories"],
            requires_auth=True
        ),
        "deck_of_cards": APIMetadata(
            name="deck_of_cards",
            description="Deck of cards API for card games",
            categories=[APICategory.GAMES_COMICS],
            keywords=["cards", "games", "deck", "playing cards", "shuffle"],
            requires_auth=False
        ),
        "magic_the_gathering": APIMetadata(
            name="magic_the_gathering",
            description="Magic: The Gathering card game data",
            categories=[APICategory.GAMES_COMICS],
            keywords=["mtg", "magic", "cards", "games", "trading cards"],
            requires_auth=False
        ),
        
        # GEOCODING & GEOGRAPHY Category
        "geocodio": APIMetadata(
            name="geocodio",
            description="Address geocoding and reverse geocoding",
            categories=[APICategory.GEOCODING],
            keywords=["geocoding", "addresses", "coordinates", "location", "maps"],
            requires_auth=True
        ),
        "ip_geolocation": APIMetadata(
            name="ip_geolocation",
            description="IP address geolocation data",
            categories=[APICategory.GEOCODING],
            keywords=["ip", "geolocation", "location", "address", "country"],
            requires_auth=False
        ),
        "zippopotam": APIMetadata(
            name="zippopotam",
            description="Postal and zip code data worldwide",
            categories=[APICategory.GEOCODING],
            keywords=["zip code", "postal", "location", "address", "geography"],
            requires_auth=False
        ),
        
        # GOVERNMENT & OPEN DATA Category
        "data_gov": APIMetadata(
            name="data_gov",
            description="US Government open data",
            categories=[APICategory.GOVERNMENT, APICategory.OPEN_DATA],
            keywords=["government", "usa", "data", "statistics", "public"],
            requires_auth=True
        ),
        "data_gov_uk": APIMetadata(
            name="data_gov_uk",
            description="UK Government open data",
            categories=[APICategory.GOVERNMENT, APICategory.OPEN_DATA],
            keywords=["government", "uk", "data", "statistics", "public"],
            requires_auth=False
        ),
        
        # MACHINE LEARNING Category
        "huggingface": APIMetadata(
            name="huggingface",
            description="AI models and machine learning APIs",
            categories=[APICategory.MACHINE_LEARNING, APICategory.TECHNOLOGY],
            keywords=["ai", "ml", "models", "nlp", "transformers"],
            requires_auth=True
        ),
        "clarifai": APIMetadata(
            name="clarifai",
            description="Computer vision and image recognition",
            categories=[APICategory.MACHINE_LEARNING],
            keywords=["vision", "image", "recognition", "ai", "ml"],
            requires_auth=True
        ),
        
        # MUSIC Category
        "lastfm": APIMetadata(
            name="lastfm",
            description="Music metadata and recommendations",
            categories=[APICategory.MUSIC, APICategory.ENTERTAINMENT],
            keywords=["music", "songs", "artists", "albums", "lastfm"],
            requires_auth=True
        ),
        "genius": APIMetadata(
            name="genius",
            description="Song lyrics and annotations",
            categories=[APICategory.MUSIC],
            keywords=["lyrics", "songs", "music", "genius", "annotations"],
            requires_auth=True
        ),
        "musicbrainz": APIMetadata(
            name="musicbrainz",
            description="Open music encyclopedia",
            categories=[APICategory.MUSIC],
            keywords=["music", "metadata", "artists", "albums", "database"],
            requires_auth=False
        ),
        
        # PHOTOGRAPHY Category
        "unsplash": APIMetadata(
            name="unsplash",
            description="High-quality free photos",
            categories=[APICategory.PHOTOGRAPHY],
            keywords=["photos", "images", "pictures", "photography", "free"],
            requires_auth=True
        ),
        "pexels": APIMetadata(
            name="pexels",
            description="Free stock photos and videos",
            categories=[APICategory.PHOTOGRAPHY, APICategory.VIDEO],
            keywords=["photos", "videos", "stock", "free", "images"],
            requires_auth=True
        ),
        "pixabay": APIMetadata(
            name="pixabay",
            description="Free images and videos",
            categories=[APICategory.PHOTOGRAPHY],
            keywords=["images", "photos", "videos", "free", "stock"],
            requires_auth=True
        ),
        
        # PERSONALITY & QUOTES Category
        "foaas": APIMetadata(
            name="foaas",
            description="Fuck Off As A Service (humorous)",
            categories=[APICategory.PERSONALITY, APICategory.ENTERTAINMENT],
            keywords=["humor", "jokes", "funny", "insults", "comedy"],
            requires_auth=False
        ),
        "kanye_rest": APIMetadata(
            name="kanye_rest",
            description="Random Kanye West quotes",
            categories=[APICategory.PERSONALITY],
            keywords=["kanye", "quotes", "rap", "music", "celebrity"],
            requires_auth=False
        ),
        "ron_swanson": APIMetadata(
            name="ron_swanson",
            description="Ron Swanson quotes from Parks and Recreation",
            categories=[APICategory.PERSONALITY, APICategory.ENTERTAINMENT],
            keywords=["ron swanson", "quotes", "parks rec", "tv", "comedy"],
            requires_auth=False
        ),
        
        # PROGRAMMING & DEVELOPMENT Category
        "github_trending": APIMetadata(
            name="github_trending",
            description="Trending GitHub repositories",
            categories=[APICategory.PROGRAMMING, APICategory.DEVELOPMENT],
            keywords=["github", "trending", "repositories", "code", "developers"],
            requires_auth=False
        ),
        "public_apis": APIMetadata(
            name="public_apis",
            description="List of public APIs",
            categories=[APICategory.PROGRAMMING, APICategory.DEVELOPMENT],
            keywords=["apis", "public", "list", "directory", "development"],
            requires_auth=False
        ),
        
        # SCIENCE & MATH Category (additional)
        "open_notify": APIMetadata(
            name="open_notify",
            description="ISS location and astronaut data",
            categories=[APICategory.SCIENCE_MATH],
            keywords=["iss", "space", "astronauts", "orbit", "nasa"],
            requires_auth=False
        ),
        "sunrise_sunset": APIMetadata(
            name="sunrise_sunset",
            description="Sunrise and sunset times for any location",
            categories=[APICategory.SCIENCE_MATH, APICategory.WEATHER],
            keywords=["sunrise", "sunset", "sun", "time", "location"],
            requires_auth=False
        ),
        
        # SOCIAL Category
        "twitter": APIMetadata(
            name="twitter",
            description="Twitter social media data",
            categories=[APICategory.SOCIAL],
            keywords=["twitter", "tweets", "social media", "posts", "trending"],
            requires_auth=True
        ),
        "mastodon": APIMetadata(
            name="mastodon",
            description="Mastodon decentralized social network",
            categories=[APICategory.SOCIAL],
            keywords=["mastodon", "social", "decentralized", "posts", "fediverse"],
            requires_auth=True
        ),
        
        # TRANSPORTATION Category
        "transport_uk": APIMetadata(
            name="transport_uk",
            description="UK public transport data",
            categories=[APICategory.TRANSPORTATION],
            keywords=["transport", "uk", "trains", "buses", "travel"],
            requires_auth=True
        ),
        "flight_aware": APIMetadata(
            name="flight_aware",
            description="Flight tracking and aviation data",
            categories=[APICategory.TRANSPORTATION],
            keywords=["flights", "aviation", "tracking", "airports", "planes"],
            requires_auth=True
        ),
        
        # VIDEO Category (additional)
        "vimeo": APIMetadata(
            name="vimeo",
            description="Vimeo video platform data",
            categories=[APICategory.VIDEO, APICategory.ENTERTAINMENT],
            keywords=["vimeo", "videos", "streaming", "content", "creators"],
            requires_auth=True
        ),
        "twitch": APIMetadata(
            name="twitch",
            description="Twitch streaming platform data",
            categories=[APICategory.VIDEO, APICategory.ENTERTAINMENT],
            keywords=["twitch", "streaming", "games", "live", "video"],
            requires_auth=True
        ),
        
        # ENVIRONMENT Category (additional)
        "carbon_interface": APIMetadata(
            name="carbon_interface",
            description="Carbon emissions calculations",
            categories=[APICategory.ENVIRONMENT],
            keywords=["carbon", "emissions", "environment", "climate", "sustainability"],
            requires_auth=True
        ),
        "openaq": APIMetadata(
            name="openaq",
            description="Open air quality data",
            categories=[APICategory.ENVIRONMENT, APICategory.HEALTH],
            keywords=["air quality", "pollution", "environment", "health", "data"],
            requires_auth=True
        ),
        
        # CALENDAR & EVENTS Category
        "calendarific": APIMetadata(
            name="calendarific",
            description="Worldwide holidays and events",
            categories=[APICategory.CALENDAR, APICategory.EVENTS],
            keywords=["holidays", "calendar", "events", "dates", "celebrations"],
            requires_auth=True
        ),
        "nager_date": APIMetadata(
            name="nager_date",
            description="Public holidays for 100+ countries",
            categories=[APICategory.CALENDAR],
            keywords=["holidays", "public", "dates", "countries", "calendar"],
            requires_auth=False
        ),
        
        # BUSINESS Category
        "clearbit": APIMetadata(
            name="clearbit",
            description="Company data and business intelligence",
            categories=[APICategory.BUSINESS],
            keywords=["companies", "business", "data", "intelligence", "logos"],
            requires_auth=True
        ),
        "hunter": APIMetadata(
            name="hunter",
            description="Email finder and verification",
            categories=[APICategory.BUSINESS, APICategory.EMAIL],
            keywords=["email", "finder", "verification", "business", "contacts"],
            requires_auth=True
        ),
        
        # FOOD & DRINK Category (additional)
        "cocktail_db": APIMetadata(
            name="cocktail_db",
            description="Cocktail recipes and ingredients",
            categories=[APICategory.FOOD_DRINK],
            keywords=["cocktails", "drinks", "recipes", "alcohol", "mixology"],
            requires_auth=True
        ),
        "open_food_facts": APIMetadata(
            name="open_food_facts",
            description="Food products database with nutrition",
            categories=[APICategory.FOOD_DRINK, APICategory.HEALTH],
            keywords=["food", "nutrition", "products", "ingredients", "database"],
            requires_auth=False
        ),
        "fruityvice": APIMetadata(
            name="fruityvice",
            description="Data about fruits and nutrition",
            categories=[APICategory.FOOD_DRINK, APICategory.HEALTH],
            keywords=["fruits", "nutrition", "health", "food", "vitamins"],
            requires_auth=False
        ),
        
        # URL SHORTENERS Category
        "bitly": APIMetadata(
            name="bitly",
            description="URL shortening and link management",
            categories=[APICategory.URL_SHORTENERS],
            keywords=["url", "shortener", "links", "bitly", "redirect"],
            requires_auth=True
        ),
        "tinyurl": APIMetadata(
            name="tinyurl",
            description="Simple URL shortening service",
            categories=[APICategory.URL_SHORTENERS],
            keywords=["url", "shortener", "links", "tiny", "redirect"],
            requires_auth=True
        ),
        
        # TEST DATA Category
        "json_placeholder": APIMetadata(
            name="json_placeholder",
            description="Fake REST API for testing",
            categories=[APICategory.TEST_DATA, APICategory.DEVELOPMENT],
            keywords=["test", "fake", "api", "json", "placeholder"],
            requires_auth=False
        ),
        "mockaroo": APIMetadata(
            name="mockaroo",
            description="Realistic test data generator",
            categories=[APICategory.TEST_DATA],
            keywords=["test", "data", "generator", "mock", "fake"],
            requires_auth=True
        ),
        "faker": APIMetadata(
            name="faker",
            description="Generate fake data for testing",
            categories=[APICategory.TEST_DATA],
            keywords=["fake", "data", "generator", "test", "random"],
            requires_auth=False
        ),
    }
    
    @classmethod
    def get_all_apis(cls) -> Dict[str, APIMetadata]:
        """Get all registered APIs"""
        return cls.APIS
    
    @classmethod
    def get_api(cls, name: str) -> Optional[APIMetadata]:
        """Get metadata for a specific API"""
        return cls.APIS.get(name)
    
    @classmethod
    def get_apis_by_category(cls, category: APICategory) -> List[str]:
        """Get all API names in a category"""
        return [
            name for name, meta in cls.APIS.items()
            if category in meta.categories
        ]
    
    @classmethod
    def search_apis(cls, query: str) -> List[str]:
        """
        Search APIs by keywords.
        Returns list of API names matching the query.
        """
        query_lower = query.lower()
        matches = []
        
        for name, meta in cls.APIS.items():
            # Check if query matches name, description, or keywords
            if (query_lower in name.lower() or
                query_lower in meta.description.lower() or
                any(query_lower in keyword.lower() for keyword in meta.keywords)):
                matches.append(name)
        
        return matches
    
    @classmethod
    def get_api_summary(cls) -> str:
        """
        Get a formatted summary of all APIs for LLM context.
        Used by API Selector Agent.
        """
        lines = ["Available APIs:"]
        for name, meta in cls.APIS.items():
            keywords_str = ", ".join(meta.keywords[:5])  # First 5 keywords
            lines.append(f"- {name}: {meta.description} (Keywords: {keywords_str})")
        return "\n".join(lines)
