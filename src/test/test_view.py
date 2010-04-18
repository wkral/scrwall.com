from webtest import TestApp
from view import application

app = TestApp(application())

def test_index():
    response = app.get('/')
    assert 'Home Page' in str(response)

