from webtest import TestApp
from feedback_view import application
from helper import *
import feedback
import re

app = TestApp(application())



class TestFeedback():
    def setup(self):
        self.fb1 = feedback.create('William', 'fake@gmail.com', 'This is a test comment')
        self.fb2 = feedback.create('Blaine', 'fakeblaine@gmail.com', 'This is another test comment')
    def teardown(self):
        clean_db()
    def test_latest(self):
        response = app.get('/feedback')
        assert 'This is a test comment' in str(response), 'find first comment'
        assert 'fake@gmail.com' in str(response), 'find first email'
        assert 'William' in str(response), 'find first name'
        assert 'This is another test comment' in str(response), 'find second comment'
    def test_individual(self):
        response = app.get('/feedback/%d' % self.fb1.id)
        assert 'This is a test comment' in str(response), 'find first comment'
        assert 'fake@gmail.com' in str(response), 'find first email'
        assert 'William' in str(response), 'find first name'
