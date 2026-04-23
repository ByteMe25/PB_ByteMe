# app.py fa da controller: deve ricevere la richiesta dal frontend, coordinare gli altri componenti
# e restituire una risposta. Non sa come si parla con un'API esterna o qual è l'URL specifico (Separation of Concerns)

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from src.model_strategies import get_model
from src.operation_mapper import OPERATION_MAPPER, DEFAULT_OPERATION
from src.utils.text_cleaning import clean_ai_response
import traceback

app = Flask(__name__)
CORS(app, supports_credentials=True) # Permette al frontend di parlare con il backend

@app.route('/api/ai/generate', methods=['POST'])
def generate_ai_text():
    """
    Endpoint principale: riceve il testo, sceglie la strategia dal Mapper,
    interroga l'IA e pulisce la risposta.
    """
    data = request.json
    text = data.get('text', '')
    prompt = data.get('prompt', '')
    operation = data.get('operation', DEFAULT_OPERATION)

    if operation == 'distant_writing':
        if not prompt:
            return jsonify({"message": "❌ Nessun prompt fornito."}), 400
    else:
        if not text:
            return jsonify({"message": "❌ Nessun testo fornito."}), 400

    # Recupera la configurazione (modello + prompt) dal Mapper
    config = OPERATION_MAPPER.get(operation) or OPERATION_MAPPER[DEFAULT_OPERATION]

    try:
        # Ottiene l'istanza del modello e costruisce i prompt
        model = get_model(config.model_class)
        system_prompt, user_prompt = config.prompt_strategy.build(text, prompt)
        
        # Recupera la temperatura specifica della strategia (es. 0.8 per il Cappello Verde)
        temp = config.prompt_strategy.temperature

        # Chiama l'IA (Llama o Gemma)
        raw_response = model.generate(system_prompt, user_prompt, temperature=temp)

        # Pulisce il testo (rimuove "Ecco il riassunto:", ecc.)
        final_text = clean_ai_response(raw_response)

        return jsonify({"generated_text": final_text})

    except Exception as e:
        # Log dell'errore sul terminale per debugging
        print(f"❌ Errore durante la generazione:\n{traceback.format_exc()}")
        return jsonify({"message": f"❌ Errore critico:\n{str(e)}"}), 500

@app.route('/')
def root():
    """Endpoint di controllo per verificare se il server è attivo."""
    return jsonify({
        "service": "Second Brain Backend",
        "status": "running",
        "active_operations": list(OPERATION_MAPPER.keys())
    })

if __name__ == "__main__":
    # Usa la porta 8000 (o quella definita nell'ambiente)
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port, debug=True)