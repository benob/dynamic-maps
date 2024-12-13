import numpy as np
import sys
import os
import random
import glob
from collections import defaultdict

import asyncio
import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

from index import Index

from aiohttp import web
routes = web.RouteTableDef()

indexes = {}
image_names = {}
default_index = None
for directory in sys.argv[1:]:
    db = directory.split('/')[-1]
    if default_index is None:
        default_index = db
    indexes[db] = Index(directory)
    image_names[db] = [directory + '/' + line.strip() for line in open(directory + '/names.txt').readlines()]
    #image_names[db] = glob.glob(directory + '/*.jpg')
    #image_names[db] = [line.replace('thumbnails', directory) for line in glob.glob('thumbnails' + '/*.jpg')]

def closest(db, target, n):
    return indexes[db].closest(target, n)

@routes.get('/neighbors/{db}/{target}/{num}')
async def get_neighbors(request):
    db = request.match_info['db']
    target = int(request.match_info['target'])
    num = int(request.match_info['num'])
    return web.json_response(closest(db, target, num))


@routes.get('/image/{db}/{num}')
async def get_image(request):
    db = request.match_info.get('db', '')
    num = int(request.match_info.get('num', 0))
    if db in image_names and num >= 0 and num < len(image_names[db]):
        #raise web.HTTPFound('/images/%s/%s' % (db, image_names[db][num]))
        raise web.HTTPFound('/images/%s' % image_names[db][num])
    raise web.HTTPBadRequest()

@routes.get('/original/{db}/{num}')
async def get_image(request):
    db = request.match_info.get('db', '')
    num = int(request.match_info.get('num', 0))
    if db in image_names and num >= 0 and num < len(image_names[db]):
        #raise web.HTTPFound('/images/%s/%s' % (db, image_names[db][num]))
        raise web.HTTPFound('/originals/%s' % image_names[db][num])
    raise web.HTTPBadRequest()

@routes.get('/')
async def get_slash(request):
    raise web.HTTPFound('/static/index.html')

async def init():
    app = web.Application()

    routes.static('/static', 'static', append_version=True)
    for directory in sys.argv[1:]:
        db = directory.split('/')[-1]
        #routes.static('/images/' + db, directory + '/images')
        #routes.static('/images/' + db, directory)
        routes.static('/originals/' + db, directory)
        routes.static('/images/' + db, 'thumbnails')
    app.add_routes(routes) 
    return app

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('usage: %s <index-directory+>' % sys.argv[0])
        sys.exit(1)

    app = asyncio.get_event_loop().run_until_complete(init())
    web.run_app(app, host='0.0.0.0', port=8080)

