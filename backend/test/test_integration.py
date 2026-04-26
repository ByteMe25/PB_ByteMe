import pytest
from unittest.mock import patch, MagicMock


import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from app import app



@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


@pytest.fixture
def mock_model():
    fake_model = MagicMock()
    fake_model.generate.return_value = "Risposta simulata dal modello AI."

    with patch("app.get_model", return_value=fake_model):
        yield fake_model


# Health check

def test_root_returns_status(client):
    resp = client.get("/")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["status"] == "running"
    assert "summary" in body["active_operations"]
    assert "white_hat" in body["active_operations"]


# Flusso completo: ENDPOINT → MAPPER → STRATEGIA → MODELLO

@pytest.mark.parametrize("operation", [
    "summary", "fix_grammar", "rewrite",
    "translate_en", "translate_fr",
])
def test_standard_operations_return_generated_text(client, mock_model, operation):
    resp = client.post("/api/ai/generate", json={
        "text": "Il cielo è blu e il sole splende forte.",
        "operation": operation,
    })
    assert resp.status_code == 200
    assert "generated_text" in resp.get_json()
    assert len(resp.get_json()["generated_text"]) > 0


@pytest.mark.parametrize("hat", [
    "white_hat", "red_hat", "black_hat",
    "yellow_hat", "green_hat", "blue_hat",
])
def test_debono_hats_return_generated_text(client, mock_model, hat):
    resp = client.post("/api/ai/generate", json={
        "text": "Lanceremo un nuovo prodotto il prossimo trimestre.",
        "operation": hat,
    })
    assert resp.status_code == 200
    assert "generated_text" in resp.get_json()


def test_temperature_is_forwarded_to_model(client, mock_model):
    client.post("/api/ai/generate", json={
        "text": "Analizza questo testo.",
        "operation": "white_hat",
    })
    args, kwargs = mock_model.generate.call_args
    temperature = kwargs.get("temperature", args[2] if len(args) > 2 else None)
    assert temperature == 0.1


# MAPPER → STRATEGIA (corretta costruzione prompt)

@pytest.mark.parametrize("operation,expected_in_user_prompt", [
    ("translate_en", "inglese"),
    ("translate_fr", "francese"),
    ("translate_de", "tedesco"),
    ("translate_es", "spagnolo"),
    ("translate_zh", "cinese"),
])
def test_translation_prompt_contains_language(client, mock_model, operation, expected_in_user_prompt):
    client.post("/api/ai/generate", json={
        "text": "Ciao mondo.", "operation": operation
    })
    args, _ = mock_model.generate.call_args
    user_prompt = args[1]  # secondo argomento posizionale di generate()
    assert expected_in_user_prompt in user_prompt.lower()


@pytest.mark.parametrize("hat,expected_in_system", [
    ("white_hat",  "Cappello Bianco"),
    ("red_hat",    "Cappello Rosso"),
    ("black_hat",  "Cappello Nero"),
    ("yellow_hat", "Cappello Giallo"),
    ("green_hat",  "Cappello Verde"),
    ("blue_hat",   "Cappello Blu"),
])
def test_debono_system_prompt_contains_hat_name(client, mock_model, hat, expected_in_system):
    client.post("/api/ai/generate", json={
        "text": "Testo di prova.", "operation": hat
    })
    args, _ = mock_model.generate.call_args
    system_prompt = args[0]  # primo argomento posizionale di generate()
    assert expected_in_system in system_prompt


# ENDPOINT → TEXT CLEANING (textcleaning applicata correttamente)

@pytest.mark.parametrize("raw_response,unexpected_prefix", [
    ("Ecco il riassunto: testo pulito.",      "Ecco il riassunto:"),
    ("Ecco una traduzione: testo pulito.",    "Ecco una traduzione:"),
    ("Riassunto: testo pulito.",              "Riassunto:"),
    ("Traduzione: testo pulito.",             "Traduzione:"),
    ("Di seguito il contenuto: testo.",       "Di seguito"),
    ("Certamente, ecco la risposta.",         "Certamente"),
    ("Certo! Ecco il testo.",                 "Certo!"),
])
def test_response_is_cleaned(client, mock_model, raw_response, unexpected_prefix):
    mock_model.generate.return_value = raw_response
    resp = client.post("/api/ai/generate", json={
        "text": "Testo.", "operation": "summary"
    })
    generated = resp.get_json()["generated_text"]
    assert not generated.startswith(unexpected_prefix)


# Gestione errori HTTP

def test_missing_text_returns_400(client):
    resp = client.post("/api/ai/generate", json={
        "operation": "summary", "text": "",
    })
    assert resp.status_code == 400
    assert "generated_text" in resp.get_json()


def test_distant_writing_without_prompt_returns_400(client):
    resp = client.post("/api/ai/generate", json={
        "operation": "distant_writing", "text": "", "prompt": "",
    })
    assert resp.status_code == 400


def test_model_exception_returns_500(client, mock_model):
    mock_model.generate.side_effect = RuntimeError("Timeout connessione AI")
    resp = client.post("/api/ai/generate", json={
        "text": "Testo qualunque.", "operation": "summary",
    })
    assert resp.status_code == 500
    assert "generated_text" in resp.get_json()


# Fallback DEFAULT_OPERATION

def test_default_operation_is_summary(client, mock_model):
    resp = client.post("/api/ai/generate", json={
        "text": "Testo senza operazione specificata.",
    })
    assert resp.status_code == 200


def test_unknown_operation_falls_back_to_default(client, mock_model):
    resp = client.post("/api/ai/generate", json={
        "text": "Testo di prova.",
        "operation": "operazione_che_non_esiste",
    })
    assert resp.status_code == 200


# Distant writing

def test_distant_writing_with_prompt(client, mock_model):
    resp = client.post("/api/ai/generate", json={
        "text": "",
        "prompt": "Scrivi l'incipit di un romanzo noir ambientato a Milano.",
        "operation": "distant_writing",
    })
    assert resp.status_code == 200
    assert "generated_text" in resp.get_json()


def test_distant_writing_prompt_appears_in_user_prompt(client, mock_model):
    prompt_text = "Scrivi una scena drammatica."
    client.post("/api/ai/generate", json={
        "text": "",
        "prompt": prompt_text,
        "operation": "distant_writing",
    })
    args, _ = mock_model.generate.call_args
    user_prompt = args[1]
    assert prompt_text in user_prompt


def test_distant_writing_with_context(client, mock_model):
    resp = client.post("/api/ai/generate", json={
        "text": "Un detective stanco cammina sotto la pioggia.",
        "prompt": "Continua la storia.",
        "operation": "distant_writing",
    })
    assert resp.status_code == 200