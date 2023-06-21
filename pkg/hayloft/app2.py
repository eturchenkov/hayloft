from gevent import monkey; monkey.patch_all()
from gevent import sleep
from bottle import app, request, response, GeventServer
from bottle_cors_plugin import cors_plugin
from importlib.metadata import version
from schema2 import db, Session, Event
from typing import Dict
from sse import sse
import time

app = app()
app.install(cors_plugin("*"))

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
    yield 'retry: 100\n\n' 
    messages = sse.listen()
    
    while True:
        msg = messages.get()
        yield msg
        sleep(0.05)

if __name__ == '__main__':
    db.connect()
    db.create_tables([Session, Event])

    print('\033[96mHayloft starting up, open in your browser http://localhost:7000\033[0m')
    print("Hit Ctrl-C to quit.")
    app.run(host='localhost', port=7000, server=GeventServer, quiet=True)
