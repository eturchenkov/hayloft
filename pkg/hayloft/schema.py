from peewee import SqliteDatabase, CharField, IntegerField, Model, ForeignKeyField
from pathlib import Path

path = str(Path(__file__).parent.resolve()) 
db = SqliteDatabase(f'{path}/store.db')

class Session(Model):
    name = CharField(unique=True)
    created_at = IntegerField()

    class Meta:
        database = db
        table_name = 'sessions'

class Event(Model):
    session = ForeignKeyField(Session, backref='events')
    title = CharField()
    message = CharField()
    type = CharField()

    class Meta:
        database = db
        table_name = 'events'

