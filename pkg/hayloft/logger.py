import logging
import requests
from nanoid import generate
from typing import Literal
from hayloft.app import curr_session

main_logger = logging.getLogger(__name__)

def logger(server="http://localhost:7000"):
    session = f"session-{generate(size=6)}"

    def log(
        title: str = "",
        message: str = "",
        type: Literal["info", "prompt", "completion", "warning", "error"] = "info",
    ) -> None:
        session_name = curr_session if curr_session is not None else session
        try:
            requests.post(
                f"{server}/event",
                json={"session": session_name, "title": title, "message": message, "type": type},
            )
        except requests.exceptions.ConnectionError:
            main_logger.info("Hayloft didn't start")

    return log
