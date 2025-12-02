import asyncio
from database import db
from datetime import datetime

# Sample lesson content
LESSON_CONTENT = {
    "technology": [
        {
            "title": "Introduction to Blockchain Technology",
            "content": """# Blockchain Technology: A Beginner's Guide

Blockchain technology has revolutionized how we think about data storage and transactions. At its core, a blockchain is a distributed ledger that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography.

## Key Concepts

### 1. Distributed Ledger
Unlike traditional databases managed by a central authority, a distributed ledger is shared across multiple participants in a network. Each participant maintains an identical copy of the ledger.

### 2. Cryptographic Security
Each block contains a cryptographic hash of the previous block, creating a chain. This makes it extremely difficult to alter past transactions without being detected.

### 3. Consensus Mechanisms
Blockchain networks use consensus algorithms like Proof of Work (PoW) or Proof of Stake (PoS) to validate new transactions and maintain the integrity of the chain.

## Real-World Applications

- **Cryptocurrencies**: Bitcoin, Ethereum, and other digital currencies
- **Supply Chain**: Tracking goods from manufacturer to consumer
- **Smart Contracts**: Self-executing contracts with predefined rules
- **Digital Identity**: Secure and portable identity verification

## Benefits
- Transparency and immutability
- Reduced transaction costs
- Enhanced security
- Elimination of intermediaries

Understanding blockchain is essential for anyone interested in the future of technology and finance.""",
            "difficulty": "beginner",
            "points": 15,
            "reading_time": 12,
            "tags": ["blockchain", "cryptocurrency", "technology", "innovation"]
        },
        {
            "title": "Machine Learning Fundamentals",
            "content": """# Machine Learning: Teaching Computers to Learn

Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed for every task.

## Types of Machine Learning

### 1. Supervised Learning
The algorithm learns from labeled training data, making predictions or decisions based on examples that have been marked with the correct answers.

**Examples**: Image classification, spam detection, medical diagnosis

### 2. Unsupervised Learning
The algorithm finds patterns in unlabeled data by identifying similarities and differences.

**Examples**: Customer segmentation, anomaly detection, clustering

### 3. Reinforcement Learning
The algorithm learns through trial and error, receiving rewards for correct actions and penalties for wrong ones.

**Examples**: Game playing, robotics, optimization problems

## Key Algorithms to Know

- **Linear Regression**: Predicting continuous values
- **Decision Trees**: Making decisions based on feature values
- **Neural Networks**: Mimicking the human brain's structure
- **Support Vector Machines**: Finding optimal boundaries between classes

## Practical Applications

- **Healthcare**: Disease prediction and drug discovery
- **Finance**: Fraud detection and risk assessment
- **Transportation**: Self-driving cars and route optimization
- **Entertainment**: Recommendation systems and content personalization

## Getting Started

1. Learn Python programming basics
2. Study linear algebra and statistics
3. Practice with datasets from Kaggle
4. Build simple projects and gradually increase complexity

Machine Learning is transforming every industry, and understanding its fundamentals is crucial for modern tech professionals.""",
            "difficulty": "intermediate",
            "points": 20,
            "reading_time": 15,
            "tags": ["machine learning", "AI", "python", "data science"]
        }
    ],
    "finance": [
        {
            "title": "Understanding Stock Market Basics",
            "content": """# Stock Market Fundamentals: Your Gateway to Investing

The stock market is where shares of publicly traded companies are bought and sold. Understanding how it works is essential for building long-term wealth.

## What Are Stocks?

Stocks represent ownership shares in a company. When you buy a stock, you become a partial owner of that business.

## Key Concepts

### 1. Stock Exchanges
Platforms where stocks are traded:
- **NYSE**: New York Stock Exchange (traditional, large companies)
- **NASDAQ**: Technology-focused, electronic trading
- **Global Markets**: London, Tokyo, Hong Kong exchanges

### 2. Market Indices
Benchmark indicators of market performance:
- **S&P 500**: 500 largest US companies
- **Dow Jones**: 30 major industrial companies
- **NASDAQ Composite**: Technology-heavy index

### 3. Market Orders vs. Limit Orders
- **Market Order**: Buy/sell immediately at current price
- **Limit Order**: Set a specific price for execution

## Investment Strategies

### 1. Long-Term Investing
Buy and hold quality companies for years or decades. Focus on:
- Strong fundamentals
- Competitive advantages
- Growth potential

### 2. Dividend Investing
Focus on stocks that pay regular dividends, providing:
- Regular income
- Compound growth through reinvestment
- Lower volatility

### 3. Index Fund Investing
Passive investing in market indices:
- Diversification
- Low fees
- Market-matching returns

## Risk Management

- **Diversification**: Don't put all eggs in one basket
- **Position Sizing**: Limit exposure to any single stock
- **Stop Losses**: Set automatic sell points to limit losses
- **Research**: Understand what you're buying

## Common Mistakes to Avoid

1. Emotional decision-making
2. Trying to time the market
3. Chasing hot stocks without research
4. Ignoring fees and taxes
5. Lack of diversification

## Getting Started

1. Open a brokerage account
2. Start with index funds or ETFs
3. Invest consistently (dollar-cost averaging)
4. Continue learning and adapting

The stock market has historically provided excellent long-term returns for patient investors who focus on fundamentals and maintain discipline.""",
            "difficulty": "beginner",
            "points": 15,
            "reading_time": 10,
            "tags": ["stocks", "investing", "finance", "wealth building"]
        }
    ],
    "culture": [
        {
            "title": "The Psychology of Social Media",
            "content": """# Social Media Psychology: Understanding Digital Behavior

Social media has fundamentally changed how we communicate, form relationships, and perceive ourselves. Understanding the psychology behind these platforms is crucial for digital literacy.

## The Attention Economy

Social media platforms compete for your attention using sophisticated psychological techniques:

### 1. Variable Rewards
Like slot machines, social media uses unpredictable rewards:
- Likes, comments, shares
- Notifications and mentions
- Content that appears randomly

This creates a dopamine loop that keeps users coming back.

### 2. Social Validation
Humans are wired to seek social acceptance:
- Likes serve as digital approval
- Comments provide social connection
- Shares indicate value and importance

## Cognitive Effects

### 1. Social Comparison
Constant exposure to curated lives leads to:
- Upward comparison (feeling inadequate)
- Fear of Missing Out (FOMO)
- Anxiety and depression

### 2. Echo Chambers
Algorithms show content that confirms existing beliefs:
- Reinforces biases
- Reduces exposure to diverse perspectives
- Increases polarization

### 3. Attention Fragmentation
Constant notifications impact:
- Deep thinking ability
- Task completion rates
- Memory retention

## Positive Aspects

Despite concerns, social media offers benefits:

### 1. Connection
- Maintains relationships across distance
- Finds communities with shared interests
- Provides support networks

### 2. Information Access
- Real-time news and events
- Educational content
- Diverse perspectives

### 3. Self-Expression
- Creative outlet
- Personal branding
- Civic engagement

## Healthy Usage Strategies

### 1. Mindful Consumption
- Set time limits and boundaries
- Curate your feed intentionally
- Take regular digital detoxes

### 2. Critical Thinking
- Question sources and motivations
- Recognize manipulation tactics
- Seek diverse viewpoints

### 3. Authentic Connection
- Prioritize meaningful interactions
- Share genuinely, not for validation
- Balance online and offline relationships

## Future Considerations

As technology evolves, consider:
- AI-generated content authenticity
- Virtual reality social spaces
- Digital well-being tools and regulations

Understanding social media psychology empowers you to use these platforms intentionally rather than being controlled by them.""",
            "difficulty": "intermediate",
            "points": 18,
            "reading_time": 12,
            "tags": ["social media", "psychology", "digital literacy", "mental health"]
        }
    ]
}

