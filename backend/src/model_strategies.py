import os
from openai import OpenAI
from typing import Type
from functools import lru_cache
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
    


@lru_cache(maxsize=None)
def get_model(model_class: Type[AIModelStrategy]) -> AIModelStrategy:
    return model_class()


# Strategie concrete
    
class ZucchettiDeepSeekStrategy(AIModelStrategy):
    """Strategia per il modello DeepSeek: 8b via infrastruttura Zucchetti."""
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL")
        )
        self.model = "deepseek-r1:8b"

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

class Qwen3Strategy(AIModelStrategy):
    """Strategia per il modello Qwen3:30b via infrastruttura Zucchetti."""
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL")
        )
        self.model = "qwen3:30b"

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