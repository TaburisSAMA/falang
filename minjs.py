#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""使用jsmin压缩js"""

import os

for name in os.listdir('scripts'):
    if name == 'options.js':
        continue
    if name.endswith('.js'):
        source = 'scripts/%s' % name
        to = source + '.min'
        os.system('jsmin < %s > %s' % (source, to))
        os.remove(source)
        os.rename(to, source)