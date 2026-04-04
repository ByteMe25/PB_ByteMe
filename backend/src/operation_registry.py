from dataclasses import dataclass
from typing import Type
from ai_strategies import STRATEGIES, BaseAIStrategy
import model_strategies

@dataclass
class OperationConfig:
    model_class: Type[model_strategies.AIModelStrategy]
    prompt_strategy: BaseAIStrategy


OPERATION_REGISTRY: dict[str, OperationConfig] = {
    "summary":   OperationConfig(model_strategies.ZucchettiLlamaStrategy, STRATEGIES["summary"]),
    "fix_grammar": OperationConfig(model_strategies.ZucchettiLlamaStrategy, STRATEGIES["fix_grammar"]),
    "rewrite":    OperationConfig(model_strategies.ZucchettiLlamaStrategy, STRATEGIES["rewrite"]),
    "distant_writing":       OperationConfig(model_strategies.ZucchettiLlamaStrategy, STRATEGIES["distant_writing"]),
}

DEFAULT_OPERATION = "summary"