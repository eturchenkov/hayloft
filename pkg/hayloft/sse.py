import queue
import json

class SSE:
    def __init__(self):
        self.listeners = []

    def listen(self):
        self.listeners.append(queue.Queue(maxsize=10))
        return self.listeners[-1]

    def publish(self, message: dict, type: str):
        msg = f"data: {json.dumps(message)}\n\n"
        payload = f"event: {type}\n{msg}"

        for i in reversed(range(len(self.listeners))):
            try:
                self.listeners[i].put_nowait(payload)
            except queue.Full:
                del self.listeners[i]


sse = SSE()


