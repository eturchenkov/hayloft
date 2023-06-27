from gevent import monkey; monkey.patch_all()
import argparse
import time
from importlib.metadata import version
from pathlib import Path
from typing import Dict
from bottle import GeventServer, app, request, response, static_file
from bottle_cors_plugin import cors_plugin
from schema import Event, Session, db
from sse import sse

app = app()
app.install(cors_plugin("*"))
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

@app.route('/sessions', methods=['GET', 'OPTIONS'])
def get_sessions():
    sessions = Session.select()
    return {"sessions": [{"id": s.id, "name": s.name, "created_at": s.created_at} for s in sessions]} 

@app.put("/sessions/<session_id:int>")
def update_session(session_id):
    body = request.json
    session_name = body.get("name")
    try:
        session = Session.select().where(Session.id == session_id).get()
        session.name = session_name
        session.save()
        return {"id": session.id, "name": session.name, "created_at": session.created_at}
    except:
        return {}

@app.delete("/sessions/<session_id:int>")
def remove_session(session_id):
    try:
        session = Session.get(Session.id == session_id) 
        session.delete_instance(recursive=True)
        return {"id": session_id}
    except:
        return {"id": 0}
    

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

def start(host="localhost", port=7000):
    db.connect()
    db.create_tables([Session, Event])

    print(f'\033[96mHayloft {version(__package__)} starting up, open in your browser http://{host}:{port}\033[0m')
    print("Hit Ctrl-C to quit.")
    app.run(host=host, port=port, server=GeventServer, quiet=True)

def cli():
    parser = argparse.ArgumentParser(description="Hayloft - UI tool for LLM frameworks")
    parser.add_argument("command", type=str, help="command to run", choices=["start"])
    parser.add_argument("-v", "--version", action="version", version=version(__package__))
    parser.add_argument("--host", help="host of the hayloft server", default="localhost")
    parser.add_argument("--port", help="port of the hayloft server", type=int, default=7000)
    args = parser.parse_args()

    if args.command == "start":
        start(host=args.host, port=args.port)

if __name__ == '__main__':
    start()
