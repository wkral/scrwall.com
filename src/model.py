from google.appengine.ext import db

class Wall(db.Model):
    name = db.StringProperty()
    name_set = db.BooleanProperty()
    unique_id = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    item_count = db.IntegerProperty()
    def __json_keys__(self):
        return ['name', 'create', 'item_count']

class WallItem(db.Model):
    id = db.IntegerProperty()
    url = db.StringProperty(required=True)
    wall = db.ReferenceProperty(Wall, collection_name='items')
    def __json_keys__(self):
        return ['url']

class Feedback(db.Model):
    name = db.StringProperty()
    email = db.EmailProperty()
    comment = db.TextProperty()

