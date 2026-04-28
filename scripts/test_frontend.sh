#!/bin/bash
# per attivare script frontend, dalla cartella del progetto: chmod +x scripts/test_frontend.sh

echo "========================================="
echo " Avvio Test Unitari Frontend (React) "
echo "========================================="

# Si sposta nella cartella frontend (calcolando il percorso relativo dallo script)
cd "$(dirname "$0")/../frontend" || exit 1

# Esegue i test in modalità "singola esecuzione"
npm run test:run

# Cattura l'esito del comando precedente
if [ $? -eq 0 ]; then
    echo "========================================="
    echo "✅ SUCCESS: Tutti i test del frontend sono passati!"
    echo "========================================="
    exit 0
else
    echo "========================================="
    echo "❌ ERROR: Alcuni test hanno fallito. Controlla l'output sopra."
    echo "========================================="
    exit 1
fi