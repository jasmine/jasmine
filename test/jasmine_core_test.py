from pytest import raises
import pytest
import subprocess

from jasmine_core import Core
import os
import sys

notwin32 = pytest.mark.skipif("sys.platform == 'win32'")


def test_boot_files():
    assert Core.boot_files() == ["boot.js"]


def test_SPEC_TYPES():
    assert Core.SPEC_TYPES == ['core', 'html', 'node']


def test_path():
    """ Should return a path where we can find jasmine.js and ilk """

    for f in ['jasmine.js', 'jasmine-html.js', 'jasmine.css']:
        assert os.path.isfile(os.path.join(Core.path(), f))


def test_spec_files_unknown_type():
    """ Should raise an error on an unknown spec type """

    with raises(ValueError):
        Core.spec_files('chicken')

    # should not raise
    Core.spec_files('core')


@notwin32
def test_spec_files_returns_files():
    """ Should return a list of files that are relative to Core.path() """
    assert _spec_files('core') == Core.spec_files('core')


@notwin32
def test_js_files():
    files_from_shell = subprocess.check_output([
        "find lib/jasmine-core -maxdepth 1 -name \*.js -not -name boot.js -exec basename {} \;"], shell=True)

    files = set([x for x in files_from_shell.split('\n') if x])

    assert Core.js_files() == files


def test_core_spec_files():
    """ Should return a list of core files that are relative to Core.path() """
    assert _spec_files('core') == Core.core_spec_files()


def test_html_spec_files():
    """ Should return a list of html files that are relative to Core.path() """
    assert _spec_files('html') == Core.html_spec_files()


def test_boot_dir():
    assert Core.boot_dir() == os.path.join(Core.path(), 'boot')


def test_css_files():
    """ Should return a list of css files that are relative to Core.path() """
    files_from_shell = subprocess.check_output(['find lib/jasmine-core/ -maxdepth 1 -type f -name *.css -exec basename {} \;'], shell=True)

    files = set([x for x in files_from_shell.split('\n') if x])

    assert files == Core.css_files()


def _spec_files(spec_type='core'):
    files_from_shell = subprocess.check_output(['find spec/{} -maxdepth 1 -type f'.format(spec_type)], shell=True)

    return set([x for x in files_from_shell.split('\n') if x])
