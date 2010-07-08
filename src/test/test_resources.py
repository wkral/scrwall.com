from webtest import TestApp
from resources import application
import re
from helper import *
import walls

app = TestApp(application())

WALL_NAME = 'Test Wall'
wall_json = '''
{
    "name": "wall1"
}
'''
put_json = '''
{
    "name": "%s",
    "unique_id": "%s",
    "created": "%s"
}
'''
good_item = '''
{
    "url": "http://validurl.com"
}
'''
bad_item = '''
{
    "url": "This is not a url"
}
'''
feedback_json = '''
{
    "name": "William",
    "email": "fake@test.com",
    "comment": "you guys screwed it up"
}
'''

feedback_missing = '''
{
    "name": "",
    "email": "",
    "comment": "I like it"
}
'''

class TestWalls():

    def setup(self):
        self.wall = walls.create(WALL_NAME)
        self.url = '/res/collections/%s' % self.wall.unique_id
    def teardown(self):
        clean_db()
    def test_get_collections(self):
        response = app.get('/res/collections')
        assert_status(response, 200)
        assert self.url in str(response), 'expecting list of uris' 
    def test_post(self):
        response = app.post('/res/collections', wall_json)
        assert_status(response, 201)
        assert '/res/collections/' in response.headers['Location'], response.headers['Location']
        self.url = response.headers['Location']
    def test_get(self):
        response = app.get(self.url)
        assert_status(response, 200)
        assert WALL_NAME in response.body, 'expecting wall json'
    def test_put(self):
        response = app.put(self.url, put_json %
            (WALL_NAME + ' Changed', self.wall.unique_id, self.wall.created))
        assert_status(response, 204)
        response = app.get(self.url)
        assert_status(response, 200)
        assert WALL_NAME + ' Changed' in response.body, 'expecting wall json'
    def test_bad_post(self):
        response = app.post('/res/collections', 'This is not json', status=400)
        assert '400' in response.status, 'expecting bad request'
        assert_status(response, 400)
    def test_bad_get(self):
        response = app.get('/res/collections/yvr', status=404)
        assert_status(response, 404)
    def test_bad_put(self):
        response = app.put(self.url, 'This is not json', status=400)
        assert_status(response, 400)

class TestItems():
    def setup(self):
        self.wall = walls.create(WALL_NAME)
        self.item = walls.add_url(self.wall.unique_id, 'http://www.testurl.com')
        self.url = '/res/collections/%s' % self.wall.unique_id
    def teardown(self):
        clean_db()
    def test_post_item(self):
        response = app.post(self.url + '/items', good_item)
        assert_status(response, 201)
        assert self.url + '/items/' in response.headers['Location'], 'expecting item uri'
    def test_post_bad_url_item(self):
        response = app.post(self.url + '/items', bad_item, status=400)
        assert_status(response, 400)
        assert 'Url was malformed' in response.status, 'expecting invalid url message'
    def test_post_bad_item(self):
        response = app.post(self.url + '/items', 'This is not json', status=400)
        assert_status(response, 400)
    def test_delete_item(self):
        response = app.delete('%s/items/%d' % (self.url, self.item.id))
        assert_status(response, 204)
        assert walls.fetch_item(self.wall.unique_id, self.item.id) == None, 'Item should be gone'

class TestFeedback():
    def setup(self):
        pass
    def teardown(self):
        clean_db()
    def test_post(self):
        response = app.post('/res/feedback', feedback_json)
        assert_status(response, 201)
    def test_post_missing(self):
        response = app.post('/res/feedback', feedback_missing)
        assert_status(response, 201)
    def test_bad_post(self):
        response = app.post('/res/feedback', 'This is not json', status=400)
        assert_status(response, 400) 
