from gevent import monkey; monkey.patch_all()
from bottle import app, static_file, request, response, GeventServer
from hayloft.schema import db, Session, Event
from hayloft.cors import EnableCors
from hayloft.sse import sse
from importlib.metadata import version
from pathlib import Path
from typing import Dict
import argparse
import time

app = app()
app.install(EnableCors()) 
path = str(Path(__file__).parent.resolve()) 

@app.get("/")
def index():
    return static_file("index.html", root=f"{path}/public")

@app.get("/assets/<file:path>")
def serve_assets(file):
    return static_file(file, root=f"{path}/public/assets")

@app.post("/event")
def create_event():
    body = request.json
    session_name = body.get("session")
    title = body.get("title")
    message = body.get("message")
    type = body.get("type")
    event: Event | None = None
    new_session: Session | None = None

    try:
        session = Session.select().where(Session.name == session_name).get()
        event = Event.create(session=session, title=title, message=message, type=type)
    except:
        created_at = int(time.time() * 1000)
        new_session = Session.create(name=session_name, created_at=created_at)
        event = Event.create(session=new_session, title=title, message=message, type=type)
    msg: Dict
    if new_session is not None:
        msg = {
            "session": {
                "id": new_session.id,
                "name": new_session.name,
                "created_at": new_session.created_at,
            },
            "event": None,
        }
    else:
        msg = {
            "event": {
                "id": event.id,
                "title": event.title,
                "message": event.message,
                "type": event.type,
                "session_id": event.session.id,
            },
            "session": None,
        }
    sse.publish(msg, type="stream")
    return "OK"

@app.get('/sessions')
def get_sessions():
    sessions = Session.select()
    return {"sessions": [{"id": s.id, "name": s.name, "created_at": s.created_at} for s in sessions]} 

@app.get("/sessions/<session_id:int>/events")
def get_events(session_id):
    events = Event.select().where(Event.session_id == session_id)
    return { 
        "events": [
            {"id": e.id, "title": e.title, "message": e.message, "type": e.type}
            for e in events
        ]
    }

@app.get("/listen")
def listen():
    response.set_header("Content-Type", "text/event-stream")
    response.set_header("Cache-Control", "no-cache")
    yield 'retry: 500\n\n' 
    messages = sse.listen()
    
    while True:
        msg = messages.get()
        yield msg

def start():
    db.connect()
    db.create_tables([Session, Event])

    print(f'\033[96mHayloft {version(__package__)} starting up, open in your browser http://localhost:7000\033[0m')
    print("Hit Ctrl-C to quit.")
    app.run(host='localhost', port=7000, server=GeventServer, quiet=True)

def cli():
    parser = argparse.ArgumentParser(description="Hayloft - UI tool for LLM frameworks")
    parser.add_argument("command", type=str, help="command to run", choices=["start"])
    parser.add_argument("-v", "--version", action="version", version=version(__package__))
    args = parser.parse_args()

    if args.command == "start":
        start()

if __name__ == '__main__':
    start()
