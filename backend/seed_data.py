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
            name="Influence",
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
    lessons = []
    
    # TECHNOLOGY LESSONS (10 lessons)
    tech_lessons = [
        ("tech_001", "Introduction to Blockchain Technology", "Beginner", 15, """Blockchain is a distributed ledger technology that maintains a secure and decentralized record of transactions. Each block contains a cryptographic hash of the previous block, forming an immutable chain. Key concepts include distributed ledgers, cryptography, and consensus mechanisms like Proof of Work and Proof of Stake."""),
        ("tech_002", "Machine Learning Fundamentals", "Intermediate", 20, """Machine Learning enables systems to learn from experience without explicit programming. Core types include supervised learning (labeled data), unsupervised learning (pattern finding), and neural networks (biological-inspired computing). ML algorithms build mathematical models to make predictions."""),
        ("tech_003", "Cloud Computing Essentials", "Beginner", 12, """Cloud computing delivers computing services over the internet. Major models include IaaS (Infrastructure), PaaS (Platform), and SaaS (Software). Benefits include scalability, cost-efficiency, and accessibility. Major providers are AWS, Azure, and Google Cloud."""),
        ("tech_004", "Cybersecurity Best Practices", "Intermediate", 18, """Cybersecurity protects systems from digital attacks. Key practices include strong passwords, multi-factor authentication, regular updates, and data encryption. Common threats include phishing, malware, and ransomware. Defense strategies use firewalls, antivirus, and security awareness."""),
        ("tech_005", "Introduction to Quantum Computing", "Advanced", 25, """Quantum computing uses quantum mechanics for computation. Qubits can exist in superposition, enabling parallel processing. Quantum algorithms like Shor's and Grover's solve specific problems exponentially faster. Applications include cryptography, drug discovery, and optimization."""),
        ("tech_006", "5G Technology and IoT", "Intermediate", 16, """5G offers faster speeds, lower latency, and massive device connectivity. IoT connects physical devices to the internet for data collection and automation. Together, they enable smart cities, autonomous vehicles, and industrial automation."""),
        ("tech_007", "Artificial Intelligence Ethics", "Advanced", 22, """AI ethics addresses fairness, transparency, and accountability. Key concerns include algorithmic bias, privacy, job displacement, and autonomous weapons. Frameworks emphasize human oversight, explainability, and inclusive design."""),
        ("tech_008", "Web3 and Decentralization", "Intermediate", 19, """Web3 represents the decentralized internet using blockchain. Key features include user ownership, tokenization, and smart contracts. Applications include DeFi (Decentralized Finance), NFTs, and DAOs (Decentralized Autonomous Organizations)."""),
        ("tech_009", "DevOps and CI/CD", "Intermediate", 17, """DevOps combines development and operations for faster delivery. CI/CD automates testing and deployment. Key practices include version control, automated testing, containerization (Docker), and orchestration (Kubernetes)."""),
        ("tech_010", "Edge Computing Explained", "Beginner", 14, """Edge computing processes data near its source rather than in centralized data centers. Benefits include reduced latency, bandwidth savings, and improved privacy. Use cases include autonomous vehicles, smart manufacturing, and real-time analytics."""),
    ]
    
    for lesson_id, title, difficulty, minutes, content in tech_lessons:
        lessons.append(Lesson(
            id=lesson_id,
            title=title,
            content=content,
            field_id="tech",
            field_name="Technology",
            difficulty_level=getattr(DifficultyLevel, difficulty.upper()),
            estimated_minutes=minutes,
            learning_objectives=[f"Understand {title.lower()}", "Apply key concepts", "Identify use cases"],
            key_concepts=content.split('. ')[:3],
            created_at=datetime.now()
        ))
    
    # FINANCE LESSONS (10 lessons)
    finance_lessons = [
        ("finance_001", "Stock Market Basics", "Beginner", 15, """Stock markets facilitate buying and selling of company shares. Key concepts include market capitalization, trading volume, and stock exchanges (NYSE, NASDAQ). Investors analyze companies using fundamental and technical analysis to make informed decisions."""),
        ("finance_002", "Understanding Cryptocurrency", "Intermediate", 20, """Cryptocurrency is digital money using cryptography for security. Bitcoin pioneered blockchain-based currency. Key concepts include wallets, exchanges, mining, and volatility. Cryptocurrencies offer decentralization but face regulatory challenges."""),
        ("finance_003", "Personal Finance Management", "Beginner", 12, """Personal finance covers budgeting, saving, and investing. The 50/30/20 rule allocates income: 50% needs, 30% wants, 20% savings. Emergency funds should cover 3-6 months of expenses. Compound interest grows wealth over time."""),
        ("finance_004", "Investment Portfolio Diversification", "Intermediate", 18, """Diversification spreads risk across different assets. Asset classes include stocks, bonds, real estate, and commodities. Modern Portfolio Theory optimizes risk-return tradeoff. Rebalancing maintains target allocations."""),
        ("finance_005", "Options and Derivatives Trading", "Advanced", 25, """Options give rights to buy (call) or sell (put) assets. Derivatives derive value from underlying assets. Strategies include hedging, speculation, and arbitrage. Greeks measure option sensitivity to various factors."""),
        ("finance_006", "Real Estate Investment", "Intermediate", 16, """Real estate investing includes rental properties, REITs, and flipping. Key metrics: cap rate, cash-on-cash return, and NOI. Leverage amplifies returns but increases risk. Location and market timing are crucial."""),
        ("finance_007", "Retirement Planning Strategies", "Beginner", 14, """Retirement planning ensures financial security in later years. Accounts include 401(k), IRA, and Roth IRA. The 4% rule guides withdrawal rates. Social Security supplements retirement income. Start early to maximize compound growth."""),
        ("finance_008", "Understanding Credit Scores", "Beginner", 10, """Credit scores (300-850) measure creditworthiness. Factors include payment history (35%), credit utilization (30%), and credit age (15%). Good credit (700+) enables better loan terms. Build credit through timely payments and low utilization."""),
        ("finance_009", "Venture Capital and Startups", "Advanced", 22, """Venture capital funds high-growth startups. Investment stages include seed, Series A/B/C. VCs seek 10x returns to offset failures. Term sheets define investment terms. Exit strategies include IPO or acquisition."""),
        ("finance_010", "ESG Investing Principles", "Intermediate", 17, """ESG investing considers Environmental, Social, and Governance factors. Sustainable investing aligns values with returns. ESG metrics assess corporate responsibility. Impact investing targets measurable social/environmental benefits alongside financial returns."""),
    ]
    
    for lesson_id, title, difficulty, minutes, content in finance_lessons:
        lessons.append(Lesson(
            id=lesson_id,
            title=title,
            content=content,
            field_id="finance",
            field_name="Finance",
            difficulty_level=getattr(DifficultyLevel, difficulty.upper()),
            estimated_minutes=minutes,
            learning_objectives=[f"Understand {title.lower()}", "Apply key concepts", "Make informed decisions"],
            key_concepts=content.split('. ')[:3],
            created_at=datetime.now()
        ))
    
    # ECONOMICS LESSONS (8 lessons)
    econ_lessons = [
        ("econ_001", "Supply and Demand Fundamentals", "Beginner", 15, """Supply and demand determine market prices. Demand curves slope downward (lower price = higher quantity). Supply curves slope upward (higher price = more supply). Equilibrium occurs where curves intersect. Shifts in curves cause price changes."""),
        ("econ_002", "Understanding Inflation and GDP", "Beginner", 18, """Inflation measures price level increases. CPI tracks consumer goods prices. GDP measures total economic output. Real GDP adjusts for inflation. Central banks target 2-3% inflation for economic stability."""),
        ("econ_003", "Monetary Policy Explained", "Intermediate", 20, """Central banks use monetary policy to manage economy. Tools include interest rates, reserve requirements, and quantitative easing. Expansionary policy stimulates growth. Contractionary policy controls inflation. Federal Reserve sets US policy."""),
        ("econ_004", "International Trade Theory", "Intermediate", 19, """International trade benefits nations through comparative advantage. Free trade increases efficiency and consumer choice. Trade barriers include tariffs and quotas. Trade agreements reduce barriers. Balance of trade measures exports minus imports."""),
        ("econ_005", "Labor Markets and Unemployment", "Beginner", 16, """Labor markets match workers with jobs. Unemployment types include frictional, structural, and cyclical. Natural rate is 4-5%. Minimum wage affects employment. Labor force participation measures working-age population employed or seeking work."""),
        ("econ_006", "Fiscal Policy and Government Spending", "Intermediate", 21, """Fiscal policy uses government spending and taxation. Expansionary policy increases spending or cuts taxes. Contractionary policy reduces deficits. Multiplier effect amplifies policy impact. National debt accumulates from deficits."""),
        ("econ_007", "Economic Indicators and Forecasting", "Advanced", 23, """Leading indicators predict economic direction. Coincident indicators reflect current state. Lagging indicators confirm trends. Key indicators include unemployment, consumer confidence, and manufacturing activity. Forecasting uses statistical models."""),
        ("econ_008", "Behavioral Economics Insights", "Advanced", 22, """Behavioral economics studies psychological factors in decisions. Cognitive biases include anchoring, loss aversion, and herd mentality. Nudges influence choices without restricting freedom. Applications include policy design and marketing."""),
    ]
    
    for lesson_id, title, difficulty, minutes, content in econ_lessons:
        lessons.append(Lesson(
            id=lesson_id,
            title=title,
            content=content,
            field_id="economics",
            field_name="Economics",
            difficulty_level=getattr(DifficultyLevel, difficulty.upper()),
            estimated_minutes=minutes,
            learning_objectives=[f"Understand {title.lower()}", "Analyze economic trends", "Apply principles"],
            key_concepts=content.split('. ')[:3],
            created_at=datetime.now()
        ))
    
    # CULTURE LESSONS (6 lessons)
    culture_lessons = [
        ("culture_001", "Understanding Cultural Intelligence", "Beginner", 14, """Cultural intelligence (CQ) is the ability to work effectively across cultures. Components include cognitive (knowledge), physical (behavior), and emotional/motivational aspects. High CQ improves global collaboration and reduces misunderstandings."""),
        ("culture_002", "Social Media's Impact on Society", "Intermediate", 18, """Social media transforms communication and information sharing. Platforms include Facebook, Twitter, Instagram, and TikTok. Effects include increased connectivity, echo chambers, and mental health concerns. Digital literacy is essential."""),
        ("culture_003", "Modern Art Movements", "Beginner", 16, """Modern art breaks traditional conventions. Movements include Impressionism, Cubism, Surrealism, and Abstract Expressionism. Artists like Picasso, Dali, and Pollock pioneered new techniques. Art reflects and shapes cultural values."""),
        ("culture_004", "Global Pop Culture Trends", "Beginner", 12, """Pop culture includes music, film, fashion, and internet memes. K-pop, streaming services, and social media drive global trends. Cultural exchange accelerates through digital platforms. Trends reflect and influence social values."""),
        ("culture_005", "Philosophy of Ethics", "Advanced", 24, """Ethics examines moral principles and right conduct. Major theories include utilitarianism (greatest good), deontology (duty-based), and virtue ethics (character-based). Applied ethics addresses real-world dilemmas in medicine, business, and technology."""),
        ("culture_006", "Language and Communication", "Intermediate", 17, """Language shapes thought and culture. Verbal and non-verbal communication convey meaning. Context, tone, and body language affect interpretation. Effective communication requires active listening, clarity, and cultural awareness."""),
    ]
    
    for lesson_id, title, difficulty, minutes, content in culture_lessons:
        lessons.append(Lesson(
            id=lesson_id,
            title=title,
            content=content,
            field_id="culture",
            field_name="Culture",
            difficulty_level=getattr(DifficultyLevel, difficulty.upper()),
            estimated_minutes=minutes,
            learning_objectives=[f"Understand {title.lower()}", "Appreciate diversity", "Apply insights"],
            key_concepts=content.split('. ')[:3],
            created_at=datetime.now()
        ))
    
    # INFLUENCE LESSONS (6 lessons)
    influence_lessons = [
        ("influence_001", "Principles of Persuasion", "Beginner", 15, """Robert Cialdini identified six principles: reciprocity, commitment, social proof, authority, liking, and scarcity. These psychological triggers influence decisions. Ethical persuasion builds trust and long-term relationships."""),
        ("influence_002", "Effective Public Speaking", "Intermediate", 19, """Public speaking requires preparation, structure, and delivery. Key elements include strong openings, clear messages, and memorable conclusions. Body language, voice modulation, and eye contact enhance impact. Practice builds confidence."""),
        ("influence_003", "Negotiation Strategies", "Intermediate", 21, """Effective negotiation seeks win-win outcomes. Preparation includes understanding interests, BATNA (Best Alternative), and leverage. Active listening and empathy build rapport. Tactics include anchoring, framing, and creating value."""),
        ("influence_004", "Leadership and Team Building", "Advanced", 23, """Leadership inspires and guides teams toward goals. Styles include transformational, servant, and situational leadership. Effective leaders communicate vision, empower others, and foster collaboration. Team building requires trust and psychological safety."""),
        ("influence_005", "Emotional Intelligence", "Intermediate", 18, """Emotional intelligence includes self-awareness, self-regulation, motivation, empathy, and social skills. High EQ improves relationships and decision-making. Developing EQ requires reflection, feedback, and practice."""),
        ("influence_006", "Conflict Resolution Skills", "Beginner", 16, """Conflict resolution addresses disagreements constructively. Approaches include collaboration, compromise, and mediation. Active listening, empathy, and focusing on interests (not positions) facilitate resolution. Prevention through clear communication is ideal."""),
    ]
    
    for lesson_id, title, difficulty, minutes, content in influence_lessons:
        lessons.append(Lesson(
            id=lesson_id,
            title=title,
            content=content,
            field_id="influence",
            field_name="Influence",
            difficulty_level=getattr(DifficultyLevel, difficulty.upper()),
            estimated_minutes=minutes,
            learning_objectives=[f"Master {title.lower()}", "Influence effectively", "Build relationships"],
            key_concepts=content.split('. ')[:3],
            created_at=datetime.now()
        ))
    
    # GLOBAL EVENTS LESSONS (8 lessons)
    global_lessons = [
        ("global_001", "Understanding Geopolitics", "Intermediate", 20, """Geopolitics examines how geography influences politics and international relations. Key factors include natural resources, strategic locations, and regional power dynamics. Major powers compete for influence through diplomacy, economics, and military presence."""),
        ("global_002", "Climate Change and Policy", "Beginner", 17, """Climate change results from greenhouse gas emissions. Effects include rising temperatures, extreme weather, and sea level rise. International agreements like Paris Accord set emission targets. Solutions include renewable energy and carbon pricing."""),
        ("global_003", "Global Health Challenges", "Intermediate", 19, """Global health addresses diseases, healthcare access, and health equity. Challenges include pandemics, antimicrobial resistance, and non-communicable diseases. WHO coordinates international response. Solutions require cooperation and investment."""),
        ("global_004", "International Organizations", "Beginner", 15, """International organizations facilitate global cooperation. UN addresses peace and security. IMF and World Bank support economic development. WTO regulates trade. NATO provides collective defense. NGOs address humanitarian needs."""),
        ("global_005", "Migration and Refugees", "Intermediate", 21, """Migration involves moving across borders for work, safety, or opportunity. Refugees flee persecution or conflict. Push factors include poverty and violence. Pull factors include economic opportunity. Integration challenges require policy solutions."""),
        ("global_006", "Cybersecurity and Warfare", "Advanced", 24, """Cyber warfare uses digital attacks against nations. Threats include espionage, infrastructure disruption, and disinformation. Attribution is challenging. International norms are developing. Defense requires cooperation between government and private sector."""),
        ("global_007", "Energy Transition and Sustainability", "Intermediate", 18, """Energy transition shifts from fossil fuels to renewables. Technologies include solar, wind, and batteries. Challenges include intermittency, storage, and infrastructure. Geopolitical implications affect oil-dependent economies."""),
        ("global_008", "Democracy and Authoritarianism", "Advanced", 22, """Political systems range from democracy to authoritarianism. Democracies feature elections, rights, and rule of law. Authoritarian regimes concentrate power. Hybrid systems combine elements. Democratic backsliding threatens freedoms globally."""),
    ]
    
    for lesson_id, title, difficulty, minutes, content in global_lessons:
        lessons.append(Lesson(
            id=lesson_id,
            title=title,
            content=content,
            field_id="global",
            field_name="Global Events",
            difficulty_level=getattr(DifficultyLevel, difficulty.upper()),
            estimated_minutes=minutes,
            learning_objectives=[f"Understand {title.lower()}", "Analyze global trends", "Think critically"],
            key_concepts=content.split('. ')[:3],
            created_at=datetime.now()
        ))
    
    return lessons

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
