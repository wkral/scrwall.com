from google.appengine.ext import db

class Wall(db.Model):
    name = db.StringProperty(required=True)
    urls = db.StringListProperty()
    unique_id = db.StringProperty()
