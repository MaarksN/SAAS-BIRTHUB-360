import re
from typing import List, Dict, Any

class GuardrailViolation(Exception):
    pass

class OutputValidator:
    def __init__(self):
        self.blocked_terms = ["guarantee", "100%", "free money", "act now", "secret"]
        self.pii_patterns = [
            r"\b\d{3}-\d{2}-\d{4}\b", # SSN-like
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b" # Email (if strict, usually we allow emails in B2B)
        ]

    def validate(self, text: str, strict_mode: bool = False):
        """
        Checks text for blocked terms and PII.
        Raises GuardrailViolation if checks fail.
        """
        # 1. Blocked Terms
        for term in self.blocked_terms:
            if term in text.lower():
                raise GuardrailViolation(f"Output contains blocked term: '{term}'")

        # 2. PII Check (Mock for now, usually use Presidio)
        if strict_mode:
            for pattern in self.pii_patterns:
                if re.search(pattern, text):
                    raise GuardrailViolation("Output contains potential PII")

        return True

    def sanitize(self, text: str) -> str:
        """
        Attempts to fix the output (e.g. replace profanity).
        """
        # Simple example replacement
        clean_text = text.replace("damn", "****")
        return clean_text
