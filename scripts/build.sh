#!/bin/bash
set -e

reponame=$1
repourl=$2
repokey=$3
branch=$4
workdir=$5

dest="$workdir/$reponame"

do_git()
{
    command=$1

    if [ -z $repokey ]; then
        $command
    else
        ssh-agent sh -c "ssh-add $repokey; $command"
    fi
}

# Clone the repository if it doesn't exist at $dest
if [ ! -d $dest ]; then
    do_git "git clone $repourl $dest"
fi

# Fetch a clean copy of the repo
cd $dest
do_git "git fetch origin"
do_git "git reset --hard origin/$branch"

# Run Jekyll
cd $dest
jekyll build
