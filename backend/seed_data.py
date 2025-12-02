from models import Field, Lesson, QuizQuestion, DifficultyLevel, QuestionType
from datetime import datetime, date
import uuid

# Sample data for initial database seeding

def get_seed_fields() -> list[Field]:
    return [
        Field(
            id="tech",
            name="Technology",
            description="Latest in tech and AI developments",
            icon="🤖",
            color="#00FFF0",
            total_lessons=62,
            created_at=datetime.now()
        ),
        Field(
            id="finance",
            name="Finance",
            description="Markets and investing",
            icon="📈",
            color="#FF6B35",
            total_lessons=45,
            created_at=datetime.now()
        ),
        Field(
            id="economics",
            name="Economics",
            description="Economic principles and trends",
            icon="💰",
            color="#00FF88",
            total_lessons=38,
            created_at=datetime.now()
        ),
        Field(
            id="culture",
            name="Culture",
            description="Arts and society",
            icon="🌍",
            color="#FF00FF",
            total_lessons=28,
            created_at=datetime.now()
        ),
        Field(
            id="influence",
            name="Influence Skills",
            description="Communication and leadership",
            icon="💡",
            color="#FFD700",
            total_lessons=33,
            created_at=datetime.now()
        ),
        Field(
            id="global",
            name="Global Events",
            description="World news and politics",
            icon="🌐",
            color="#00BFFF",
            total_lessons=41,
            created_at=datetime.now()
        )
    ]

def get_seed_lessons() -> list[Lesson]:
    return [
        # Technology Lessons
        Lesson(
            id="tech_001",
            title="Introduction to Blockchain Technology",
            content="""Blockchain is a distributed ledger technology that maintains a secure and decentralized record of transactions. 

Key Concepts:
- **Distributed Ledger**: A database shared across multiple nodes in a network
- **Cryptography**: Mathematical techniques for secure communication
- **Consensus Mechanisms**: Protocols for validating transactions (Proof of Work, Proof of Stake)

Blockchain's primary innovation is creating trust without requiring central authorities. Each block contains a cryptographic hash of the previous block, forming an immutable chain.""",
            field_id="tech",
            difficulty_level=DifficultyLevel.BEGINNER,
            estimated_minutes=15,
            learning_objectives=[
                "Understand blockchain fundamentals",
                "Identify key use cases",
                "Explain consensus mechanisms"
            ],
            key_concepts=[
                "Distributed ledger",
                "Cryptography",
                "Consensus mechanisms",
                "Smart contracts"
            ],
            created_at=datetime.now()
        ),
        Lesson(
            id="tech_002",
            title="Machine Learning Fundamentals",
            content="""Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

Core Concepts:
- **Supervised Learning**: Learning from labeled training data
- **Unsupervised Learning**: Finding patterns in unlabeled data
- **Neural Networks**: Computing systems inspired by biological neural networks

ML algorithms build mathematical models based on sample data to make predictions or decisions.""",
            field_id="tech",
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            estimated_minutes=20,
            learning_objectives=[
                "Differentiate ML types",
                "Understand neural networks",
                "Identify common algorithms"
            ],
            key_concepts=[
                "Supervised learning",
                "Unsupervised learning",
                "Neural networks",
                "Feature engineering"
            ],
            created_at=datetime.now()
        ),
        # Finance Lessons
        Lesson(
            id="finance_001",
            title="Introduction to Stock Market Analysis",
            content="""Stock market analysis involves evaluating securities to make informed investment decisions.

Analysis Types:
- **Fundamental Analysis**: Evaluating company financial health and intrinsic value
- **Technical Analysis**: Studying price patterns and market trends
- **Quantitative Analysis**: Using mathematical models and statistical methods

Key Metrics:
- P/E Ratio: Price-to-Earnings ratio
- Market Cap: Total market value of shares
- Volume: Number of shares traded""",
            field_id="finance",
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            estimated_minutes=20,
            learning_objectives=[
                "Understand analysis types",
                "Identify key metrics",
                "Apply basic valuation methods"
            ],
            key_concepts=[
                "Fundamental analysis",
                "Technical analysis",
                "P/E ratio",
                "Market capitalization"
            ],
            created_at=datetime.now()
        ),
        # Economics Lessons
        Lesson(
            id="econ_001",
            title="Understanding Inflation and GDP",
            content="""Inflation and GDP are fundamental economic indicators that reflect economic health and performance.

Inflation:
- Rate at which general price levels increase
- Measured by Consumer Price Index (CPI)
- Central banks target 2-3% inflation

GDP (Gross Domestic Product):
- Total value of goods and services produced
- Real GDP adjusts for inflation
- GDP growth indicates economic expansion""",
            field_id="economics",
            difficulty_level=DifficultyLevel.BEGINNER,
            estimated_minutes=18,
            learning_objectives=[
                "Define inflation and GDP",
                "Explain measurement methods",
                "Understand economic implications"
            ],
            key_concepts=[
                "Inflation rate",
                "CPI",
                "Real vs Nominal GDP",
                "Economic growth"
            ],
            created_at=datetime.now()
        )
    ]

