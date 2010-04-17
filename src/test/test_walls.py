from nose import with_setup
import walls

WALL_NAME = 'New Collection'
URL1 = 'http://something.com'
URL2 = 'http://something2.com'
BAD_URL = 'sdflfeslkh'

class TestWalls():

    def setup(self):
        self.wall = walls.create(WALL_NAME)

    def teardown_func(self):
        self.wall.delete()

    def test_create_wall(self):
        assert self.wall.name == WALL_NAME
        assert len(self.wall.unique_id) > 2

    def test_fetch_wall(self):
        other_wall = walls.find(self.wall.unique_id)
        assert self.wall.name == other_wall.name

    def test_add_url(self):
        walls.add_url(self.wall, URL1)
        assert len(self.wall.urls) == 1
        assert self.wall.urls[0] == URL1

    def test_add_two_urls(self):
        walls.add_url(self.wall, URL1)
        walls.add_url(self.wall, URL2)
        assert len(self.wall.urls) == 2
        assert self.wall.urls[0] == URL1
        assert self.wall.urls[1] == URL2

    def test_bad_url(self):
        walls.add_url(self.wall, BAD_URL)
        