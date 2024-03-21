#!/bin/bash

# Run the build script
npm run build

# Optionally, copy the dist folder to a specific location
cp -R dist policy-synth/
