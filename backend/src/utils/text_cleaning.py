import re

def clean_ai_response(text: str) -> str:
    """Rimuove frasi introduttive tipiche delle risposte AI."""
    patterns_to_remove = [
        r'^Ecco\s+(un|il|la|i)\s+\w+.*?:\s*',
        r'^Ecco\s+.*?:\s*',
        r'^Il\s+riassunto\s+è:\s*',
        r'^La\s+traduzione\s+è:\s*',
        r'^Riassunto:\s*',
        r'^Traduzione:\s*',
        r'^Ecco\s+come\s+.*?:\s*',
        r'^Di seguito\s+.*?:\s*',
        r'^Certamente[,!]?\s+',
        r'^Certo[,!]?\s+',
    ]

    cleaned = text

    for pattern in patterns_to_remove:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    
    cleaned = cleaned.strip()

    # Rimuove eventuali newline iniziali rimasti
    while cleaned.startswith('\n'):
        cleaned = cleaned[1:]
    return cleaned