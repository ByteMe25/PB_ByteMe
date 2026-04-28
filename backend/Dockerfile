FROM python:3.12-slim
# importa un'immagine lightweight (slim) di python già pronta all'uso

WORKDIR /app
# cartella di lavoro di default

# Installa le dipendenze
# copia il file dalla sottocartella locale backend/
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia l'intero progetto per mantenere la struttura /app/backend/src/...
COPY . .

# Configurazione ambiente
ENV PYTHONPATH="/app/backend"
EXPOSE 8000

# Comando di avvio (percorso corretto relativo a WORKDIR)
CMD ["python", "/app/backend/src/app.py"]