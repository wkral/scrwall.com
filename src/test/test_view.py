from webtest import TestApp
from view import application
import re

app = TestApp(application())

def test_index():
    response = app.get('/')
    assert 'collect &amp; share' in str(response), 'should get homepage'

def test_start_collection():
    response = app.post('/c/new')
    assert '302' in response.status, 'expecting redirect'
    url = re.sub('http://(.*?)/', '/', response.headers['Location'])
    response = app.get(url)
    assert 'Untitled Collection' in str(response)
