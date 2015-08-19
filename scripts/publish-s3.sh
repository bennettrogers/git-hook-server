#!/bin/bash
set -e

reponame=$1
workdir=$2
bucket=$3

dest="$workdir/$reponame"

# s3cmd sync
s3cmd sync --acl-public --delete-removed --no-mime-magic "$dest/_site/" s3://$bucket
