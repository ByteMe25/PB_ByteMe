"""
Unit tests per app.py - ByteMe Second Brain Backend
Esegui con: pytest test_app.py -v
"""
 
import pytest
import json
from unittest.mock import patch, MagicMock
from src.app import app

# ---------------------------------------------------------------------------
# FIXTURE: client Flask di test
# ---------------------------------------------------------------------------
@pytest.fixture
def client():
    """
    Crea un client Flask in modalità testing.
    Ogni test riceve un client fresco e isolato.
    """

    from src.app import app
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client
 
def post_generate(client, payload):
    """Shortcut per chiamare POST /api/ai/generate con JSON."""
    return client.post(
        '/api/ai/generate',
        data=json.dumps(payload),
        content_type='application/json'
    )


# ===========================================================================
# 1. Casi di errore input
# ===========================================================================
class TestGenerateInputValidation:
    """Verifica che l'endpoint gestisca correttamente gli input non validi."""
 
    def test_missing_text_returns_400(self, client):
        """
        Se il campo 'text' è assente o vuoto, il backend deve rispondere
        con HTTP 400 e un messaggio di errore nel campo 'generated_text'.
        """
        response = post_generate(client, {"operation": "summary"})
        assert response.status_code == 400
        data = response.get_json()
        assert "generated_text" in data
 
    def test_empty_text_returns_400(self, client):
        """
        Una stringa vuota '' equivale a testo mancante:
        deve restituire 400 come il caso precedente.
        """
        response = post_generate(client, {"text": "", "operation": "summary"})
        assert response.status_code == 400
 
    def test_unknown_operation_falls_back_to_default(self, client):
        """
        Se l'operazione richiesta non esiste nel mapper, il sistema
        deve fare fallback sull'operazione di default ('summary')
        invece di crashare.
        """
        mock_result = "Testo riassunto."
        with patch('src.app.get_model') as mock_get_model:
            mock_model = MagicMock()
            mock_model.generate.return_value = mock_result
            mock_get_model.return_value = mock_model
 
            response = post_generate(client, {
                "text": "Testo qualsiasi",
                "operation": "operazione_inesistente_xyz"
            })
            assert response.status_code == 200


# ===========================================================================
# 2. Flusso normale (happy path)
# ===========================================================================
class TestGenerateOperations:

    @pytest.fixture(autouse=True)
    def load_mapper(self):
        from src.operation_mapper import OPERATION_MAPPER
        self.mapper = OPERATION_MAPPER


    @pytest.mark.parametrize("operation_name", [
        "summary", "fix_grammar", "rewrite", "distant_writing"
    ])
    def test_registered_operation_returns_200(self, client, operation_name):
        mock_result = f"Risultato simulato per {operation_name}"
        with patch('src.app.get_model') as mock_get_model:
            mock_model = MagicMock()
            mock_model.generate.return_value = mock_result
            mock_get_model.return_value = mock_model
            
            payload = {
                "text": "Testo di prova generico.",
                "operation": operation_name
            }
            # Se è distant_writing, aggiunge il prompt obbligatorio - dopo modifica al file app.py
            if operation_name == "distant_writing":
                payload["prompt"] = "Scrivi qualcosa"

            response = post_generate(client, payload)
            assert response.status_code == 200

    def test_operation_defaults_to_summary_when_missing(self, client):
       
        with patch('src.app.get_model') as mock_get_model:
            mock_model = MagicMock()
            mock_model.generate.return_value = "Riassunto automatico."
            mock_get_model.return_value = mock_model
 
            response = post_generate(client, {"text": "Testo senza operazione."})
            assert response.status_code == 200


# ===========================================================================
# 3. Test di clean_ai_response (pulisce frasi introduttive)
# ===========================================================================
class TestCleanAiResponse:
    """
    Testa la funzione clean_ai_response in isolamento.
    """

    @pytest.fixture(autouse=True)
    def import_clean(self):
        from src.utils.text_cleaning import clean_ai_response
        self.clean = clean_ai_response

    @pytest.mark.parametrize("input_text, expected_output", [
        ("Ecco un riassunto: Questo è il testo finale.", "Questo è il testo finale."),
        ("Riassunto: Il testo parla di...", "Il testo parla di..."),
        ("Traduzione: This is the translation.", "This is the translation."),
        ("Certamente, ecco il testo richiesto.", "ecco il testo richiesto."),
        ("Certo! Ecco la risposta.", "Ecco la risposta."),
        ("ECCO UN RIASSUNTO: contenuto.", "contenuto."),
        ("\n\nTesto inizia qui.", "Testo inizia qui."),
        ("   Testo con spazi.   ", "Testo con spazi."),
        ("Il machine learning è una branca.", "Il machine learning è una branca."),
    ])
    def test_clean_logic(self, input_text, expected_output):
        """Verifica che i pattern AI vengano rimossi correttamente."""
        result = self.clean(input_text)
        assert result == expected_output


# ===========================================================================
# 4. Gestione eccezioni interne del modello AI
# ===========================================================================
class TestGenerateErrorHandling:
    """Verifica che gli errori interni siano gestiti senza far crashare il server."""

    def test_model_exception_returns_500(self, client):
        """
        Se il modello AI lancia un'eccezione durante generate(),
        il backend deve rispondere con HTTP 500 e un messaggio descrittivo.
        """
        with patch('src.app.get_model') as mock_get_model:
            mock_model = MagicMock()
            mock_model.generate.side_effect = Exception("Connessione al modello fallita")
            mock_get_model.return_value = mock_model
 
            response = post_generate(client, {
                "text": "Testo valido",
                "operation": "summary"
            })
            assert response.status_code == 500
            data = response.get_json()
            assert "generated_text" in data
            assert "❌" in data["generated_text"]

    def test_error_message_contains_exception_text(self, client):
        """
        Il messaggio di errore restituito deve contenere
        la descrizione dell'eccezione originale.
        """
        error_msg = "Timeout connessione"
        with patch('src.app.get_model') as mock_get_model:
            mock_model = MagicMock()
            mock_model.generate.side_effect = Exception(error_msg)
            mock_get_model.return_value = mock_model
 
            response = post_generate(client, {
                "text": "Qualsiasi testo",
                "operation": "summary"
            })
            data = response.get_json()
            assert error_msg in data["generated_text"]


# ===========================================================================
# 5. Response format
# ===========================================================================
class TestResponseFormat:
    """Verifica che il formato JSON delle risposte sia sempre consistente."""

    def test_success_response_has_generated_text_key(self, client):
        """La risposta di successo deve sempre avere la chiave 'generated_text'."""
        with patch('src.app.get_model') as mock_get_model:
            mock_model = MagicMock()
            mock_model.generate.return_value = "Risultato"
            mock_get_model.return_value = mock_model
 
            response = post_generate(client, {"text": "testo", "operation": "summary"})
            data = response.get_json()
            assert "generated_text" in data

    def test_error_response_has_generated_text_key(self, client):
        """Anche la risposta di errore (400) deve avere la chiave 'generated_text'."""
        response = post_generate(client, {"text": ""})
        data = response.get_json()
        assert "generated_text" in data

    def test_content_type_is_json(self, client):
        """Il Content-Type delle risposte deve essere application/json."""
        with patch('src.app.get_model') as mock_get_model:
            mock_model = MagicMock()
            mock_model.generate.return_value = "ok"
            mock_get_model.return_value = mock_model
 
            response = post_generate(client, {"text": "test", "operation": "summary"})
            assert "application/json" in response.content_type
 