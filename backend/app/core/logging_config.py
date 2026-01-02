import logging
from logging.handlers import RotatingFileHandler
import sys

def setup_logging():

    import os
    os.makedirs("logs", exist_ok=True)
    
    logger = logging.getLogger("scent_memory")
    logger.setLevel(logging.INFO)
    

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_format)
    

    file_handler = RotatingFileHandler(
        'logs/app.log',
        maxBytes=10*1024*1024, 
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    file_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    file_handler.setFormatter(file_format)
    

    error_handler = RotatingFileHandler(
        'logs/error.log',
        maxBytes=10*1024*1024,
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_format)
    
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)
    
    return logger

audit_logger = logging.getLogger("security_audit")
audit_logger.setLevel(logging.INFO)
audit_handler = RotatingFileHandler('logs/security.log', maxBytes=10*1024*1024, backupCount=10)
audit_handler.setFormatter(logging.Formatter(
    '%(asctime)s - SECURITY - %(message)s'
))
audit_logger.addHandler(audit_handler)