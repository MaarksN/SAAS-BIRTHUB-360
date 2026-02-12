from services.guardrails import OutputValidator, GuardrailViolation

def test_guardrails():
    validator = OutputValidator()

    # Test Blocked Term
    try:
        validator.validate("You win free money today!")
        print("FAIL: Blocked term not caught")
    except GuardrailViolation as e:
        print(f"PASS: Caught blocked term: {e}")

    # Test PII
    try:
        validator.validate("My email is test@example.com", strict_mode=True)
        print("FAIL: PII not caught")
    except GuardrailViolation as e:
        print(f"PASS: Caught PII: {e}")

    # Test Clean
    try:
        validator.validate("Hello, I would like to discuss sales.")
        print("PASS: Valid text accepted")
    except Exception as e:
        print(f"FAIL: Valid text rejected: {e}")

if __name__ == "__main__":
    test_guardrails()
