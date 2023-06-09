from flask import request, jsonify, send_file, send_from_directory, Response
from flask_cors import CORS
from schema import app, db, sse, Event, Session
import time

CORS(app) # for development

@app.route('/', methods=['GET'])
def index():
    return send_file('public/index.html') 

@app.route('/assets/<path:path>', methods=['GET'])
def serve_assets(path):
    return send_from_directory('public/assets', path) 

@app.route('/event', methods=['POST'])
def create_event():
    body = request.get_json()
    title = body['title']
    message = body['message']
    type = body['type']
    event: Event | None = None
    sess: Session | None = None

    try:
        session = db.session.execute(
                    db.select(Session).filter_by(name=body['session'])
                ).scalar_one()
        event = Event(
            title=title, 
            message=message, 
            type=type, 
            session_id=session.id)
        db.session.add(event)
    except:
        created_at = int(time.time() * 1000)
        event = Event(title=title, message=message, type=type)
        sess = Session(name=body['session'], created_at=created_at, events=[event]) 
        db.session.add(sess)
    db.session.commit()
    msg: dict
    if sess is not None:
        msg = {"session": {"id": sess.id, "name": sess.name, "created_at": sess.created_at}, "event": None}
    else:   
        msg = {
                "event":{
                    "id": event.id, 
                    "title": event.title, 
                    "message": event.message, 
                    "type": event.type, 
                    "session_id": event.session_id
                    }, 
                "session": None
            }
    sse.publish(msg, type="stream")
    return "OK" 

 
@app.route('/sessions', methods=['GET'])
def get_sessions():
    sessions = db.session.execute(db.select(Session)).scalars()
    return jsonify([{"id": s.id, "name": s.name, "created_at": s.created_at} for s in sessions])

@app.route('/sessions', methods=['DELETE'])
def remove_sessions():
    # todo it via cascade later
    db.session.query(Session).delete()
    db.session.query(Event).delete()
    db.session.commit()
    return "" 

@app.route('/sessions/<int:session_id>/events', methods=['GET'])
def get_events(session_id):
    events = db.session.execute(db.select(Event).filter_by(session_id=session_id)).scalars()
    return jsonify([{"id": e.id, "title": e.title, "message": e.message, "type": e.type} for e in events])

@app.route('/listen', methods=['GET'])
def listen():
    def stream():
        messages = sse.listen()
        while True:
            msg = messages.get()
            yield msg
    return Response(stream(), mimetype='text/event-stream')
