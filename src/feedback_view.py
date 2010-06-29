from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp
import feedback
from datetime import datetime
from utils import Handler
from model import Feedback

class FeedbackList(Handler):
    def get(self):
        self.respond('feedback.html', {'feedback': feedback.latest(100)})

class FeedbackItem(Handler):
    def get(self, fb_id):
        self.respond('feedback_item.html', {'feedback': feedback.fetch(int(fb_id))})

urls = [
    ('/feedback/(.*)', FeedbackItem),
    ('/feedback', FeedbackList)
]

def application():
    return webapp.WSGIApplication(urls, debug=True)

def main():
    run_wsgi_app(application())

if __name__ == '__main__':
    main()
