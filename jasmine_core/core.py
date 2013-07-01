import os

import glob2


class Core(object):
    SPEC_TYPES = ['core', 'html', 'node']

    @classmethod
    def boot_files(cls):
        return ["boot.js"]

    @classmethod
    def boot_dir(cls):
        return os.path.join(cls.path(), 'boot')

    @classmethod
    def spec_files(cls, spec_type):
        if spec_type not in cls.SPEC_TYPES:
            raise ValueError("Unrecognized spec type")

        spec_path = glob2.iglob(os.path.join(cls.path(), "spec", spec_type, "*.js"))

        return set([os.path.join("spec", spec_type, os.path.basename(f)) for f in spec_path])

    @classmethod
    def path(cls):
        return os.path.normpath(os.path.join(os.path.dirname(__file__), '../lib/jasmine-core'))

    @classmethod
    def js_files(cls):
        js_files = [os.path.basename(f) for f in glob2.iglob(os.path.join(cls.path(), "*.js"))]

        js_fileset = set([f for f in js_files if f not in cls.boot_files()])
        js_fileset.update(['jasmine.js'])

        return js_fileset

    @classmethod
    def core_spec_files(cls):
        return cls.spec_files('core')

    @classmethod
    def html_spec_files(cls):
        return cls.spec_files('html')

    @classmethod
    def css_files(cls):
        return set([os.path.basename(f) for f in glob2.iglob(os.path.join(cls.path(), '*.css'))])
