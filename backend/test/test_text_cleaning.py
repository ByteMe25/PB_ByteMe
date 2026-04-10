# file di test per la funzione clean_ai_response
from src.utils.text_cleaning import clean_ai_response

def test_clean_ai_response_removes_intro():
    input_text = "Ecco un riassunto: Il contenuto è questo."
    expected = "Il contenuto è questo."
    assert clean_ai_response(input_text) == expected

def test_clean_ai_response_removes_newlines():
    input_text = "\n\nTesto con spazi iniziali."
    expected = "Testo con spazi iniziali."
    assert clean_ai_response(input_text) == expected

def test_clean_ai_response_case_insensitive():
    input_text = "RIASSUNTO: contenuto importante."
    expected = "contenuto importante."
    assert clean_ai_response(input_text) == expected