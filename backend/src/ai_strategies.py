# ai_strategies.py

class BaseAIStrategy:
    """Classe base per definire l'interfaccia delle strategie AI."""
    def build(self, text):
        raise NotImplementedError("Ogni strategia deve implementare il metodo build")

class SimplePromptStrategy(BaseAIStrategy):
    """Strategia per prompt semplici con un ruolo e un'istruzione specifica."""
    def __init__(self, role, task):
        self.role = role
        self.task = task

    def build(self, text):
        system_prompt = f"{self.role} NON usare frasi introduttive, rispondi SOLO con il risultato richiesto."
        user_prompt = f"{self.task}:\n\n{text}"
        return system_prompt, user_prompt

class TranslationStrategy(BaseAIStrategy):
    """Strategia specializzata per le traduzioni."""
    def __init__(self, language):
        self.language = language

    def build(self, text):
        system_prompt = "Sei un traduttore professionista. Rispondi SOLO con il testo tradotto, senza frasi introduttive."
        user_prompt = f"Traduci in {self.language}:\n\n{text}"
        return system_prompt, user_prompt

class DeBonoHatStrategy(BaseAIStrategy):
    """Strategia specializzata per i Sei Cappelli per Pensare."""
    def __init__(self, hat_name, focus):
        self.hat_name = hat_name
        self.focus = focus

    def build(self, text):
        system_prompt = f"Sei un analista che usa il metodo dei Sei Cappelli di De Bono. Stai indossando il {self.hat_name}."
        user_prompt = f"Analizza il seguente testo concentrandoti su {self.focus}:\n\n{text}"
        return system_prompt, user_prompt

# --- MAPPATURA DELLE STRATEGIE ---

STRATEGIES = {
    # Operazioni Editoriali Standard
    'summary': SimplePromptStrategy(
        "Sei un assistente che riassume testi in italiano in modo chiaro e conciso.",
        "Fai un riassunto breve e chiaro in italiano di"
    ),
    'fix_grammar': SimplePromptStrategy(
        "Sei un correttore di bozze che corregge errori grammaticali e ortografici in italiano.",
        "Correggi eventuali errori grammaticali e ortografici nel seguente testo"
    ),
    'rewrite': SimplePromptStrategy(
        "Sei un editor che riscrive testi migliorandone la chiarezza e lo stile.",
        "Riscrivi il seguente testo migliorandone la chiarezza"
    ),
    'distant_writing': SimplePromptStrategy(
        "Sei uno scrittore creativo che espande idee e concetti.",
        "Espandi e sviluppa il seguente concetto in un testo più articolato"
    ),

    # Cappelli di De Bono
    'white_hat': DeBonoHatStrategy("Cappello Bianco", "dati, fatti e informazioni verificabili"),
    'red_hat':   DeBonoHatStrategy("Cappello Rosso", "emozioni, intuizioni e sentimenti"),
    'black_hat': DeBonoHatStrategy("Cappello Nero", "rischi, problemi e criticità"),
    'yellow_hat': DeBonoHatStrategy("Cappello Giallo", "benefici e opportunità"),
    'green_hat':  DeBonoHatStrategy("Cappello Verde", "idee nuove e soluzioni creative"),
    'blue_hat':   DeBonoHatStrategy("Cappello Blu", "organizzazione del processo e prossimi passi"),

    # Traduzioni
    'translate_it': TranslationStrategy("italiano"),
    'translate_en': TranslationStrategy("inglese"),
    'translate_es': TranslationStrategy("spagnolo"),
    'translate_fr': TranslationStrategy("francese"),
    'translate_de': TranslationStrategy("tedesco"),
    'translate_zh': TranslationStrategy("cinese mandarino"),
}