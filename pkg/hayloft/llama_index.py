import logging
from hayloft.logger import logger

class HayloftLogger(logging.Handler):
    def __init__(self):
        super().__init__()
        self.log = logger()
    
    def emit(self, record):
        type = "info"
        if record.levelno == logging.ERROR or record.levelno == logging.CRITICAL:
            type = "error"
        elif record.levelno == logging.WARNING:
            type = "warning"
        elif record.name.startswith("llama_index.llm_predictor"):
            type = "completion"
        elif record.name.startswith("llama_index.indices.response"):
            type = "completion" if record.msg.find(" response: ") != -1 else "prompt"

        self.log(title=record.name, message=record.msg, type=type)

def load_hayloft():
    logging.getLogger("llama_index").setLevel(logging.DEBUG)
    logging.getLogger().addHandler(HayloftLogger())
