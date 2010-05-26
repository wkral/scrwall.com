import json
from google.appengine.ext import webapp

def get_json(obj, keys):
    obj_map = {}
    for key in keys:
        obj_map[key] = getattr(obj, key, default='')
    return json.dumps(obj_map)
