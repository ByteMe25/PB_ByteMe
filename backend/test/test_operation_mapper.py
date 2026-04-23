import pytest
from src.operation_mapper import OPERATION_MAPPER, DEFAULT_OPERATION, OperationConfig
from src.ai_strategies import BaseAIStrategy
import src.model_strategies
import re

# ---------------------------------------------------------------------------
# 1. Test di Integrità del Mapper
# ---------------------------------------------------------------------------

def test_mapper_is_dict():
    """Verifica che OPERATION_MAPPER sia un dizionario."""
    assert isinstance(OPERATION_MAPPER, dict)

def test_required_operations_exist():
    """Verifica che le operazioni base siano presenti."""
    required = ["summary", "fix_grammar", "rewrite", "distant_writing"]
    for op in required:
        assert op in OPERATION_MAPPER, f"Operazione mancante: {op}"

def test_default_operation_is_valid():
    """Verifica che l'operazione di default esista nel mapper."""
    assert DEFAULT_OPERATION in OPERATION_MAPPER

# ---------------------------------------------------------------------------
# 2. Test delle Configurazioni (OperationConfig)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("op_name", OPERATION_MAPPER.keys())
def test_operation_config_structure(op_name):
    """Verifica che ogni configurazione abbia il modello e la strategia corretti."""
    config = OPERATION_MAPPER[op_name]
    
    assert isinstance(config, OperationConfig)
    
    # Verifica che model_class sia una sottoclasse di AIModelStrategy
    assert issubclass(config.model_class, src.model_strategies.AIModelStrategy)
    
    # Verifica che prompt_strategy sia un'istanza di BaseAIStrategy
    assert isinstance(config.prompt_strategy, BaseAIStrategy)

def test_summary_uses_correct_strategy():
    """Verifica specifica che 'summary' usi la strategia di riassunto."""
    from src.ai_strategies import SimplePromptStrategy
    config = OPERATION_MAPPER["summary"]
    
    # Controlliamo che il ruolo nel prompt di sistema sia quello di un assistente che riassume
    sys_prompt, _ = config.prompt_strategy.build("test")
    assert "riassume" in sys_prompt.lower() or "summary" in sys_prompt.lower()

# ---------------------------------------------------------------------------
# 3. Test di Robustezza (Cosa non deve succedere)
# ---------------------------------------------------------------------------

def test_mapper_values_not_none():
    """Verifica che nessuna operazione sia configurata a None."""
    for op_name, config in OPERATION_MAPPER.items():
        assert config.model_class is not None, f"Modello nullo per {op_name}"
        assert config.prompt_strategy is not None, f"Strategia nulla per {op_name}"

def test_each_operation_has_unique_mapper_instance():
    """Verifica che ogni operazione usi un'istanza di strategia diversa."""
    strategies = [id(config.prompt_strategy) for config in OPERATION_MAPPER.values()]
    # Se usiamo set(), i duplicati vengono rimossi. 
    # Se la lunghezza rimane uguale, sono tutti pezzi unici.
    assert len(strategies) == len(set(strategies)), "Ci sono strategie duplicate nel mapper!"



def test_mapper_keys_format():
    """Verifica che tutte le chiavi siano in minuscolo e senza caratteri speciali."""
    pattern = re.compile(r'^[a-z_]+$')
    for key in OPERATION_MAPPER.keys():
        assert pattern.match(key), f"La chiave '{key}' non segue il formato snake_case!"
    
def test_all_strategies_can_build_prompts():
    """Verifica che ogni configurazione nel mapper funzioni con un input reale."""
    test_text = "Questo è un testo di test per il mapper."
    for op_name, config in OPERATION_MAPPER.items():
        sys_p, user_p = config.prompt_strategy.build(test_text)
        assert isinstance(sys_p, str) and len(sys_p) > 0
        assert isinstance(user_p, str) and len(user_p) > 0
        assert test_text in user_p  # Quasi tutte le tue strategie includono il testo nel prompt utente

def test_default_operation_config_is_valid():
    """Verifica che l'operazione di default abbia una config completa."""
    default_config = OPERATION_MAPPER.get(DEFAULT_OPERATION)
    assert default_config is not None
    assert default_config.model_class is not None