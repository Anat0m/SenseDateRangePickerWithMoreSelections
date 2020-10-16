#!/bin/bash
set -o errexit

echo "$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')"

# Usage
# $ get-bumped-version.sh

