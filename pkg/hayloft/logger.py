import requests
from nanoid import generate
from typing import Literal


def logger():
    session = f"session-{generate(size=6)}"

    def log(
        title: str = "",
        message: str = "",
        type: Literal["info", "error", "prompt", "completion"] = "info",
    ) -> None:
        requests.post(
            "http://localhost:7000/event",
            json={"session": session, "title": title, "message": message, "type": type},
        )

    return log
