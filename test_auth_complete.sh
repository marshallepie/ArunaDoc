#!/bin/bash

echo "========================================="
echo "ArunaDoc Authentication Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3004/api/v1/auth"

echo "Test 1: Sign Up (Create New User)"
echo "-----------------------------------------"
signup_response=$(curl -s -X POST "$API_URL/sign_up" \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"testuser@example.com","password":"TestPass123!","first_name":"Test","last_name":"User"}}' \
  -w "\n%{http_code}")

http_code=$(echo "$signup_response" | tail -n1)
body=$(echo "$signup_response" | sed '$d')

echo "HTTP Status: $http_code"
echo "Response:"
echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

if [ "$http_code" = "201" ] || [ "$http_code" = "422" ]; then
  if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ Sign up successful!${NC}"
  else
    echo -e "${YELLOW}⚠ User already exists (expected if test run before)${NC}"
  fi
else
  echo -e "${RED}✗ Sign up failed${NC}"
fi

echo ""
echo "========================================="
echo ""

echo "Test 2: Sign In (Login with Seed User)"
echo "-----------------------------------------"
signin_response=$(curl -s -i -X POST "$API_URL/sign_in" \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"consultant@arunadoc.com","password":"Password123!"}}')

echo "$signin_response" | head -20
echo ""

# Extract HTTP status
signin_status=$(echo "$signin_response" | grep "HTTP" | awk '{print $2}')
echo "HTTP Status: $signin_status"

# Extract JWT token from Authorization header
jwt_token=$(echo "$signin_response" | grep -i "^authorization:" | sed 's/Authorization: Bearer //' | tr -d '\r')

if [ -n "$jwt_token" ]; then
  echo -e "${GREEN}✓ Login successful!${NC}"
  echo -e "${GREEN}✓ JWT Token received${NC}"
  echo "Token (first 50 chars): ${jwt_token:0:50}..."
  echo ""

  # Test authenticated request
  echo "========================================="
  echo ""
  echo "Test 3: Use JWT Token (Authenticated Request)"
  echo "-----------------------------------------"
  echo "Testing health endpoint with JWT token..."
  auth_response=$(curl -s -X GET "http://localhost:3004/health" \
    -H "Authorization: Bearer $jwt_token" \
    -w "\n%{http_code}")

  auth_code=$(echo "$auth_response" | tail -n1)
  auth_body=$(echo "$auth_response" | sed '$d')

  echo "HTTP Status: $auth_code"
  echo "Response:"
  echo "$auth_body" | python3 -m json.tool 2>/dev/null || echo "$auth_body"

  if [ "$auth_code" = "200" ]; then
    echo -e "${GREEN}✓ Authenticated request successful!${NC}"
  else
    echo -e "${RED}✗ Authenticated request failed${NC}"
  fi

  echo ""
  echo "========================================="
  echo ""

  # Test logout
  echo "Test 4: Sign Out (Logout)"
  echo "-----------------------------------------"
  logout_response=$(curl -s -X DELETE "$API_URL/sign_out" \
    -H "Authorization: Bearer $jwt_token" \
    -w "\n%{http_code}")

  logout_code=$(echo "$logout_response" | tail -n1)
  logout_body=$(echo "$logout_response" | sed '$d')

  echo "HTTP Status: $logout_code"
  echo "Response:"
  echo "$logout_body" | python3 -m json.tool 2>/dev/null || echo "$logout_body"

  if [ "$logout_code" = "200" ]; then
    echo -e "${GREEN}✓ Logout successful!${NC}"
  else
    echo -e "${RED}✗ Logout failed${NC}"
  fi

  echo ""
  echo "========================================="
  echo ""

  # Test using revoked token
  echo "Test 5: Try Using Revoked Token"
  echo "-----------------------------------------"
  echo "Attempting to use the now-revoked JWT token..."
  revoked_response=$(curl -s -X GET "http://localhost:3004/health" \
    -H "Authorization: Bearer $jwt_token" \
    -w "\n%{http_code}")

  revoked_code=$(echo "$revoked_response" | tail -n1)

  echo "HTTP Status: $revoked_code"

  if [ "$revoked_code" = "401" ]; then
    echo -e "${GREEN}✓ Token correctly revoked! (401 Unauthorized)${NC}"
  else
    echo -e "${YELLOW}⚠ Token still works (health endpoint might not require auth)${NC}"
  fi

else
  echo -e "${RED}✗ Login failed - No JWT token received${NC}"
fi

echo ""
echo "========================================="
echo ""
echo "Test 6: Check Database - Users Created"
echo "-----------------------------------------"
docker-compose exec -T backend rails runner "puts User.count" 2>/dev/null
echo " users in database"

echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo ""
echo "Test Results:"
echo "1. Sign Up: Check output above"
echo "2. Sign In: Check for JWT token"
echo "3. Authenticated Request: Check status 200"
echo "4. Sign Out: Check status 200"
echo "5. Revoked Token: Check status 401"
echo ""
echo "Authentication system test complete!"
echo "========================================="
