from django.utils import simplejson 
from google.appengine.ext import webapp
from datetime import datetime
from google.appengine.ext.webapp import template

# add convienience method to save some code
class Handler(webapp.RequestHandler):
    def respond(self, file, values):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write(template.render('templates/%s' % file, values))
    def respond_not_found(self):
        self.response.set_status(404)


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
