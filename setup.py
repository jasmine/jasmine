from setuptools import setup, find_packages
setup(
    name = "jasmine",
    version = "2.0",

    packages = find_packages(),

    package_data = {
        '': ['jasmine.js', 'jasmine-html.js', 'jasmine.css'],
    },

    install_requires = ['glob2>=0.4.1', 'ordereddict==1.1']
)
