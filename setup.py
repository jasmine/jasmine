from setuptools import setup, find_packages
setup(
    name = "jasmine",
    version = "1.3.1",

    packages = find_packages(),

    include_package_data=True,

    install_requires = ['glob2>=0.4.1', 'ordereddict==1.1']
)