# Sample quiz questions
QUIZ_CONTENT = {
    "blockchain": [
        {
            "question": "What is the primary purpose of blockchain technology?",
            "options": ["Fast transactions", "Decentralized trust", "Data storage", "Mining cryptocurrency"],
            "correct_answer": 1,
            "explanation": "Blockchain's main purpose is to create trust without central authorities by using distributed consensus mechanisms."
        },
        {
            "question": "How are blocks linked together in a blockchain?",
            "options": ["Sequential numbering", "Cryptographic hashes", "Physical connections", "Random assignment"],
            "correct_answer": 1,
            "explanation": "Each block contains a cryptographic hash of the previous block, creating an immutable chain."
        }
    ],
    "machine_learning": [
        {
            "question": "What type of learning uses labeled training data?",
            "options": ["Unsupervised learning", "Reinforcement learning", "Supervised learning", "Transfer learning"],
            "correct_answer": 2,
            "explanation": "Supervised learning uses labeled examples where the algorithm learns the relationship between inputs and known outputs."
        },
        {
            "question": "Which algorithm mimics the human brain's structure?",
            "options": ["Linear regression", "Decision trees", "Neural networks", "Support vector machines"],
            "correct_answer": 2,
            "explanation": "Neural networks are inspired by the structure and function of biological neurons in the human brain."
        }
    ],
    "stocks": [
        {
            "question": "What does diversification help reduce?",
            "options": ["Returns", "Risk", "Taxes", "Fees"],
            "correct_answer": 1,
            "explanation": "Diversification reduces portfolio risk by spreading investments across different assets and sectors."
        },
        {
            "question": "What is the S&P 500?",
            "options": ["500 smallest companies", "500 largest US companies", "500 international companies", "500 tech companies"],
            "correct_answer": 1,
            "explanation": "The S&P 500 is a market index that tracks the performance of 500 of the largest publicly traded companies in the United States."
        }
    ],
    "social_media": [
        {
            "question": "What creates the addictive nature of social media?",
            "options": ["Fixed rewards", "Variable rewards", "No rewards", "Punishment"],
            "correct_answer": 1,
            "explanation": "Variable rewards, similar to slot machines, create dopamine loops that make social media addictive."
        },
        {
            "question": "What is FOMO?",
            "options": ["Fear of missing out", "Friends on my phone", "Followers on media online", "Feeling of moving on"],
            "correct_answer": 0,
            "explanation": "FOMO stands for Fear of Missing Out - the anxiety that exciting events are happening without you."
        }
    ]
}

