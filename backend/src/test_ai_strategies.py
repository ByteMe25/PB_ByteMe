import pytest
import sys
import os
 
# Aggiunge la cartella del file originale al path
sys.path.insert(0, "/mnt/user-data/uploads")
from ai_strategies import (
    BaseAIStrategy,
    SimplePromptStrategy,
    TranslationStrategy,
    DeBonoHatStrategy,
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
        ("distant_writing",
         "Sei uno scrittore creativo che espande idee e concetti.",
         "Espandi e sviluppa il seguente concetto in un testo più articolato"),
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
 
    def test_system_prompt_is_consistent(self):
        s1 = TranslationStrategy("tedesco")
        s2 = TranslationStrategy("cinese mandarino")
        system1, _ = s1.build("Testo.")
        system2, _ = s2.build("Testo.")
        # Il system prompt è sempre lo stesso, indipendente dalla lingua
        assert system1 == system2
 
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
        strategy = DeBonoHatStrategy("Cappello Bianco", "dati e fatti")
        result = strategy.build("Testo di analisi.")
        assert len(result) == 2
        assert all(isinstance(s, str) for s in result)
 
    def test_system_prompt_contains_hat_name(self):
        strategy = DeBonoHatStrategy("Cappello Rosso", "emozioni")
        system, _ = strategy.build("Testo.")
        assert "Cappello Rosso" in system
 
    def test_user_prompt_contains_focus(self):
        strategy = DeBonoHatStrategy("Cappello Nero", "rischi e criticità")
        _, user = strategy.build("Testo.")
        assert "rischi e criticità" in user
 
    def test_user_prompt_contains_input_text(self):
        strategy = DeBonoHatStrategy("Cappello Verde", "creatività")
        input_text = "Idee innovative per il futuro."
        _, user = strategy.build(input_text)
        assert input_text in user
 
    @pytest.mark.parametrize("hat,focus", [
        ("Cappello Bianco", "dati, fatti e informazioni verificabili"),
        ("Cappello Rosso",  "emozioni, intuizioni e sentimenti"),
        ("Cappello Nero",   "rischi, problemi e criticità"),
        ("Cappello Giallo", "benefici e opportunità"),
        ("Cappello Verde",  "idee nuove e soluzioni creative"),
        ("Cappello Blu",    "organizzazione del processo e prossimi passi"),
    ])
    def test_all_hats(self, hat, focus):
        strategy = DeBonoHatStrategy(hat, focus)
        system, user = strategy.build("Analisi.")
        assert hat in system
        assert focus in user
 
 
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
 
    @pytest.mark.parametrize("key", EXPECTED_KEYS)
    def test_each_strategy_build_works(self, key):
        """Ogni strategia deve produrre due stringhe non vuote."""
        system, user = STRATEGIES[key].build("Testo di prova.")
        assert isinstance(system, str) and len(system) > 0
        assert isinstance(user, str) and len(user) > 0
 
    def test_strategies_are_simpleprompt(self):
        hat_keys = ["summary", "fix_grammar", "rewrite", "distant_writing"]
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

    # --- Stringa vuota ---

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
        strategy = DeBonoHatStrategy("Cappello Bianco", "dati e fatti")
        system, user = strategy.build("")
        assert isinstance(system, str)
        assert isinstance(user, str)

    # --- Solo spazi ---

    def test_simple_prompt_whitespace_only(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi")
        system, user = strategy.build("   \n\n\t")
        assert isinstance(system, str)
        assert isinstance(user, str)

    # --- Testo molto lungo ---

    def test_simple_prompt_very_long_text(self):
        long_text = "parola " * 10000
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi")
        system, user = strategy.build(long_text)
        assert long_text in user

    # --- Caratteri speciali e unicode ---

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

    def test_debono_with_special_characters(self):
        strategy = DeBonoHatStrategy("Cappello Bianco", "dati e fatti")
        text = "Testo con\nnewline e\ttab e 'apici'"
        system, user = strategy.build(text)
        assert text in user

    # --- None come input ---

    def test_simple_prompt_none_raises(self):
        strategy = SimplePromptStrategy("Sei un assistente.", "Riassumi")
        with pytest.raises(TypeError):
            strategy.build(None)

    def test_translation_none_raises(self):
        strategy = TranslationStrategy("inglese")
        with pytest.raises(TypeError):
            strategy.build(None)

    def test_debono_none_raises(self):
        strategy = DeBonoHatStrategy("Cappello Bianco", "dati e fatti")
        with pytest.raises(TypeError):
            strategy.build(None)

    # --- Costruttore con valori vuoti ---

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
        strategy = DeBonoHatStrategy(hat_name="", focus="")
        system, user = strategy.build("Testo.")
        assert isinstance(system, str)
        assert isinstance(user, str)