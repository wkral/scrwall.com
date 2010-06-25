from django.utils import simplejson 
from google.appengine.ext import webapp
from datetime import datetime

def iso_date(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()

def get_json(obj, keys):
    obj_map = {}
    for key in keys:
        obj_map[key] = getattr(obj, key, '')
    encoder = simplejson.JSONEncoder()
    encoder.default = iso_date
    return encoder.encode(obj_map)
