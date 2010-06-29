from model import Feedback

def create(comment, name=None, email=None):
    name = name if name != '' else None
    email = email if email != '' else None
    feedback = Feedback(comment=comment, name=name, email=email)
    feedback.put()
    feedback.id = feedback.key().id()
    feedback.put()
    return feedback

def latest(n):
    return Feedback.all().fetch(n)

def fetch(id):
    return Feedback.gql('WHERE id = :1', id).get()
