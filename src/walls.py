from model import *

ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

def create(name):
    w = Wall(name=name, item_count=0)
    w.put()
    w.unique_id = get_string_id(w.key().id(), ALPHABET);
    w.put()
    return w

def add_url(id, url):
    if(url.startswith('http://')):
        wall = fetch(id)
        if wall:
            wall.item_count += 1
            item = WallItem(id=wall.item_count, wall=wall, url=url)
            item.put()
            wall.put()
            return item
    else:
        raise ValueError('Must be a well formatted URL')

def rename(id, name):
    wall = find(id)
    if wall:
        wall.name = name
        wall.put()
    return wall

def fetch(unique_id):
    return Wall.gql('WHERE unique_id = :1', unique_id).get()

def get_latest(n):
    return Wall.all().order('-created').fetch(n)

def get_string_id(n, alphabet):
    if (n == 0):
        return alphabet[0]
    arr = []
    base = len(alphabet)
    while n:
        rem = n % base
        n = n // base
        arr.append(alphabet[rem])
    if len(arr) < 3:
        for i in range(3 - len(arr)):
            arr.append(alphabet[0])
    arr.reverse()
    return ''.join(arr)

