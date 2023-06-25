import logging
from typing import Literal

import requests
from nanoid import generate

main_logger = logging.getLogger(__name__)

def logger(server="http://localhost:7000"):
    session = f"session-{generate(size=6)}"

    def log(
        title: str = "",
        message: str = "",
        type: Literal["info", "prompt", "completion", "warning", "error"] = "info",
    ) -> None:
        try:
            requests.post(
                f"{server}/event",
                json={"session": session, "title": title, "message": message, "type": type},
            )
        except requests.exceptions.ConnectionError:
            main_logger.info("Hayloft didn't start")

    return log
