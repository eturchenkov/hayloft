import queue
import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///store.sqlite'
db = SQLAlchemy(app)

class Session(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True, index=True)
    name = db.Column(db.String(), unique=True)
    created_at = db.Column(db.Integer())
    events = db.relationship('Event', backref='session', passive_deletes=True)

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True, index=True)
    title = db.Column(db.String())
    message = db.Column(db.String())
    type = db.Column(db.String())
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id', ondelete="CASCADE"))

class SSE:
    def __init__(self):
        self.listeners = [] 
    def listen(self):
        self.listeners.append(queue.Queue(maxsize=10))
        return self.listeners[-1]
    def publish(self, message: dict, type: str):
        msg = f'data: {json.dumps(message)}\n\n' 
        payload = f'event: {type}\n{msg}'

        for i in reversed(range(len(self.listeners))):
            try:
                self.listeners[i].put_nowait(payload)
            except queue.Full:
                del self.listeners[i]

sse = SSE()

with app.app_context():
    db.create_all()
