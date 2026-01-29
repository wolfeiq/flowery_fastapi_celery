import logging
import sys
from app.core.config import settings

def setup_logging():
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    logger = logging.getLogger("scent_memory")
    logger.setLevel(log_level)
    
    return logger

audit_logger = logging.getLogger("security_audit")
audit_logger.setLevel(logging.INFO)
audit_handler = logging.StreamHandler(sys.stdout)
audit_handler.setFormatter(logging.Formatter(
    '%(asctime)s - SECURITY - %(message)s'
))
audit_logger.addHandler(audit_handler)
