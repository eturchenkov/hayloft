from peewee import SqliteDatabase, CharField, IntegerField, Model, ForeignKeyField

db = SqliteDatabase('store.db')

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

