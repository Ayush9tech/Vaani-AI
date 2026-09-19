#!/bin/bash
COOKIE_FILE="cookie.txt"
CSRF_JSON=$(curl -s -c $COOKIE_FILE http://localhost:3000/api/auth/csrf)
CSRF_TOKEN=$(echo $CSRF_JSON | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
curl -i -X POST -b $COOKIE_FILE -d "csrfToken=$CSRF_TOKEN" http://localhost:3000/api/auth/signin/google
