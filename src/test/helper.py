from google.appengine.ext import db
from model import *

def clean_db():
    db.delete(Wall.all().fetch(1000))
    db.delete(WallItem.all().fetch(1000))
    db.delete(Feedback.all().fetch(1000))

def assert_status(response, expected):
    assert '%d' % expected in response.status, 'expecting response: %d' % expected
