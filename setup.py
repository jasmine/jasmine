from setuptools import setup, find_packages, os
import json

with open('package.json') as packageFile:
  version = json.load(packageFile)['version']

short_description=('Jasmine is a Behavior Driven Development testing framework for JavaScript. It does not rely on '+
                  'browsers, DOM, or any JavaScript framework. Thus it\'s suited for websites, '+
                  'Node.js (http://nodejs.org) projects, or anywhere that JavaScript can run.')
deprecation=('The Jasmine packages for Python are deprecated. There will be no further\n' +
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
             'Except for the standalone distribution, all of the above are distributed through\n'
             'npm.\n')
long_description = short_description + '\n\n' + deprecation


setup(
    name="jasmine-core",
    version=version,
    url="http://jasmine.github.io",
    author="Pivotal Labs",
    author_email="jasmine-js@googlegroups.com",
    description=short_description,
    long_description=long_description,
    long_description_content_type='text/plain',
    license='MIT',
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Console',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.2',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: Implementation :: PyPy',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: Software Development :: Build Tools',
        'Topic :: Software Development :: Quality Assurance',
        'Topic :: Software Development :: Testing',
    ],

    packages=['jasmine_core', 'jasmine_core.images'],
    package_dir={'jasmine_core': 'lib/jasmine-core', 'jasmine_core.images': 'images'},
    package_data={'jasmine_core': ['*.js', '*.css'], 'jasmine_core.images': ['*.png']},

    include_package_data=True,

    install_requires=['glob2>=0.4.1', 'ordereddict==1.1']
)
