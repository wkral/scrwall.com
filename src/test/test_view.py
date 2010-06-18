from webtest import TestApp
from view import application
import re
import walls
from helper import *

app = TestApp(application())

def test_index():
    response = app.get('/')
    assert_status(response, 200)
    assert 'collect &amp; share' in str(response), 'should get homepage'

def test_start_collection():
    response = app.post('/c')
    assert_status(response, 302)
    url = re.sub('http://(.*?)/', '/', response.headers['Location'])
    response = app.get(url)
    assert_status(response, 200)
    assert 'Probably our fault' in str(response)

def test_get_collection():
    wall = walls.create("My collection")
    response = app.get('/c/%s' % wall.unique_id)
    assert_status(response, 200)
    assert 'My collection' in str(response)
    assert 'Probably our fault' in str(response)

def test_get_bad_collection():
    response = app.get('/c/yvr', status=404)
    assert_status(response, 404)

