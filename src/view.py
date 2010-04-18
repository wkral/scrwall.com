from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp

class HomePage(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write('Home Page')

urls = [('/', HomePage)]

def application():
    return webapp.WSGIApplication(urls, debug=True)

def main():
    run_wsgi_app(application())

if __name__ == '__main__':
    main()
