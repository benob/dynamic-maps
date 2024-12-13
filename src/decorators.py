from functools import wraps
from gzip import compress
import datetime, random, string, time

from bottle import response, request

secret = 'Tn4>2D#S>T]cHjM'
app_name = 'image-browser'

def gzipped():
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwds):
            rsp_data = func(*args, **kwds)
            if 'gzip' in request.headers.get('Accept-Encoding', ''):
                response.headers['Content-Encoding'] = 'gzip'
                rsp_data = compress(rsp_data.encode('utf-8'))
            return rsp_data
        return wrapper
    return decorator

def session_logged():
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            timestamp = datetime.datetime.now()
            try:
                cookie = request.get_cookie(app_name, secret=secret)
                if cookie is None or 'session_id' not in cookie:
                    raise Exception('no cookie')
            except Exception as e:
                #print('warning: could not parse cookie', e)
                cookie = {'session_id': ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(16))}
            response.set_cookie(app_name, cookie, secret=secret)

            print(cookie['session_id'], timestamp, request.path)
            return func(*args, **kwargs)
        return wrapper
    return decorator

