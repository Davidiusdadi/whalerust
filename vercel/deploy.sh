#!/bin/bash

set -e # exit on error
cd -- "$(dirname "$0")"
rm -r ./public || echo "nothing to clean"
cp -r ../public ./public  # assumes the whole project has been build successfully already
vercel "$@"
