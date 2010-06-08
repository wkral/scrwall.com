from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
import walls
import json
import logging

class ResourceHandler(webapp.RequestHandler):
    def respond_created(self, uri):
        self.response.set_status(201)
        self.response.headers['Location'] = uri
        self.response.out.write('')
    def respond_json(self, obj):
        self.response.set_status(200)
        self.response.headers['Content-Type'] = 'text/json'
        self.response.out.write(utils.get_json(obj, obj.__json_keys__()));
    def respond_bad_request(self, message):
        self.response.set_status(400, message)
    def respond_ok(self):
        self.response.set_status(200)

def wall_uri(wall):
    return '/res/collections/%s' % wall.unique_id

def item_uri(item):
    return '/res/collections/%s/items/%s' % (item.wall.unique_id, item.id)

class WallsResource(ResourceHandler):
    def get(self):
        map(wall_uri, walls.get_latest(10))
    def post(self):
        wall_obj = json.loads(self.request.body)
        wall = walls.create(wall['name'])
        self.respond_created(wall_uri(wall))

class WallResource(ResourceHandler):
    def get(self, wall_id):
        self.respond_json(walls.fetch(wall_id))
    def put(self, wall_id):
        try:
            wall_obj = json.loads(self.request.body)        
            wall = walls.fetch(wall_id)
            wall.name = wall_obj['name']
            wall.put()
            self.respond_ok()
        except ValueError:
            self.respond_bad_request('Request did not contain JSON')

class ItemsResource(ResourceHandler):
    def post(self, wall_id):
        try:
            wall_obj = json.loads(self.request.body)
        except ValueError:
            self.respond_bad_request('Request did not contain JSON')
        try:
            item = walls.add_url(wall_id, wall_obj['url'])
            self.respond_created(item_uri(item))
        except ValueError:
            self.respond_bad_request('Url was malformed')
urls = [
    ('/res/collections/(.*)/items', ItemsResource),
#    ('/res/collections/(.*)/items/(.*)', ItemResource),
    ('/res/collections', WallsResource),
    ('/res/collections/(.*)', WallResource)
]

def application():
    return webapp.WSGIApplication(urls, debug=True)

def main():
    run_wsgi_app(application())

if __name__ == '__main__':
    main()
