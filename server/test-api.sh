#!/bin/bash

echo "Testing Inventory Management API..."
echo "=================================="

echo -e "\n1. Testing Dashboard Metrics:"
curl -s -X GET http://localhost:3001/dashboard | jq

echo -e "\n2. Testing Products:"
curl -s -X GET http://localhost:3001/products | jq

echo -e "\n3. Testing Users:"
curl -s -X GET http://localhost:3001/users | jq

echo -e "\n4. Testing Expenses:"
curl -s -X GET http://localhost:3001/expenses | jq

echo -e "\n5. Testing Product Search:"
curl -s -X GET "http://localhost:3001/products?search=test" | jq

echo -e "\nAPI Testing Complete!"
