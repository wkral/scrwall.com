from webtest import TestApp
from view import application
import re
import walls

app = TestApp(application())

def test_index():
    response = app.get('/')
    assert 'collect &amp; share' in str(response), 'should get homepage'

def test_start_collection():
    response = app.post('/c')
    assert '302' in response.status, 'expecting redirect'
    url = re.sub('http://(.*?)/', '/', response.headers['Location'])
    response = app.get(url)
    assert 'Probably our fault' in str(response)

def test_get_collection():
    wall = walls.create("My collection")
    response = app.get('/c/%s' % wall.unique_id)
    assert 'My collection' in str(response)
    assert 'Probably our fault' in str(response)

def test_get_bad_collection():
    response = app.get('/c/yvr', status=404)
    assert '404' in response.status, 'expecting not to find it'
