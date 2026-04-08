# ai_model_strategies.py
import os
from openai import OpenAI
from typing import Type

class AIModelStrategy:
    """Interfaccia comune per tutti i modelli AI"""
    def generate(self, system_prompt, user_prompt):
        raise NotImplementedError

_model_instances: dict[str, AIModelStrategy] = {}

def get_model(model_class: Type[AIModelStrategy]) -> AIModelStrategy:
    key = model_class.__name__
    if key not in _model_instances:
        _model_instances[key] = model_class()
    return _model_instances[key]

class ZucchettiLlamaStrategy(AIModelStrategy):
    """Strategia per il modello Llama via infrastruttura Zucchetti"""
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL")
        )
        self.model = "llama3.2:3b"

    def generate(self, system_prompt, user_prompt):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response.choices[0].message.content