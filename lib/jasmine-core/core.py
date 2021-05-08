import pkg_resources
import os

if 'SUPPRESS_JASMINE_DEPRECATION' not in os.environ:
    print('DEPRECATION WARNING:\n' +
        '\n' +
        'The Jasmine packages for Python are deprecated. There will be no further\n' +
        'releases after the end of the Jasmine 3.x series. We recommend migrating to the\n' +
        'following options:\n' +
        '\n' +
        '* jasmine-browser-runner (<https://github.com/jasmine/jasmine-browser>,\n' +
        '  `npm install jasmine-browser-runner`) to run specs in browsers, including\n' +
        '  headless Chrome and Saucelabs. This is the most direct replacement for the\n' +
        '  jasmine server` and `jasmine ci` commands provided by the `jasmine` Python\n' +
        '  package.\n' +
        '* The jasmine npm package (<https://github.com/jasmine/jasmine-npm>,\n' +
        '  `npm install jasmine`) to run specs under Node.js.\n' +
        '* The standalone distribution from the latest Jasmine release\n' +
        '  <https://github.com/jasmine/jasmine/releases> to run specs in browsers with\n' +
        '  no additional tools.\n' +
        '* The jasmine-core npm package (`npm install jasmine-core`) if all you need is\n' +
        '  the Jasmine assets. This is the direct equivalent of the jasmine-core Python\n' +
        '  package.\n' +
        '\n' +
        'Except for the standalone distribution, all of the above are distributed through\n' +
        'npm.\n' +
    	 '\n' +
    	 'To prevent this message from appearing, set the SUPPRESS_JASMINE_DEPRECATION\n' +
		 'environment variable.\n')


try:
    from collections import OrderedDict
except ImportError:
    from ordereddict import OrderedDict

class Core(object):
    @classmethod
    def js_package(cls):
        return __package__

    @classmethod
    def css_package(cls):
        return __package__

    @classmethod
    def image_package(cls):
        return __package__ + ".images"

    @classmethod
    def js_files(cls):
        js_files = sorted(list(filter(lambda x: '.js' in x, pkg_resources.resource_listdir(cls.js_package(), '.'))))

        # jasmine.js needs to be first
        js_files.insert(0, 'jasmine.js')

        # boot needs to be last
        js_files.remove('boot.js')
        js_files.append('boot.js')

        return cls._uniq(js_files)

    @classmethod
    def css_files(cls):
        return cls._uniq(sorted(filter(lambda x: '.css' in x, pkg_resources.resource_listdir(cls.css_package(), '.'))))

    @classmethod
    def favicon(cls):
        return 'jasmine_favicon.png'

    @classmethod
    def _uniq(self, items, idfun=None):
        # order preserving

        if idfun is None:
            def idfun(x): return x
        seen = {}
        result = []
        for item in items:
            marker = idfun(item)
            # in old Python versions:
            # if seen.has_key(marker)
            # but in new ones:
            if marker in seen:
                continue

            seen[marker] = 1
            result.append(item)
        return result