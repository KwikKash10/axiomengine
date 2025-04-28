#!/bin/bash

# Rollback script
COMMIT_HASH="b7662d5fad76a93e6fbff23589528ab5b2a6b560"
TIMESTAMP="Mon Apr 28 07:31:21 2025 +0100"
COMMIT_MESSAGE="Merge: Add LICENSE file"

echo "Starting rollback to commit: $COMMIT_HASH"
echo "Timestamp: $TIMESTAMP"
echo "Commit Message: $COMMIT_MESSAGE"

# Reset to the specified commit
git reset --hard $COMMIT_HASH

# Verify the rollback
CURRENT_COMMIT=$(git rev-parse HEAD)
if [ "$CURRENT_COMMIT" = "$COMMIT_HASH" ]; then
    echo "Successfully rolled back to commit $COMMIT_HASH"
else
    echo "Rollback failed. Current commit: $CURRENT_COMMIT"
    exit 1
fi

# Push the changes
git push -f origin stable-release

echo "Rollback completed successfully" 