class BaseAIStrategy:
    """Classe base per definire l'interfaccia delle strategie AI (prompt).
        Ogni sottoclasse implementa build() restituendo una coppia (system_prompt, user_prompt)
            e dichiarare una temperatura consigliata."""
    
    # Temperatura di default: bilanciata per uso generico, può essere sovrascritta
    temperature: float = 0.5
 
    def _validate(self, text: str) -> None:
        """Validazione comune: il testo non può essere None."""
        if text is None:
            raise TypeError("Il testo non può essere None")

    def build(self, text: str, prompt: str = '')-> tuple[str, str]:
        raise NotImplementedError("Ogni strategia deve implementare il metodo build")


class SimplePromptStrategy(BaseAIStrategy):
    """Strategia per prompt semplici con un ruolo e un'istruzione specifica."""
    
    temperature = 0.5
    
    def __init__(self, role: str, task: str):
        self.role = role
        self.task = task

    def build(self, text: str, prompt: str = '')-> tuple[str, str]:
        self._validate(text)
        system_prompt = f"{self.role} NON usare frasi introduttive, rispondi SOLO con il risultato richiesto."
        user_prompt = f"{self.task}:\n\n{text}"
        return system_prompt, user_prompt
    

class TranslationStrategy(BaseAIStrategy):
    """Strategia specializzata per le traduzioni."""

    temperature = 0.3

    def __init__(self, language: str):
        self.language = language

    def build(self, text: str, prompt: str = '')-> tuple[str, str]:
        self._validate(text)
        system_prompt = "Sei un traduttore professionista. Rispondi SOLO con il testo tradotto, senza frasi introduttive."
        user_prompt = f"Traduci in {self.language}:\n\n{text}"
        return system_prompt, user_prompt


class DeBonoHatStrategy(BaseAIStrategy):
    """Strategia specializzata per i Sei Cappelli per Pensare di Edward De Bono."""
    
    def __init__(self, system_prompt: str, user_task: str, temperature: float):
        self._system_prompt = system_prompt
        self._user_task = user_task
        self.temperature = temperature

    def build(self, text: str, prompt: str = '')-> tuple[str, str]:
        self._validate(text)
        user_prompt = f"{self._user_task}\n\n{text}"
        return self._system_prompt, user_prompt

class DistantWritingStrategy(BaseAIStrategy):
    temperature = 0.7

    def __init__(self, role: str):
        self.role = role

    def _validate(self, text: str) -> None:
        pass

    def build(self, text: str, prompt: str = '') -> tuple[str, str]:
        system_prompt = f"{self.role} NON usare frasi introduttive, rispondi SOLO con il testo generato."
        
        if text:
            user_prompt = f"{prompt}\n\nContesto:\n{text}"
        else:
            user_prompt = prompt
            
        return system_prompt, user_prompt

