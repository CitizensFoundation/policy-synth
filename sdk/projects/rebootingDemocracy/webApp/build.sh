#!/bin/bash

# Run the build script
npm run build

# Remove the existing dist folder inside policy-synth if it exists
rm -rf policy-synth/dist

# Optionally, copy the dist folder to a specific location
cp -R dist policy-synth/
