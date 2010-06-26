from model import *

ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

def create(name=''):
    w = Wall(name=name, name_set=len(name) > 0, item_count=0)
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
        wall.name_set = True
        wall.put()
    return wall

def fetch(unique_id):
    return Wall.gql('WHERE unique_id = :1', unique_id).get()

def get_latest(n):
    return Wall.all().filter('name_set =', True).order('-created').fetch(n)

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

def create_feedback(comment, name=None, email=None):
    name = name if name != '' else None
    email = email if email != '' else None
    feedback = Feedback(comment=comment, name=name, email=email)
    feedback.put()
    feedback.id = feedback.key().id()
    feedback.put()
    return feedback