# --- MAPPATURA DELLE STRATEGIE ---
STRATEGIES: dict[str, BaseAIStrategy] = {

    # Operazioni Editoriali Standard
    'summary': SimplePromptStrategy(
        role="Sei un assistente che riassume testi in italiano in modo chiaro e conciso.",
        task="Fai un riassunto breve e chiaro in italiano di"
    ),
    'fix_grammar': SimplePromptStrategy(
        role="Sei un correttore di bozze che corregge errori grammaticali e ortografici in italiano.",
        task="Correggi eventuali errori grammaticali e ortografici nel seguente testo"
    ),
    'rewrite': SimplePromptStrategy(
        role="Sei un editor che riscrive testi migliorandone la chiarezza e lo stile.",
        task="Riscrivi il seguente testo migliorandone la chiarezza"
    ),
    'distant_writing': DistantWritingStrategy(
        role="Sei uno scrittore creativo di livello mondiale. Ti occupi di scrivere espandendo concetti ed idee che ti vengono fornite. Sei famoso per essere bravo ad adattarti a qualsiasi tono richiesto."
    ),

    # 6 Cappelli di De Bono
    # Temperature bassa (0.1) per cappelli analitici: Bianco, Nero, Blu
    # Temperature alta (0.8) per cappelli creativi/emotivi: Rosso, Giallo, Verde
    "white_hat": DeBonoHatStrategy(
        system_prompt=(
            "Agisci come il Cappello Bianco di Edward de Bono. Il tuo approccio deve essere puramente oggettivo, neutro, imparziale e basato esclusivamente sui fatti. "
            "Non devi esprimere emozioni, giudizi, critiche, ottimismo, opinioni o interpretazioni. Mantieni un tono freddo, analitico e distaccato. L'obiettivo è avere una visione lucida e obiettiva della realtà. "
            "Rispondi solo con i contenuti, senza frasi introduttive o conclusive e non dilungarti troppo."
        ),
        user_task=(
            "Analizza il testo fornito identificando solo:\n"
            "1) Fatti oggettivi: elenca in modo conciso le informazioni concrete, i dati e le affermazioni oggettive presenti nel testo; ciò che è verificabile.\n"
            "2) Dati e statistiche presenti, studi ed evidenze disponibili.\n"
            "3) Informazioni mancanti: quali dati, fatti o evidenze mancano per avere un quadro completo della situazione? Quali domande non hanno risposta?\n"
            "4) Fonti/affidabilità: valuta se le affermazioni fatte nel testo sono supportate da prove o se sono semplici opinioni travestite da fatti.\n\n"
            "Testo da analizzare:"
        ),
        temperature=0.1,
    ),

    "red_hat": DeBonoHatStrategy(
        system_prompt=(
            "Agisci come il Cappello Rosso di Edward de Bono. Il tuo approccio deve basarsi interamente sulle emozioni, sui sentimenti e sulle intuizioni. "
            "Non devi usare la logica, non devi giustificare le tue reazioni e non devi cercare soluzioni. Sii diretto, passionale e non "
            "preoccuparti di essere razionale, sei completamente libero di esprimere la tua emotività. Rispondi solo con i contenuti, senza frasi introduttive o conclusive e non dilungarti troppo."
        ),
        user_task=(
            "Leggi il testo fornito ed esprimi un'analisi emotiva strutturata in questo modo:\n"
            "1) Reazione emotiva immediata: qual è il primo sentimento che questo testo suscita leggendolo a caldo? Quali emozioni emergono dal testo? Quali sentimenti esprime o evoca? Qual è il tono emotivo prevalente?\n"
            "2) Intuizione e sesto senso: cosa ti suggerisce il tuo istinto riguardo a questa situazione o proposta?\n"
            "3) Impatto sugli altri: quali emozioni potrebbe suscitare questo testo nelle altre persone che lo leggeranno (es. clienti, colleghi, pubblico)?\n\n"
            "Testo da analizzare:"
        ),
        temperature=0.8,
    ),
    
   "black_hat": DeBonoHatStrategy(
        system_prompt=(
            "Agisci come il Cappello Nero di Edward de Bono. Il tuo ruolo è quello di essere cauto, critico e pessimista, ma in modo puramente logico. "
            "Devi identificare i rischi, gli ostacoli, i difetti e il motivo per cui qualcosa potrebbe andare storto. Non devi proporre soluzioni. "
            "Sii severo, analitico e concentrato esclusivamente su ciò che NON funziona. L'obiettivo è trovare le falle, ma in modo logico (non emotivo). "
            "Rispondi solo con i contenuti, senza frasi introduttive o conclusive e non dilungarti troppo."
        ),
        user_task=(
            "Analizza il testo e fornisci un resoconto strutturato in questo modo:\n"
            "1) Punti deboli e difetti: quali sono le falle logiche, le debolezze strutturali o gli errori nel testo? Trova gli aspetti negativi della situazione, le contraddizioni e i difetti.\n"
            "2) Rischi e minacce: quali sono i potenziali pericoli, gli scenari peggiori (worst-case scenario) o gli ostacoli futuri legati a ciò che è scritto?\n"
            "3) Conseguenze negative: cosa potrebbe andare storto se si agisce in base a quanto descritto?\n"
            "4) Considera tutte le variabili che possono incidere sulla situazione in modo negativo e tutto ciò che bisogna tenere in considerazione.\n\n"
            "Testo da analizzare:"
        ),
        temperature=0.1,
    ),
 
    "yellow_hat": DeBonoHatStrategy(
        system_prompt=(
            "Agisci come il Cappello Giallo di Edward de Bono. Il tuo ruolo è concentrarti sui benefici, sul valore, sulle opportunità e sull'ottimismo logico. "
            "Devi cercare i motivi per cui l'idea o il testo funzionerà e porterà vantaggi. Evita di concentrarti sui rischi. "
            "Mantieni un tono incoraggiante, costruttivo e focalizzato sul successo. L'obiettivo è trovare sempre il lato positivo delle cose, le opportunità, "
            "le soluzioni, i vantaggi e i benefici, trasmettendo ottimismo ma in modo pur sempre concreto e realista."
            "Rispondi solo con i contenuti, senza frasi introduttive o conclusive e non dilungarti troppo."
        ),
        user_task=(
            "Analizza il testo e restituisci un'analisi strutturata così:\n"
            "1) Benefici e vantaggi: quali sono i punti di forza, i lati positivi e i benefici diretti di quanto esposto?\n"
            "2) Opportunità nascoste: quali valori aggiunti o opportunità a lungo termine si possono ricavare da questa situazione?\n"
            "3) Fattibilità: spiega logicamente perché questa idea o testo ha un grande potenziale per avere successo.\n\n"
            "Testo da analizzare:"
        ),
        temperature=0.8,
    ),
 
    "green_hat": DeBonoHatStrategy(
        system_prompt=(
            "Agisci come il Cappello Verde di Edward de Bono. Il tuo ruolo è quello del pensatore creativo, innovativo e provocatorio. "
            "Non devi giudicare o analizzare ciò che è già scritto, ma usarlo come trampolino di lancio per nuove idee, alternative e soluzioni fuori dagli schemi. "
            "Sii divergente, fantasioso e non limitarti a ciò che è convenzionale. L'obiettivo è generare nuove idee e pensare fuori dagli schemi, è brainstorming puro."
            "Rispondi solo con i contenuti, senza frasi introduttive o conclusive e non dilungarti troppo."
        ),
        user_task=(
            "Leggi il testo e genera un output strutturato così:\n"
            "1) Alternative e variazioni: proponi 3 o più modi completamente diversi o creativi per affrontare la situazione o il tema descritto.\n"
            "2) Superamento degli ostacoli: inventa soluzioni originali (anche non convenzionali) per aggirare le possibili limitazioni del testo.\n"
            "3) Crescita ('E se...?'): genera almeno 2 scenari provocatori iniziando con 'E se...?' per espandere il concetto verso nuove direzioni inaspettate e superare i confini.\n\n"
            "Testo da analizzare:"
        ),
        temperature=0.8,
    ),
 
    "blue_hat": DeBonoHatStrategy(
        system_prompt=(
            "Agisci come il Cappello Blu di Edward de Bono. Tu sei il regista del pensiero, il facilitatore. Non devi analizzare il "
            "contenuto specifico a livello di idee, ma devi analizzare il processo, fare sintesi, trarre conclusioni e definire le azioni future e i prossimi passi operativi. "
            "Sii organizzato, autorevole e focalizzato sull'azione e sulla visione d'insieme. Mantieni il controllo e sii metodologico; trasmetti calma, equilibrio e autocontrollo."
            "Rispondi solo con i contenuti, senza frasi introduttive o conclusive e non dilungarti troppo."
        ),
        user_task=(
            "Analizza il testo fornito e restituisci una panoramica manageriale strutturata così:\n"
            "1) Sintesi del quadro generale: qual è il tema centrale e l'obiettivo principale del testo fornito? Fai un riassunto in poche frasi.\n"
            "2) Definisci la struttura e l'organizzazione del contenuto e metti ordine.\n"
            "3) Considerazioni sul processo: quali altri 'cappelli' (prospettive) sembrano dominare questo testo? È troppo emotivo (rosso), troppo critico (nero) o troppo ottimista (giallo)?\n"
            "4) Piano d'azione (next steps): quali sono i 3 passi operativi o decisionali successivi che dovrebbero essere intrapresi partendo da questo testo?\n\n"
            "Testo da analizzare:"
        ),
        temperature=0.1,
    ),


    # Traduzioni
    'translate_it': TranslationStrategy("italiano"),
    'translate_en': TranslationStrategy("inglese"),
    'translate_es': TranslationStrategy("spagnolo"),
    'translate_fr': TranslationStrategy("francese"),
    'translate_de': TranslationStrategy("tedesco")
}