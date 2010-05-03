from google.appengine.ext import db

class Wall(db.Model):
    name = db.StringProperty(required=True)
    unique_id = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)

class WallItem(db.Model):
    url = db.StringProperty(required=True)
    wall = db.ReferenceProperty(Wall, collection_name='items')