import logging
import requests
from bottle import app, request
from bottle_cors_plugin import cors_plugin
from hayloft.logger import logger
from typing import Callable, Any

class HayloftLogger(logging.Handler):
    def __init__(self, server="http://localhost:7000"):
        super().__init__()
        self.log = logger(server=server)
    
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

def grab_logs(server="http://localhost:7000"):
    logging.getLogger("llama_index").setLevel(logging.DEBUG)
    logging.getLogger().addHandler(HayloftLogger(server=server))

def listen(fn: Callable[[str], Any], server="http://localhost:7000"):
    grab_logs(server=server)
    server = app()
    server.install(cors_plugin("*"))

    @server.post("/start")
    def start_session():
        body = request.json
        fn(body.get("input"))
        return True 

    server.run(host="localhost", port=7001, quiet=True)
    requests.get(f"{server}/live")

