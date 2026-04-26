# Second Brain - Gruppo ByteMe

**Second Brain** è un'applicazione web avanzata per la gestione di note e documenti in formato **Markdown**, potenziata da funzionalità di Intelligenza Artificiale. Il sistema permette di scrivere, editare e analizzare testi utilizzando modelli linguistici (LLM) per operazioni come riassunti, traduzioni e analisi cognitive basate sul metodo dei "Sei Cappelli per Pensare" di Edward de Bono.

Progetto sviluppato per il corso di **Ingegneria del Software** 2025/2026 - Università degli Studi di Padova.

## 🚀 Funzionalità principali

- **Editor Markdown professionale**: Basato su EasyMDE, con supporto per preview in tempo reale e salvataggio automatico.
- **AI operations**: Integrazione con modelli Llama 3.2 e Gemma 3 per l'elaborazione del testo.
- **Gestione documenti**: Caricamento di file locali (.md, .txt) ed esportazione in diversi formati.
- **Storico delle generazioni**: Cronologia locale persistente di tutte le interazioni con l'IA.
- **Architettura stateless**: Massima privacy e scalabilità grazie all'uso del LocalStorage per la persistenza dei dati lato client.

---

## 🛠 Requisiti tecnici

Assicurati di avere installato sul tuo sistema:
- **Docker**: [Scarica Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Docker Compose**: (Solitamente incluso in Docker Desktop)
- **Git**: Per la gestione della repository.

---

## 📦 Installazione e avvio

Segui questi passaggi per configurare l'ambiente ed eseguire l'applicazione tramite containerizzazione.

### 1. Clonazione della repository
```bash
git clone [https://github.com/vostro-account/pb_byteme.git](https://github.com/vostro-account/pb_byteme.git)
cd pb_byteme
```

### 2. Configurazione delle variabili d'ambiente
L'applicazione richiede l'accesso a un provider LLM. È necessario creare un file .env nella cartella radice del progetto per configurare le chiavi API:
```bash
cp .env.example .env
```
Apri il file .env e inserisci i parametri corretti:
```bash
OPENAI_API_KEY=la_tua_chiave_api
OPENAI_BASE_URL=url_del_provider_llm
FLASK_SECRET_KEY=una_stringa_casuale_per_le_sessioni
```

### 3. Avvio con Docker Compose
Builda le immagini e avvia i container con un unico comando:
```bash
docker-compose up --build
```

Al termine della procedura, i servizi saranno disponibili ai seguenti indirizzi:
- Frontend (Interfaccia Utente): http://localhost:8080
- Backend (API REST): http://localhost:8000

---

## 🏗 Architettura del Sistema

Il sistema è stato progettato seguendo standard architetturali rigorosi:

### Backend (Python/Flask)
- Layered Architecture: Suddivisione in Presentation, Application, Business e Persistence Logic.
- Design Patterns: Implementazione dei pattern Strategy e Registry (via operation_mapper) per gestire in modo estensibile prompt e modelli.

### Frontend (React/TypeScript)
- MVVM (Model-View-ViewModel): Separazione netta tra UI e logica applicativa tramite Custom Hooks.
- Render-Delegate State Pattern: Gestione polimorfica del widget AI tramite una macchina a stati implementata con Zustand.
- Facade Pattern: Astrazione della logica di rete e delle chiamate API.

---

## 🛠 Comandi e manutenzione

### Gestione container
- Arrestare i servizi: ` docker-compose down `
- Visualizzare i log in tempo reale: ` docker-compose logs -f `
- Ripulire i volumi e le immagini: ` docker system prune -a `


### Test unitari e integrazione
Per eseguire i test in locale (senza Docker):
- Frontend
```bash
cd frontend
npm install
npm test
```
- Backend
```bash
cd backend
pip install -r requirements.txt
pytest
```

---

## 👥 Gruppo ByteMe

<div align="center">

|Membro|Matricola|
|---|---|
Matteo Cuogo | 2111013
Joseph Grant | 1224441
Chiara Grossele | 2101063
Elisa Marchioro | 2111941
Giulia Barzon | 2101074
Tommaso Tombacco | 2076447

</div>

<h2 align="center">Contatti:</h2>
<p align="center">Email: <a href="mailto:7last.swe@gmail.com"><em>byteme2025swe@gmail.com</em></a></p>
<p align="center">Sito: <a href="https://byteme25.github.io/ByteMe/"><em>https://byteme25.github.io/ByteMe/</em></a></p>

