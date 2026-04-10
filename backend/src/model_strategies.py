# ai_model_strategies.py
import os
from openai import OpenAI
from typing import Type

class AIModelStrategy:
    """
    Interfaccia comune per tutti i modelli AI.
    Ogni sottoclasse implementa generate() chiamando il proprio provider.
    Il parametro temperature permette di calibrare la creatività della risposta:
        - valori bassi (0.1) → risposte analitiche e deterministiche
        - valori alti (0.8)  → risposte creative e variabili
    """
    def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.5) -> str:
        raise NotImplementedError
    


_model_instances: dict[str, AIModelStrategy] = {}

def get_model(model_class: Type[AIModelStrategy]) -> AIModelStrategy:
    """
    Restituisce sempre la stessa istanza per una data classe.
    Se l'istanza non esiste ancora, la crea e la mette in cache.
    """
    key = model_class.__name__
    if key not in _model_instances:
        _model_instances[key] = model_class()
    return _model_instances[key]

# Strategie concrete
class ZucchettiLlamaStrategy(AIModelStrategy):
    """Strategia per il modello Llama3.2:3b via infrastruttura Zucchetti."""
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL")
        )
        self.model = "llama3.2:3b"

    def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.5) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
    

class Gemma3Strategy(AIModelStrategy):
    """Strategia per il modello Gemma3:4b via infrastruttura Zucchetti."""
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL")
        )
        self.model = "gemma3:4b"

    def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.5) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=temperature,
        )
        return response.choices[0].message.content