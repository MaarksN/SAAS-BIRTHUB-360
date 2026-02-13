import logging
import sys
import json
from .context import get_context_dict

class JsonFormatter(logging.Formatter):
    """
    Formatter that outputs JSON strings with context.
    """
    def format(self, record):
        context = get_context_dict()

        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "request_id": context.get("request_id"),
            "user_id": context.get("user_id"),
            "org_id": context.get("org_id"),
        }

        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_record)

def setup_logger(name: str = "ai_agents", level: int = logging.INFO):
    """
    Configures and returns a logger with JSON formatting and Context injection.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Prevent adding multiple handlers if setup is called multiple times
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)

    return logger

# Default logger instance
logger = setup_logger()
