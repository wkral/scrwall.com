from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
import walls
import logging

# add convienience method to save some code
class Handler(webapp.RequestHandler):
    def respond(self, file, values):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write(template.render('templates/%s' % file, values))

class NewWall(Handler):
    def post(self):
        wall = walls.create('Untitled Collection')
        self.redirect('/c/%s' % wall.unique_id)

class Wall(Handler):
    def get(self, wall_id):
        wall = walls.fetch(wall_id)
        self.respond('wall.html', {'wall': wall})

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
