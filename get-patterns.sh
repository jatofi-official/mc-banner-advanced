#!/bin/bash

# Navigate to the vanilla folder (adjust path if needed)
cd patterns/mmb/

# 1. List all .png files
# 2. Remove the .png extension
# 3. Wrap in quotes and add commas
# 4. Remove 'none' if it exists (since we manually add it in JS)
# 5. Join into a single line

patterns=$(ls *.png | sed 's/\.png//' | grep -v "none" | sed 's/.*/"&"/' | paste -sd "," -)

echo "Copy this into your script.js:"
echo "const patterns = ['none', $patterns];"
