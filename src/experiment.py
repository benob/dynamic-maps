
hooks = {}
def hook():
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            timestamp = datetime.datetime.now()
            try:
                cookie = request.get_cookie(app_name, secret=secret)
                if cookie is None:
                    raise Exception('no cookie')
            except Exception as e:
                #print('warning: could not parse cookie', e)
                cookie = {'userid': ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(16))}
            response.set_cookie(app_name, cookie, secret=secret)

            print(cookie['userid'], timestamp, request.path)
            return func(*args, **kwargs)
        return wrapper
    return decorator

class Experiment:
    def __init__(self):
        pass

    def on(self, state):
        if state == 'start':
            before('template').append('<img>')
            state = 'browsing'
        elif state == 'browsing':
            if distance(target, horse) < 10:
                target = horse
                state = 'videoplay'
        elif state == 'videoplay':
            replace('target', '<video>')


