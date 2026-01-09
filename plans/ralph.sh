set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <iterations>"
    exit 1
fi

for ((i = 0; i < $1; i++)); do
    echo "Iteration $i"
    # Stream claude output to stderr in real-time while capturing stdout
    # This allows you to see the output as it happens
    result=$(claude --dangerously-skip-permissions "$(cat ./plans/prompt.md)" | tee /dev/stderr)

    if [[ $result == *"<promise>COMPLETE</promise>"* ]]; then
        echo "PRD is complete"
        exit 0
    fi
done

