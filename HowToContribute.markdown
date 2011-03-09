# Jasmine Contributor's Guide

We welcome your contributions. Whether it's working on a story on the backlog, adding a missing feature or fixing a bug thanks for helping making Jasmine a better project for everyone.

## Development Environment

Jasmine Core relies on Ruby for executing the test suite and building the project for release. If you're contributing

The project also relies on [Node.js](http://nodejs.org) in order to run Jasmine's suite in an environment outside a browser.

## How to Develop for Jasmine Core

* Write specs
* Make them pass in a browser (or three): open `spec/runner.html`
* Make them pass in Node: `node spec/node_suite.js`
* Fix any warnings or errors from JSHint: `rake jasmine:lint`

## Making a Successful Pull Request

All pull requests should come through Github's system.

We welcome discussion of your proposed changes on the developers' list before you submit. It's not required, but we're pretty good about giving feedback.

Pull requests should include specs and the full test suite should be green: in all the big browsers, Node, and JSHint. There are `rake` tasks to help with this.

