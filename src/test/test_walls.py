import walls
import helper
from model import *
from nose.tools import *

WALL_NAME = 'New Collection'
URL1 = 'http://something.com'
URL2 = 'http://something2.com'
BAD_URL = '\#@$#)(&^%@sdflfeslkh'

class TestWalls():

    def setup(self):
        self.wall = walls.create(WALL_NAME)

    def teardown(self):
        helper.clean_db()

    def test_create_wall(self):
        assert self.wall.name == WALL_NAME
        assert len(self.wall.unique_id) > 2
        for c in self.wall.unique_id:
            assert c in walls.ALPHABET

    def test_find_wall(self):
        w = walls.fetch(self.wall.unique_id)
        assert self.wall.name == w.name

    def test_add_url(self):
        walls.add_url(self.wall.unique_id, URL1)
        w = walls.fetch(self.wall.unique_id)
        eq_(w.items.count(), 1)
        eq_(w.items[0].url, URL1)

    def test_add_two_urls(self):
        walls.add_url(self.wall.unique_id, URL1)
        walls.add_url(self.wall.unique_id, URL2)
        w = walls.fetch(self.wall.unique_id)
        eq_(w.items.count(), 2)
        eq_(w.items[0].url, URL1)
        eq_(w.items[1].url, URL2)

    @raises(ValueError)
    def test_bad_url(self):
        walls.add_url(self.wall, BAD_URL)

class TestMultipleWalls():
    def setup(self):
        helper.clean_db()
        for i in range(10):
            walls.create(str(i))
        eq_(len(Wall.all().fetch(100)), 10)
    def teardown(self):
        helper.clean_db()
        assert len(walls.get_latest(10)) == 0
    def test_get_latest(self):
        eq_(len(walls.get_latest(3)), 3)
        latest = walls.get_latest(12)
        eq_(len(latest), 10)
        latest = walls.get_latest(2)
        assert latest[0].created > latest[1].created, 'first item should be newest'
