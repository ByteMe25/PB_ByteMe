#main directory for backend

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from model_strategies import get_model
from operation_registry import OPERATION_REGISTRY, DEFAULT_OPERATION

app = Flask(__name__)
CORS(app, supports_credentials=True) # Permette al frontend di parlare con il backend

app.secret_key = os.getenv("FLASK_SECRET_KEY", "supersecretkey") # Sempre diversa


@app.route('/api/ai/generate', methods=['POST'])
def generate_ai_text():
    """Genera contenuto AI basato su testo, operazione e modello scelto."""
    
    # 1. Recupero dati dalla richiesta frontend 
    data = request.json
    text = data.get('text', '')
    operation = data.get('operation', DEFAULT_OPERATION)
    
    if not text:
        return jsonify({"generated_text": "❌ Nessun testo fornito."}), 400

    config = OPERATION_REGISTRY.get(operation) or OPERATION_REGISTRY[DEFAULT_OPERATION]
    
    print(
    f"🤖 Motore AI: {type(config.model_class).__name__} | "
    f"Modello: {getattr(config.model_class, 'model', 'N/A')} | "
    f"Operazione: {operation}"
    )
    try:
        # 2. PATTERN STRATEGY (CONTENUTO): Costruisci i prompt
        system_prompt, user_prompt = config.prompt_strategy.build(text)
        model = get_model(config.model_class)
        # 3. PATTERN STRATEGY (MODELLO): Esegui la chiamata
        print(f"🤖 Uso il motore: {type(model).__name__} per operazione: {operation}")
        result = model.generate(system_prompt, user_prompt)
        # 4. Pulizia e invio
        result = clean_ai_response(result)
        return jsonify({"generated_text": result}), 200

    except Exception as e:
        import traceback
        print("❌ Errore durante la generazione:")
        traceback.print_exc()
        return jsonify({
            "generated_text": f"❌ Errore critico:\n{str(e)}"
        }), 500

# funzione per rimuovere frasi introduttive AI
def clean_ai_response(text):
    """Rimuove frasi introduttive tipiche delle risposte AI."""
    import re
    
    # possibili pattern ricorrenti da rimuovere (case-insensitive)
    patterns_to_remove = [
        r'^Ecco\s+(un|il|la|i)\s+\w+.*?:\s*',  # "Ecco un riassunto:", "Ecco la traduzione:", ecc.
        r'^Ecco\s+.*?:\s*',                    # "Ecco quanto richiesto:"
        r'^Il\s+riassunto\s+è:\s*',            # "Il riassunto è:"
        r'^La\s+traduzione\s+è:\s*',           # "La traduzione è:"
        r'^Riassunto:\s*',                     # "Riassunto:"
        r'^Traduzione:\s*',                    # "Traduzione:"
        r'^Ecco\s+come\s+.*?:\s*',             # "Ecco come potrei..."
        r'^Di seguito\s+.*?:\s*',              # "Di seguito il testo..."
        r'^Certamente[,!]?\s+',                # "Certamente, ..."
        r'^Certo[,!]?\s+',                     # "Certo, ..."
    ]
    
    cleaned = text
    
    for pattern in patterns_to_remove:
        #rimuove il pattern all'inizio del testo
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    
    #rimuove spazi bianchi iniziali/finali e linee vuote iniziali
    cleaned = cleaned.strip()
    
    #se il testo inizia con una nuova riga la rimuove
    while cleaned.startswith('\n'):
        cleaned = cleaned[1:]
    
    return cleaned
    

# ROOT ENDPOINT
@app.route('/')
def root():
    return jsonify({
        #Info api Zucchetti
        "service": "Second Brain - Backend Flask",
        "ai_configured": bool(ai_client),
        "model": ZUCCHETTI_MODEL if ai_client else None,
        "base_url": OPENAI_BASE_URL if ai_client else None
    })


# AVVIO SERVER
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 ByteMe Second Brain - Backend Flask")
    print("=" * 60)
    app.run(host='0.0.0.0', port=8000, debug=True)