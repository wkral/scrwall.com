import walls
from nose.tools import *

WALL_NAME = 'New Collection'
URL1 = 'http://something.com'
URL2 = 'http://something2.com'
BAD_URL = '\#@$#)(&^%@sdflfeslkh'

class TestWalls():

    def setup(self):
        self.wall = walls.create(WALL_NAME)

    def teardown_func(self):
        self.wall.delete()

    def test_create_wall(self):
        assert self.wall.name == WALL_NAME
        assert len(self.wall.unique_id) > 2
        for c in self.wall.unique_id:
            assert c in walls.ALPHABET

    def test_fetch_wall(self):
        w = walls.find(self.wall.unique_id)
        assert self.wall.name == w.name

    def test_add_url(self):
        walls.add_url(self.wall.unique_id, URL1)
        w = walls.find(self.wall.unique_id)
        eq_(len(w.urls), 1)
        eq_(w.urls[0], URL1)

    def test_add_two_urls(self):
        walls.add_url(self.wall.unique_id, URL1)
        walls.add_url(self.wall.unique_id, URL2)
        w = walls.find(self.wall.unique_id)
        eq_(len(w.urls), 2)
        eq_(w.urls[0], URL1)
        eq_(w.urls[1], URL2)

    @raises(ValueError)
    def test_bad_url(self):
        walls.add_url(self.wall, BAD_URL)