def get_seed_quiz_questions() -> list[QuizQuestion]:
    return [
        # Blockchain Quiz
        QuizQuestion(
            id="quiz_tech_001_q1",
            lesson_id="tech_001",
            question="What is the primary purpose of blockchain technology?",
            question_type=QuestionType.MULTIPLE_CHOICE,
            options=["Secure data storage", "Fast transactions", "Decentralized trust", "Mining cryptocurrency"],
            correct_answer="Decentralized trust",
            explanation="Blockchain's main innovation is creating trust without requiring central authorities through distributed consensus.",
            created_at=datetime.now()
        ),
        QuizQuestion(
            id="quiz_tech_001_q2",
            lesson_id="tech_001",
            question="True or False: Each block in a blockchain contains a cryptographic hash of the previous block.",
            question_type=QuestionType.TRUE_FALSE,
            correct_answer="True",
            explanation="This chaining of blocks through cryptographic hashes ensures the immutability and security of the blockchain.",
            created_at=datetime.now()
        ),
        # Machine Learning Quiz
        QuizQuestion(
            id="quiz_tech_002_q1",
            lesson_id="tech_002",
            question="Which type of machine learning uses labeled training data?",
            question_type=QuestionType.MULTIPLE_CHOICE,
            options=["Unsupervised learning", "Supervised learning", "Reinforcement learning", "Transfer learning"],
            correct_answer="Supervised learning",
            explanation="Supervised learning algorithms learn from labeled examples to make predictions on new, unseen data.",
            created_at=datetime.now()
        ),
        # Stock Market Quiz
        QuizQuestion(
            id="quiz_finance_001_q1",
            lesson_id="finance_001",
            question="What does a high P/E ratio typically indicate?",
            question_type=QuestionType.MULTIPLE_CHOICE,
            options=["Undervalued stock", "Overvalued stock", "Low growth prospects", "High dividend yield"],
            correct_answer="Overvalued stock",
            explanation="A high P/E ratio suggests investors are paying more for each dollar of earnings, potentially indicating overvaluation.",
            created_at=datetime.now()
        ),
        # Economics Quiz
        QuizQuestion(
            id="quiz_econ_001_q1",
            lesson_id="econ_001",
            question="What is the typical inflation target for most central banks?",
            question_type=QuestionType.MULTIPLE_CHOICE,
            options=["0-1%", "2-3%", "5-6%", "8-10%"],
            correct_answer="2-3%",
            explanation="Most central banks target 2-3% inflation as a balance between price stability and economic growth.",
            created_at=datetime.now()
        )
    ]

def get_seed_data():
    return {
        "fields": get_seed_fields(),
        "lessons": get_seed_lessons(),
        "quiz_questions": get_seed_quiz_questions()
    }
