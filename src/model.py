from google.appengine.ext import db

class Wall(db.Model):
    name = db.StringProperty(required=True)
    urls = db.ListProperty(db.Link)
    unique_id = db.StringProperty()
    
