import pytest
from unittest.mock import MagicMock, patch
from src.model_strategies import ZucchettiDeepSeekStrategy, ZucchettiLlamaStrategy, Gemma3Strategy, Qwen3Strategy, get_model, AIModelStrategy
from openai import OpenAIError 

# ---------------------------------------------------------------------------
# 1. Test della Classe Base
# ---------------------------------------------------------------------------
def test_base_strategy_raises_not_implemented():
    """Verifica che la classe base non possa essere usata direttamente."""
    strategy = AIModelStrategy()
    with pytest.raises(NotImplementedError):
        strategy.generate("system", "user")

# ---------------------------------------------------------------------------
# 2. Test del Singleton / Factory (get_model)
# ---------------------------------------------------------------------------
def test_get_model_cache_clear():
    class TestStrategy(AIModelStrategy): pass

    instance1 = get_model(TestStrategy)
    
    # reset cache
    get_model.cache_clear()
    
    instance2 = get_model(TestStrategy)

    assert instance1 is not instance2

# ---------------------------------------------------------------------------
# 3. Test della Strategia Zucchetti (con Mocking)
# ---------------------------------------------------------------------------
@patch('src.model_strategies.OpenAI') # Simula la classe OpenAI
def test_zucchetti_llama_generate(mock_openai_class):
    """Verifica che la strategia chiami correttamente il client OpenAI."""
    
    # Configuriamo il "finto" client OpenAI
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    # Simula la struttura della risposta di OpenAI: response.choices[0].message.content
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Risposta Llama!"))]
    mock_client.chat.completions.create.return_value = mock_response

    # Esecuzione
    strategy = ZucchettiLlamaStrategy()
    result = strategy.generate("Prompt Sistema", "Prompt Utente")

    # Verifiche (Assertions)
    assert result == "Risposta Llama!"
    
    # Verifica che la chiamata al client sia stata fatta con i parametri giusti
    mock_client.chat.completions.create.assert_called_once_with(
        model="llama3.2:3b",
        messages=[
            {"role": "system", "content": "Prompt Sistema"},
            {"role": "user", "content": "Prompt Utente"}
        ],
        temperature=0.5
    )

@patch('src.model_strategies.OpenAI') # Simula la classe OpenAI
def test_zucchetti_deepSeek_generate(mock_openai_class):
    """Verifica che la strategia chiami correttamente il client OpenAI."""
    
    # Configuriamo il "finto" client OpenAI
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    # Simula la struttura della risposta di OpenAI: response.choices[0].message.content
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Risposta DeepSeek!"))]
    mock_client.chat.completions.create.return_value = mock_response

    # Esecuzione
    strategy = ZucchettiDeepSeekStrategy()
    result = strategy.generate("Prompt Sistema", "Prompt Utente")

    # Verifiche (Assertions)
    assert result == "Risposta DeepSeek!"
    
    # Verifica che la chiamata al client sia stata fatta con i parametri giusti
    mock_client.chat.completions.create.assert_called_once_with(
        model="deepseek-r1:8b",
        messages=[
            {"role": "system", "content": "Prompt Sistema"},
            {"role": "user", "content": "Prompt Utente"}
        ],
        temperature=0.5
    )
# Test per Qwen3Strategy
@patch('src.model_strategies.OpenAI') # Simula la classe OpenAI
def test_qwen3_generate(mock_openai_class):
    """Verifica che la strategia chiami correttamente il client OpenAI."""   
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Risposta Qwen!"))]
    mock_client.chat.completions.create.return_value = mock_response

    # Esecuzione
    strategy = Qwen3Strategy()
    result = strategy.generate("Prompt Sistema", "Prompt Utente")

    # Verifiche (Assertions)
    assert result == "Risposta Qwen!"
    
    # Verifica che la chiamata al client sia stata fatta con i parametri giusti
    mock_client.chat.completions.create.assert_called_once_with(
        model="qwen3:30b",
        messages=[
            {"role": "system", "content": "Prompt Sistema"},
            {"role": "user", "content": "Prompt Utente"}
        ],
        temperature=0.5
    )

# Test per Gemma3Strategy (LLM per 6 cappelli)
@patch('src.model_strategies.OpenAI')
def test_gemma3_generate(mock_openai_class):
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Risposta Gemma"))]
    mock_client.chat.completions.create.return_value = mock_response

    strategy = Gemma3Strategy()
    # Proviamo con una temperatura diversa, come per il Cappello Verde
    result = strategy.generate("System", "User", temperature=0.8)

    assert result == "Risposta Gemma"
    # Verifica che chiami ESATTAMENTE gemma3:4b
    mock_client.chat.completions.create.assert_called_once_with(
        model="gemma3:4b",
        messages=[
            {"role": "system", "content": "System"},
            {"role": "user", "content": "User"}
        ],
        temperature=0.8
    )


@patch('src.model_strategies.OpenAI')
def test_zucchetti_llama_api_error(mock_openai_class):
    """Verifica che la strategia gestisca (o sollevi) errori dall'API."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    # Simula un errore generico dell'SDK OpenAI
    mock_client.chat.completions.create.side_effect = Exception("API Connection Error")

    strategy = ZucchettiLlamaStrategy()
    with pytest.raises(Exception) as excinfo:
        strategy.generate("sys", "user")
    
    assert "API Connection Error" in str(excinfo.value)


def test_get_model_different_classes():
    class ModelA(AIModelStrategy): pass
    class ModelB(AIModelStrategy): pass
    
    inst_a = get_model(ModelA)
    inst_b = get_model(ModelB)
    
    assert inst_a != inst_b
    assert inst_a.__class__.__name__ == "ModelA"
    assert inst_b.__class__.__name__ == "ModelB"


def test_get_model_integrity():
    class FakeModelA(AIModelStrategy): pass
    class FakeModelB(AIModelStrategy): pass
    
    model_a = get_model(FakeModelA)
    model_b = get_model(FakeModelB)
    
    assert isinstance(model_a, FakeModelA)
    assert isinstance(model_b, FakeModelB)
    assert model_a != model_b



def test_zucchetti_llama_missing_env_vars():
    """Verifica che venga lanciato un errore se mancano le variabili d'ambiente."""
    with patch.dict('os.environ', {}, clear=True):
        # Ci aspettiamo che l'inizializzazione fallisca subito
        with pytest.raises(OpenAIError) as excinfo:
            ZucchettiLlamaStrategy()   
        # Verifichiamo che il messaggio di errore sia quello giusto
        assert "api_key" in str(excinfo.value)

@patch('src.model_strategies.OpenAI')
def test_zucchetti_llama_empty_response(mock_openai_class):
    """Verifica che la strategia gestisca una risposta vuota o mancante."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    # Simula una risposta che non ha 'choices' (caso limite)
    mock_response = MagicMock()
    mock_response.choices = [] 
    mock_client.chat.completions.create.return_value = mock_response

    strategy = ZucchettiLlamaStrategy()
    with pytest.raises(IndexError): # O l'errore che ti aspetti
        strategy.generate("sys", "user")

@patch('src.model_strategies.OpenAI')
def test_get_model_cache_behavior(mock_openai):
    from src.model_strategies import get_model, ZucchettiLlamaStrategy

    get_model.cache_clear()

    model1 = get_model(ZucchettiLlamaStrategy)
    model2 = get_model(ZucchettiLlamaStrategy)

    assert model1 is model2
    assert mock_openai.call_count == 1