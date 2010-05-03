from webtest import TestApp
from view import application

app = TestApp(application())

def test_index():
    response = app.get('/')
    assert 'collect &amp; share' in str(response)

