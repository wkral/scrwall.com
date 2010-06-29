from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
import walls
import feedback
from django.utils import simplejson as json
import logging
import utils

class ResourceHandler(webapp.RequestHandler):
    def respond_created(self, uri):
        self.response.set_status(201)
        self.response.headers['Location'] = uri
        self.response.out.write('')
    def respond_json(self, obj):
        self.response.set_status(200)
        self.response.headers['Content-Type'] = 'text/json'
        self.response.out.write(utils.get_json(obj, obj.__json_keys__()));
    def respond_list(self, lst):
        self.response.set_status(200)
        self.response.headers['Content-Type'] = 'text/json'
        output = json.dumps(lst)
        self.response.out.write(output.replace('\\/', '/'))
    def respond_bad_request(self, message):
        self.response.set_status(400, message)
    def respond_not_found(self):
        self.response.set_status(404)
    def respond_ok(self):
        self.response.set_status(200)

def wall_uri(wall):
    return '/res/collections/%s' % wall.unique_id

def item_uri(item):
    return '/res/collections/%s/items/%d' % (item.wall.unique_id, item.id)

def feedback_uri(feedback):
    return '/res/feedback/%s' % feedback.id

class WallsResource(ResourceHandler):
    def get(self):
        wall_list = map(wall_uri, walls.get_latest(10))
        self.respond_list(wall_list)
    def post(self):
        try:
            wall_obj = json.loads(self.request.body)
            wall = walls.create(wall_obj['name'])
            self.respond_created(wall_uri(wall))
        except ValueError:
            self.respond_bad_request('Request did not contain valid JSON')

class WallResource(ResourceHandler):
    def get(self, wall_id):
        w = walls.fetch(wall_id)
        if w:
            self.respond_json(w)
        else:
            self.respond_not_found()
    def put(self, wall_id):
        try:
            wall_obj = json.loads(self.request.body) 
            wall = walls.fetch(wall_id)
            wall.name = wall_obj['name']
            wall.name_set = True
            wall.put()
            self.respond_ok()
        except ValueError:
            self.respond_bad_request('Request did not contain valid JSON')

class ItemsResource(ResourceHandler):
    def post(self, wall_id):
        try:
            wall_obj = json.loads(self.request.body)
            try:
                item = walls.add_url(wall_id, wall_obj['url'])
                self.respond_created(item_uri(item))
            except ValueError:
                self.respond_bad_request('Url was malformed')
        except ValueError:
            self.respond_bad_request('Request did not contain valid JSON')

class FeedbackResource(ResourceHandler):
    def post(self):
        try:
            fb_obj = json.loads(self.request.body)
            fb = feedback.create(fb_obj['comment'], fb_obj['name'], fb_obj['email'])
            self.respond_created(feedback_uri(fb))
        except ValueError:
            self.respond_bad_request('Request did not contain valid JSON')

urls = [
    ('/res/collections/(.*)/items', ItemsResource),
#    ('/res/collections/(.*)/items/(.*)', ItemResource),
    ('/res/collections', WallsResource),
    ('/res/collections/(.*)', WallResource),
    ('/res/feedback', FeedbackResource)
]

def application():
    return webapp.WSGIApplication(urls, debug=True)

def main():
    run_wsgi_app(application())

if __name__ == '__main__':
    main()
