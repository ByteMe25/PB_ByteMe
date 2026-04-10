#!/bin/bash
echo "Esecuzione test backend prima del push..."

cd "$(git rev-parse --show-toplevel)/backend/src" || exit 1

python3 -m pytest . -v --tb=short

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Test falliti. Push bloccato."
    echo "   Correggi gli errori prima di pushare."
    exit 1
fi

echo "✅ Tutti i test passati. Push consentito."
exit 0