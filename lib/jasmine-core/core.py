import pkg_resources

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