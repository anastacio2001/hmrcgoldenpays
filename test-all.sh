#!/bin/bash

# GOLDENPAYS LTD - Local Testing Script
# This script tests all API endpoints and functionalities

echo "🧪 GOLDENPAYS LTD - Testing All Functionalities"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:3000"

# Test counter
PASS=0
FAIL=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=${4:-}
    
    echo -n "Testing $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    fi
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAIL++))
    fi
}

# Test 1: Health Check
echo -e "${YELLOW}━━━ Backend Health Check ━━━${NC}"
test_endpoint "Health Check" "$API_URL/health"
echo ""

# Test 2: Contact Form
echo -e "${YELLOW}━━━ Contact Form API ━━━${NC}"
contact_data='{
  "name": "Test User",
  "company": "Test Company Ltd",
  "email": "test@example.com",
  "service": "Infrastructure Audit",
  "message": "This is a test inquiry to validate the contact form functionality."
}'
test_endpoint "Contact Form Submission" "$API_URL/api/contact/submit" "POST" "$contact_data"
echo ""

# Test 3: Authentication
echo -e "${YELLOW}━━━ Authentication API ━━━${NC}"
login_data='{
  "email": "admin@goldenpays.uk",
  "password": "GoldenPays2026!"
}'

echo -n "Testing Admin Login... "
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$login_data" \
    "$API_URL/api/auth/login")

if echo "$login_response" | grep -q "token"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASS++))
    TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "  Token received: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAIL++))
fi
echo ""

# Test 4: Admin Endpoints (with authentication)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}━━━ Admin API (Protected Routes) ━━━${NC}"
    
    echo -n "Testing Get Inquiries... "
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL/api/admin/inquiries")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAIL++))
    fi
    
    echo -n "Testing Get Stats... "
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL/api/admin/stats")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAIL++))
    fi
    
    echo -n "Testing Get Clients... "
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL/api/admin/clients")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAIL++))
    fi
    
    echo -n "Testing Get Projects... "
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL/api/admin/projects")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAIL++))
    fi
    echo ""
fi

# Test 5: Frontend Pages
echo -e "${YELLOW}━━━ Frontend Pages ━━━${NC}"
test_endpoint "Homepage" "$FRONTEND_URL/"
test_endpoint "About Page" "$FRONTEND_URL/#/about"
test_endpoint "Services Page" "$FRONTEND_URL/#/services"
test_endpoint "Contact Page" "$FRONTEND_URL/#/contact"
test_endpoint "Terms & Conditions" "$FRONTEND_URL/#/legal/terms"
test_endpoint "Privacy Policy" "$FRONTEND_URL/#/legal/privacy"
test_endpoint "Professional Disclaimer" "$FRONTEND_URL/#/legal/disclaimer"
echo ""

# Test 6: Security Headers
echo -e "${YELLOW}━━━ Security Headers Check ━━━${NC}"
echo -n "Checking CORS headers... "
cors_header=$(curl -s -I "$API_URL/health" | grep -i "access-control-allow-origin")
if [ ! -z "$cors_header" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAIL++))
fi
echo ""

# Final Summary
echo "================================================"
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo "================================================"
echo -e "Total Tests: $((PASS + FAIL))"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🎉 GOLDENPAYS Platform is fully functional!"
    echo ""
    echo "Access the application:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5001"
    echo "  Admin:    http://localhost:3000/#/admin/login"
    echo ""
    echo "Admin Credentials:"
    echo "  Email:    admin@goldenpays.uk"
    echo "  Password: GoldenPays2026!"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please check the errors above and ensure:"
    echo "  1. Backend is running on port 5001"
    echo "  2. Frontend is running on port 3000"
    echo "  3. All dependencies are installed"
    exit 1
fi
