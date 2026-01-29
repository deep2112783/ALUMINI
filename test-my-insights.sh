#!/bin/bash

echo "========================================="
echo "Testing Alumni My Insights Feature"
echo "========================================="

# Login as alumni
echo -e "\n1. Login as alumni..."
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun.mehta@rguktrkv.ac.in","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✓ Login successful"

# Test getting alumni's own insights
echo -e "\n2. Testing GET /alumni/my-insights..."
MY_INSIGHTS=$(curl -s -X GET http://localhost:4000/api/alumni/my-insights \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $MY_INSIGHTS" | head -c 200
echo ""

if echo "$MY_INSIGHTS" | grep -q '\['; then
  INSIGHT_COUNT=$(echo "$MY_INSIGHTS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
  echo "✓ Found $INSIGHT_COUNT insights"
  
  # Show summary
  echo "$MY_INSIGHTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('\nYour Insights Summary:')
print('-' * 50)
for i, insight in enumerate(data[:3], 1):
    print(f'{i}. {insight[\"title\"][:50]}...')
    print(f'   Comments: {insight.get(\"comment_count\", 0)} | Likes: {insight.get(\"like_count\", 0)}')
    print()
" 2>/dev/null || echo "Could not parse insights"

else
  echo "❌ Failed to get insights"
fi

echo -e "\n========================================="
echo "How Alumni Can View Their Insights:"
echo "========================================="
echo "1. Login as alumni: arjun.mehta@rguktrkv.ac.in"
echo "2. Click 'My Insights' in the sidebar"
echo "3. View all your posted insights with:"
echo "   - Total likes count"
echo "   - Total comments count"
echo "   - Click 'comments' to expand and view"
echo "   - Delete insights if needed"
echo ""
