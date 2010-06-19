from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from django.template import TemplateDoesNotExist
import walls
import logging

# add convienience method to save some code
class Handler(webapp.RequestHandler):
    def respond(self, file, values):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write(template.render('templates/%s' % file, values))
    def respond_not_found(self):
        self.response.set_status(404)

class NewWall(Handler):
    def post(self):
        wall = walls.create()
        self.redirect('/c/%s' % wall.unique_id)

class Wall(Handler):
    def get(self, wall_id):
        wall = walls.fetch(wall_id)
        if wall:
            self.respond('wall.html', {'wall': wall})
        else:
            self.respond_not_found()

class HomePage(Handler):
    def get(self):
        self.respond('index.html', {'latest': walls.get_latest(10)})

class OtherPages(Handler):
    def get(self, name):
        try:
            self.respond(name + '.html', {})
        except TemplateDoesNotExist:
            self.respond_not_found()

urls = [
    ('/c', NewWall),
    ('/c/(.*)', Wall),
    ('/', HomePage),
    ('/([^./#]*)', OtherPages)
]

def application():
    return webapp.WSGIApplication(urls, debug=True)

def main():
    run_wsgi_app(application())

if __name__ == '__main__':
    main()
