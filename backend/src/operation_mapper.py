from dataclasses import dataclass
from typing import Type
from src.ai_strategies import STRATEGIES, BaseAIStrategy
from src import model_strategies

@dataclass
class OperationConfig:
    """
    Accoppia una strategia di prompt con una strategia di modello.
    Istruzioni passate da app.py al servizio di generazione.
    """
    model_class: Type[model_strategies.AIModelStrategy]
    prompt_strategy: BaseAIStrategy


OPERATION_MAPPER: dict[str, OperationConfig] = {
    # Operazioni editoriali standard → Llama 3.2 (per ora)
    "summary":   OperationConfig(model_strategies.ZucchettiLlamaStrategy, STRATEGIES["summary"]),
    "fix_grammar": OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["fix_grammar"]),
    "rewrite":    OperationConfig(model_strategies.ZucchettiLlamaStrategy, STRATEGIES["rewrite"]),
    "distant_writing":       OperationConfig(model_strategies.ZucchettiLlamaStrategy, STRATEGIES["distant_writing"]),

    # Sei Cappelli di De Bono → Gemma3:4B
    "white_hat":  OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["white_hat"]),
    "red_hat":    OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["red_hat"]),
    "black_hat":  OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["black_hat"]),
    "yellow_hat": OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["yellow_hat"]),
    "green_hat":  OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["green_hat"]),
    "blue_hat":   OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["blue_hat"]),
 
    # Traduzioni → Llama 3.2 (per ora)
    "translate_it": OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["translate_it"]),
    "translate_en": OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["translate_en"]),
    "translate_es": OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["translate_es"]),
    "translate_fr": OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["translate_fr"]),
    "translate_de": OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["translate_de"]),
    "translate_zh": OperationConfig(model_strategies.Gemma3Strategy, STRATEGIES["translate_zh"]),

}

DEFAULT_OPERATION = "summary"