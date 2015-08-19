#!/bin/bash
set -e

reponame=$1
repourl=$2
branch=$3
workdir=$4

dest="$workdir/$reponame"

# Clone the repository if it doesn't exist at $dest
if [ ! -d $dest ]; then
    git clone $repourl $dest
fi

# Fetch a clean copy of the repo
cd $dest
git fetch origin
git reset --hard origin/$branch

# Run Jekyll
cd $dest
jekyll build
