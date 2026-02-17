#!/bin/bash

echo "========================================="
echo "Testing ArunaDoc Authentication"
echo "========================================="
echo ""

echo "1. Testing Sign In (Login)"
echo "-----------------------------------------"
response=$(curl -s -X POST http://localhost:3004/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d "{\"user\":{\"email\":\"consultant@arunadoc.com\",\"password\":\"Password123!\"}}" \
  -w "\nHTTP_CODE:%{http_code}")

http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_code"
echo "Response:"
echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "200" ]; then
  echo "✓ Login successful!"

  # Extract JWT token from response headers (would need -i flag)
  echo ""
  echo "2. Testing Sign In with headers to get JWT"
  echo "-----------------------------------------"
  curl -X POST http://localhost:3004/api/v1/auth/sign_in \
    -H "Content-Type: application/json" \
    -d "{\"user\":{\"email\":\"consultant@arunadoc.com\",\"password\":\"Password123!\"}}" \
    -i 2>&1 | grep -i authorization
else
  echo "✗ Login failed"
fi

echo ""
echo "========================================="
