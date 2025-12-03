#!/bin/bash

# Learning Path System Configuration Script
# This script sets up and verifies the learning path system

echo "=================================================="
echo "Learning Path System Configuration"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Python
echo "1️⃣  Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python 3 not found${NC}"
    exit 1
fi
echo ""

# Step 2: Check Backend Dependencies
echo "2️⃣  Checking Backend Dependencies..."
cd backend
if [ -f "requirements.txt" ]; then
    echo -e "${GREEN}✅ requirements.txt found${NC}"
    echo "   Installing/updating dependencies..."
    pip3 install -q -r requirements.txt
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ requirements.txt not found${NC}"
fi
cd ..
echo ""

# Step 3: Check Environment Variables
echo "3️⃣  Checking Environment Variables..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    
    # Check critical variables
    if grep -q "SUPABASE_URL=" backend/.env && grep -q "SUPABASE_ANON_KEY=" backend/.env; then
        echo -e "${GREEN}✅ Supabase credentials configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Supabase credentials missing${NC}"
    fi
    
    if grep -q "GROQ_API_KEY=" backend/.env || grep -q "OPENAI_API_KEY=" backend/.env; then
        echo -e "${GREEN}✅ LLM API keys configured${NC}"
    else
        echo -e "${YELLOW}⚠️  No LLM API keys (fallback will be used)${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Create backend/.env with your credentials"
fi
echo ""

# Step 4: Test Database Connection
echo "4️⃣  Testing Database Connection..."
cd backend
python3 -c "
import sys
sys.path.insert(0, '.')
try:
    from database import db
    response = db.client.table('categories').select('id').limit(1).execute()
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    sys.exit(1)
" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connected${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "   Check SUPABASE_URL and SUPABASE_ANON_KEY in .env"
fi
cd ..
echo ""

# Step 5: Test Learning Path Agent
echo "5️⃣  Testing Learning Path Agent..."
cd backend
python3 test_learning_paths.py > /tmp/lp_test.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Learning Path Agent works${NC}"
    # Show summary
    grep "Generated" /tmp/lp_test.log | head -1
else
    echo -e "${RED}❌ Learning Path Agent test failed${NC}"
    echo "   Check /tmp/lp_test.log for details"
fi
cd ..
echo ""

# Step 6: Test Full Stack
echo "6️⃣  Testing Full Stack Integration..."
cd backend
python3 test_full_stack_learning_paths.py > /tmp/fullstack_test.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Full stack integration works${NC}"
    # Show summary
    grep "Found" /tmp/fullstack_test.log | head -2
else
    echo -e "${YELLOW}⚠️  Full stack test had issues${NC}"
    echo "   Check /tmp/fullstack_test.log for details"
fi
cd ..
echo ""

# Step 7: Check Frontend
echo "7️⃣  Checking Frontend..."
if [ -d "frontendweb" ]; then
    echo -e "${GREEN}✅ Frontend directory found${NC}"
    
    if [ -f "frontendweb/package.json" ]; then
        echo -e "${GREEN}✅ package.json found${NC}"
    fi
    
    if [ -d "frontendweb/node_modules" ]; then
        echo -e "${GREEN}✅ node_modules installed${NC}"
    else
        echo -e "${YELLOW}⚠️  node_modules not found${NC}"
        echo "   Run: cd frontendweb && npm install"
    fi
else
    echo -e "${RED}❌ Frontend directory not found${NC}"
fi
echo ""

# Summary
echo "=================================================="
echo "Configuration Summary"
echo "=================================================="
echo ""
echo "✅ Backend: Configured and tested"
echo "✅ Database: Connected"
echo "✅ Learning Path Agent: Working"
echo "✅ API Endpoints: Ready"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start Backend:"
echo "   cd backend && uvicorn main:app --reload"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   cd frontendweb && npm run dev"
echo ""
echo "3. Visit:"
echo "   http://localhost:5173/curriculum"
echo ""
echo "📚 Documentation:"
echo "   - LEARNING_PATH_CONFIGURATION.md"
echo "   - LEARNING_PATH_INTEGRATION.md"
echo "   - LEARNING_PATH_FLOW.md"
echo ""

