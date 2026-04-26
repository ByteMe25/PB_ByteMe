# Esegui con: pytest test_ai_strategies.py -v

import pytest
import sys
import os

from src.ai_strategies import (
    BaseAIStrategy,
    SimplePromptStrategy,
    TranslationStrategy,
    DeBonoHatStrategy,
    DistantWritingStrategy,
    STRATEGIES,
)


# ──────────────────────────────────────────────
# BaseAIStrategy
# ──────────────────────────────────────────────
class TestBaseAIStrategy:
    def test_build_raises_not_implemented(self):
        """build() deve essere implementato dalle sottoclassi."""
        base = BaseAIStrategy()
        with pytest.raises(NotImplementedError):
            base.build("qualsiasi testo")

    def test_has_default_temperature(self):
        """La classe base deve avere una temperature di default."""
        assert hasattr(BaseAIStrategy, 'temperature')
        assert isinstance(BaseAIStrategy.temperature, float)


# ──────────────────────────────────────────────
# SimplePromptStrategy
# ──────────────────────────────────────────────
class TestSimplePromptStrategy:

    def test_build_returns_two_strings(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi il testo")
        result = strategy.build("Testo di esempio.")
        assert len(result) == 2
        assert all(isinstance(s, str) for s in result)

    def test_system_prompt_contains_role(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi il testo")
        system, _ = strategy.build("Testo.")
        assert "Sei un assistente." in system

    def test_system_prompt_contains_no_intro_instruction(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi il testo")
        system, _ = strategy.build("Testo.")
        assert "NON usare frasi introduttive" in system

    def test_user_prompt_contains_task(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi il testo")
        _, user = strategy.build("Testo di prova.")
        assert "Riassumi il testo" in user

    def test_user_prompt_contains_input_text(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi il testo")
        input_text = "Questo è il testo da elaborare."
        _, user = strategy.build(input_text)
        assert input_text in user

    @pytest.mark.parametrize("key,expected_role,expected_task", [
        ("summary",
         "Sei un assistente che riassume testi in italiano in modo chiaro e conciso.",
         "Fai un riassunto breve e chiaro in italiano di"),
        ("fix_grammar",
         "Sei un correttore di bozze che corregge errori grammaticali e ortografici in italiano.",
         "Correggi eventuali errori grammaticali e ortografici nel seguente testo"),
        ("rewrite",
         "Sei un editor che riscrive testi migliorandone la chiarezza e lo stile.",
         "Riscrivi il seguente testo migliorandone la chiarezza"),
    ])
    def test_strategies_dict_content(self, key, expected_role, expected_task):
        system, user = STRATEGIES[key].build("Testo di prova.")
        assert expected_role in system
        assert expected_task in user


# ──────────────────────────────────────────────
# TranslationStrategy
# ──────────────────────────────────────────────
class TestTranslationStrategy:

    def test_build_returns_two_strings(self):
        strategy = TranslationStrategy("inglese")
        result = strategy.build("Ciao mondo.")
        assert len(result) == 2
        assert all(isinstance(s, str) for s in result)

    def test_user_prompt_contains_language(self):
        strategy = TranslationStrategy("francese")
        _, user = strategy.build("Buongiorno.")
        assert "francese" in user

    def test_user_prompt_contains_input_text(self):
        strategy = TranslationStrategy("spagnolo")
        input_text = "Il sole splende."
        _, user = strategy.build(input_text)
        assert input_text in user

    def test_system_prompt_is_consistent_across_languages(self):
        """Il system prompt è sempre lo stesso indipendente dalla lingua."""
        s1 = TranslationStrategy("tedesco")
        s2 = TranslationStrategy("cinese mandarino")
        system1, _ = s1.build("Testo.")
        system2, _ = s2.build("Testo.")
        assert system1 == system2
    
    def test_temperature_is_low(self):
        """Le traduzioni devono usare una temperature bassa per maggiore precisione."""
        s = TranslationStrategy("inglese")
        assert s.temperature <= 0.4

    @pytest.mark.parametrize("language", [
        "italiano", "inglese", "spagnolo", "francese", "tedesco", "cinese mandarino"
    ])
    def test_all_supported_languages(self, language):
        strategy = TranslationStrategy(language)
        system, user = strategy.build("Test.")
        assert language in user


# ──────────────────────────────────────────────
# DeBonoHatStrategy
# ──────────────────────────────────────────────
class TestDeBonoHatStrategy:
    
    def test_build_returns_two_strings(self):
        strategy = DeBonoHatStrategy(
            system_prompt="Agisci come il Cappello Bianco.",
            user_task="Analizza il testo:",
            temperature=0.1
        )
        result = strategy.build("Testo di analisi.")
        assert len(result) == 2

    def test_user_prompt_contains_input_text(self):
        """Il testo dell'utente deve sempre comparire nel user_prompt."""
        input_text = "Idee innovative per il futuro."
        for key in ["white_hat", "red_hat", "black_hat", "yellow_hat", "green_hat", "blue_hat"]:
            _, user = STRATEGIES[key].build(input_text)
            assert input_text in user, f"Testo mancante per {key}"


    # Temperature
    @pytest.mark.parametrize("hat_key,expected_temp", [
        ("white_hat",  0.1),
        ("black_hat",  0.1),
        ("blue_hat",   0.1),
        ("red_hat",    0.8),
        ("yellow_hat", 0.8),
        ("green_hat",  0.8),
    ])
    def test_hat_temperature(self, hat_key, expected_temp):
        """Verifica che la temperature sia calibrata correttamente per cappello."""
        assert STRATEGIES[hat_key].temperature == expected_temp


    # Contenuto dei prompt
    def test_white_hat_system_prompt_is_objective(self):
        system, _ = STRATEGIES["white_hat"].build("Testo.")
        assert "oggettivo" in system.lower() or "fatti" in system.lower()
 
    def test_white_hat_user_prompt_has_4_points(self):
        _, user = STRATEGIES["white_hat"].build("Testo.")
        assert "1)" in user and "2)" in user and "3)" in user and "4)" in user
 
    def test_red_hat_system_prompt_mentions_emotions(self):
        system, _ = STRATEGIES["red_hat"].build("Testo.")
        assert "emozion" in system.lower() or "sentiment" in system.lower()
 
    def test_black_hat_system_prompt_mentions_risks(self):
        system, _ = STRATEGIES["black_hat"].build("Testo.")
        assert "rischi" in system.lower() or "critico" in system.lower()
 
    def test_yellow_hat_system_prompt_mentions_benefits(self):
        system, _ = STRATEGIES["yellow_hat"].build("Testo.")
        assert "benefici" in system.lower() or "opportunit" in system.lower()
 
    def test_green_hat_system_prompt_mentions_creativity(self):
        system, _ = STRATEGIES["green_hat"].build("Testo.")
        assert "creativ" in system.lower() or "innovativ" in system.lower()
 
    def test_blue_hat_system_prompt_mentions_process(self):
        system, _ = STRATEGIES["blue_hat"].build("Testo.")
        assert "processo" in system.lower() or "sintesi" in system.lower()


# ──────────────────────────────────────────────
# DistantWritingStrategy
# ──────────────────────────────────────────────
class TestDistantWritingStrategy:
    def test_distant_writing_build_prompts(self):
        """Verifica che il Distant Writing inserisca correttamente il prompt utente e il contesto."""
        # Recupera l'istanza dal dizionario globale delle strategie
        strategy = STRATEGIES["distant_writing"]
        
        testo_contesto = "Il protagonista entra nella stanza buia."
        prompt_utente = "Continua la storia con un tono horror."
        
        # Il distant writing riceve sia il text che il prompt
        system_prompt, user_prompt = strategy.build(text=testo_contesto, prompt=prompt_utente)
        
        # Verifica che ritorni due stringhe valide
        assert isinstance(system_prompt, str)
        assert isinstance(user_prompt, str)
        
        # Verifica che il prompt personalizzato dell'utente sia stato elaborato e inserito
        assert prompt_utente in system_prompt or prompt_utente in user_prompt
        
        # Verifica che il testo di contesto sia stato mantenuto
        assert testo_contesto in system_prompt or testo_contesto in user_prompt


# ──────────────────────────────────────────────
# Dizionario STRATEGIES
# ──────────────────────────────────────────────
class TestStrategiesDict:

    EXPECTED_KEYS = [
        "summary", "fix_grammar", "rewrite", "distant_writing",
        "white_hat", "red_hat", "black_hat", "yellow_hat", "green_hat", "blue_hat",
        "translate_it", "translate_en", "translate_es",
        "translate_fr", "translate_de", "translate_zh",
    ]

    def test_all_keys_present(self):
        for key in self.EXPECTED_KEYS:
            assert key in STRATEGIES, f"Chiave mancante: '{key}'"

    def test_all_values_are_base_strategy(self):
        for key, strategy in STRATEGIES.items():
            assert isinstance(strategy, BaseAIStrategy), (
                f"'{key}' non è una BaseAIStrategy"
            )

    def test_all_have_temperature_attribute(self):
        for key, strategy in STRATEGIES.items():
            assert hasattr(strategy, 'temperature'), f"'{key}' senza attributo temperature"
            assert isinstance(strategy.temperature, float), f"'{key}' temperature non è float"

    @pytest.mark.parametrize("key", EXPECTED_KEYS)
    def test_each_strategy_build_works(self, key):
        """Ogni strategia deve produrre due stringhe non vuote."""
        system, user = STRATEGIES[key].build("Testo di prova.")
        assert isinstance(system, str) and len(system) > 0
        assert isinstance(user, str) and len(user) > 0
 
    def test_strategies_are_simpleprompt(self):
        hat_keys = ["summary", "fix_grammar", "rewrite" ]
        for key in hat_keys:
            assert isinstance(STRATEGIES[key], SimplePromptStrategy)
 
    def test_translate_strategies_are_translation(self):
        translate_keys = ["translate_it", "translate_en", "translate_es",
                          "translate_fr", "translate_de", "translate_zh"]
        for key in translate_keys:
            assert isinstance(STRATEGIES[key], TranslationStrategy)
            
    def test_hat_strategies_are_debono(self):
        hat_keys = ["white_hat", "red_hat", "black_hat", "yellow_hat", "green_hat", "blue_hat"]
        for key in hat_keys:
            assert isinstance(STRATEGIES[key], DeBonoHatStrategy)


# ──────────────────────────────────────────────
# Casi limite
# ──────────────────────────────────────────────
class TestEdgeCases:

    # Stringa vuota
    def test_simple_prompt_empty_text(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi")
        system, user = strategy.build("")
        assert isinstance(system, str)
        assert isinstance(user, str)

    def test_translation_empty_text(self):
        strategy = TranslationStrategy("inglese")
        system, user = strategy.build("")
        assert isinstance(system, str)
        assert isinstance(user, str)

    def test_debono_empty_text(self):
        strategy = DeBonoHatStrategy("Cappello Bianco", "dati e fatti", 0.5)
        system, user = strategy.build("")
        assert isinstance(system, str)
        assert isinstance(user, str)

    # Solo spazi
    def test_simple_prompt_whitespace_only(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi")
        system, user = strategy.build("   \n\n\t")
        assert isinstance(system, str)
        assert isinstance(user, str)

    # Testo molto lungo
    def test_simple_prompt_very_long_text(self):
        long_text = "parola " * 10000
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi")
        system, user = strategy.build(long_text)
        assert long_text in user

    # Caratteri speciali e unicode
    def test_translation_with_emoji(self):
        strategy = TranslationStrategy("inglese")
        text = "Testo con emoji 🎯🚀 e simboli <>&\"'"
        system, user = strategy.build(text)
        assert text in user

    def test_translation_with_non_latin_input(self):
        strategy = TranslationStrategy("italiano")
        text = "日本語のテキスト"
        system, user = strategy.build(text)
        assert text in user

    # None come input
    def test_simple_prompt_none_raises(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi")
        with pytest.raises(TypeError):
            strategy.build(None)

    def test_translation_none_raises(self):
        strategy = TranslationStrategy("inglese")
        with pytest.raises(TypeError):
            strategy.build(None)

    def test_debono_none_raises(self):
        strategy = DeBonoHatStrategy("Cappello Bianco", "dati e fatti", 0.5)
        with pytest.raises(TypeError):
            strategy.build(None)

    # Costruttore con valori vuoti
    def test_simple_prompt_empty_role_and_task(self):
        strategy = SimplePromptStrategy(role="", task="")
        system, user = strategy.build("Testo.")
        assert isinstance(system, str)
        assert isinstance(user, str)

    def test_translation_empty_language(self):
        strategy = TranslationStrategy(language="")
        system, user = strategy.build("Testo.")
        assert isinstance(system, str)
        assert isinstance(user, str)

    def test_debono_empty_hat_and_focus(self):
        strategy = DeBonoHatStrategy(
            system_prompt="",
            user_task="",
            temperature=0.5
        )
        system, user = strategy.build("Testo.")
        assert isinstance(system, str)
        assert isinstance(user, str)