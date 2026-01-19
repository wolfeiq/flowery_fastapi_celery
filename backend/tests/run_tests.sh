#!/bin/bash

# Test runner script for FastAPI + Celery backend

set -e

echo "🧪 Running Backend Tests..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Install test dependencies
echo -e "${YELLOW}📦 Installing test dependencies...${NC}"
pip install -r requirements-test.txt

# Run different test suites
run_tests() {
    case "$1" in
        "all")
            echo -e "${GREEN}Running all tests...${NC}"
            pytest
            ;;
        "unit")
            echo -e "${GREEN}Running unit tests...${NC}"
            pytest -m unit
            ;;
        "integration")
            echo -e "${GREEN}Running integration tests...${NC}"
            pytest -m integration
            ;;
        "celery")
            echo -e "${GREEN}Running Celery task tests...${NC}"
            pytest -m celery
            ;;
        "coverage")
            echo -e "${GREEN}Running tests with coverage report...${NC}"
            pytest --cov=app --cov-report=html --cov-report=term
            echo -e "${GREEN}Coverage report generated in htmlcov/index.html${NC}"
            ;;
        "fast")
            echo -e "${GREEN}Running fast tests only...${NC}"
            pytest -m "not slow"
            ;;
        "auth")
            echo -e "${GREEN}Running authentication tests...${NC}"
            pytest tests/test_auth.py -v
            ;;
        "memories")
            echo -e "${GREEN}Running memory tests...${NC}"
            pytest tests/test_memories.py -v
            ;;
        "query")
            echo -e "${GREEN}Running query tests...${NC}"
            pytest tests/test_query.py -v
            ;;
        "validation")
            echo -e "${GREEN}Running validation tests...${NC}"
            pytest tests/test_validation.py -v
            ;;
        *)
            echo -e "${RED}Unknown test suite: $1${NC}"
            echo "Available options: all, unit, integration, celery, coverage, fast, auth, memories, query, validation"
            exit 1
            ;;
    esac
}

# Run the specified test suite or all tests by default
TEST_SUITE=${1:-all}
run_tests "$TEST_SUITE"

echo -e "${GREEN}✅ Tests completed!${NC}"