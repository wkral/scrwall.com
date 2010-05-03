from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template


# add convienience method to save some code
class Handler(webapp.RequestHandler):
    def respond(self, file, values):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write(template.render('templates/%s' % file, values))


class HomePage(Handler):
    def get(self):
        self.respond('index.html', {})

urls = [('/', HomePage)]

def application():
    return webapp.WSGIApplication(urls, debug=True)

def main():
    run_wsgi_app(application())

if __name__ == '__main__':
    main()
