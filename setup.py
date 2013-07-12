from setuptools import setup, find_packages, os

setup(
    name="jasmine",
    version="1.3.1",
    url="http://pivotal.github.io/jasmine/",
    author="Pivotal Labs",
    author_email="jasmine-js@googlegroups.com",
    description=('Jasmine is a Behavior Driven Development testing framework for JavaScript. It does not rely on '+
                 'browsers, DOM, or any JavaScript framework. Thus it\'s suited for websites, '+
                 'Node.js (http://nodejs.org) projects, or anywhere that JavaScript can run.'),
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
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
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

    namespace_packages=['jasmine'],
    packages=['jasmine', 'jasmine.core'],
    package_dir={'jasmine': 'lib', 'jasmine.core': 'lib/jasmine-core'},
    package_data={'jasmine.core': ['*.js', '*.css']},

    include_package_data=True,

    install_requires=['glob2>=0.4.1', 'ordereddict==1.1']
)