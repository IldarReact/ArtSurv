#!/bin/bash

# Get the current branch name
local_branch_name="$(git rev-parse --abbrev-ref HEAD)"

# Define the regex for valid branch names
valid_branch_regex="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|release|hotfix|clean)\/.*$"

# Check if the branch name is valid
if [[ ! $local_branch_name =~ $valid_branch_regex ]]; then
    # Special cases like main, master, develop
    if [[ $local_branch_name == "main" || $local_branch_name == "master" || $local_branch_name == "develop" || $local_branch_name == "clean-history" ]]; then
        exit 0
    fi
    
    echo "Error: Invalid branch name '$local_branch_name'."
    echo "Branch names must follow the pattern: prefix/branch-name"
    echo "Allowed prefixes: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, release, hotfix, clean"
    exit 1
fi

exit 0
