from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
import walls
import utils
import logging

def log(msg):
    assert False, msg

# add convienience method to save some code
class Handler(webapp.RequestHandler):
    def respond(self, file, values):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write(template.render('templates/%s' % file, values))
    def respons_json(self, obj, keys):
        self.response.headers['Content-Type'] = 'text/json'
        self.response.out.write(utils.get_json(obj, keys));

class NewWall(Handler):
    def post(self):
        wall = walls.create('Untitled Collection')
        self.redirect('/c/%s' % wall.unique_id)

class Wall(Handler):
    def get(self, wall_id):
        wall = walls.find(wall_id)
        self.respond('wall.html', {'wall': wall})
    def post(self, wall_id):
        logging.warn(str(self.request))
        logging.warn(str(self.request.arguments()))
        wall = walls.rename(wall_id, self.request.get('name'))
        self.respons_json(wall, ['name', 'unique_id', 'create'])

class HomePage(Handler):
    def get(self):
        self.respond('index.html', {'latest': walls.get_latest(10)})

urls = [
    ('/c', NewWall),
    ('/c/(.*)', Wall),
    ('/', HomePage)
]

def application():
    return webapp.WSGIApplication(urls, debug=True)

def main():
    run_wsgi_app(application())

if __name__ == '__main__':
    main()