async def seed_database():
    print("Starting database seeding...")
    
    # Get categories
    categories = await db.get_categories()
    category_map = {cat["slug"]: cat["id"] for cat in categories}
    
    # Create lessons
    for category_slug, lessons in LESSON_CONTENT.items():
        if category_slug not in category_map:
            print(f"Category {category_slug} not found")
            continue
            
        category_id = category_map[category_slug]
        
        for lesson_data in lessons:
            lesson = {
                "title": lesson_data["title"],
                "content": lesson_data["content"],
                "category_id": category_id,
                "difficulty": lesson_data["difficulty"],
                "points": lesson_data["points"],
                "reading_time": lesson_data["reading_time"],
                "tags": lesson_data["tags"],
                "is_published": True,
                "created_at": datetime.now().isoformat()
            }
            
            created_lesson = await db.create_lesson(lesson)
            print(f"Created lesson: {lesson_data['title']}")
            
            # Create quizzes for this lesson
            lesson_key = lesson_data["title"].lower().replace(" ", "_").replace(":", "").replace("-", "_")
            if lesson_key in ["blockchain_technology", "machine_learning_fundamentals", "stock_market_basics", "psychology_of_social_media"]:
                # Map lesson titles to quiz keys
                quiz_key_mapping = {
                    "blockchain_technology": "blockchain",
                    "machine_learning_fundamentals": "machine_learning", 
                    "stock_market_basics": "stocks",
                    "psychology_of_social_media": "social_media"
                }
                
                quiz_key = quiz_key_mapping.get(lesson_key)
                if quiz_key and quiz_key in QUIZ_CONTENT:
                    for quiz_data in QUIZ_CONTENT[quiz_key]:
                        quiz = {
                            "lesson_id": created_lesson["id"],
                            "question": quiz_data["question"],
                            "options": quiz_data["options"],
                            "correct_answer": quiz_data["correct_answer"],
                            "explanation": quiz_data["explanation"],
                            "points": 5,
                            "created_at": datetime.now().isoformat()
                        }
                        
                        await db.client.table("quizzes").insert(quiz).execute()
                        print(f"Created quiz for: {quiz_data['question']}")
    
    print("Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())
