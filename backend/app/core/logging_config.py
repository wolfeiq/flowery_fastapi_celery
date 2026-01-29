import logging
import sys
from app.core.config import settings

def setup_logging():
    """
    Setup logging configuration.
    For production/Railway, logs go to stdout (Railway captures these).
    For development, you can add file handlers if needed.
    """
    
    # Set log level based on environment
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Create and return logger for the app
    logger = logging.getLogger("scent_memory")
    logger.setLevel(log_level)
    
    return logger

# Create audit logger that also goes to stdout
audit_logger = logging.getLogger("security_audit")
audit_logger.setLevel(logging.INFO)
audit_handler = logging.StreamHandler(sys.stdout)
audit_handler.setFormatter(logging.Formatter(
    '%(asctime)s - SECURITY - %(message)s'
))
audit_logger.addHandler(audit_handler)
