/**
 This file starts the process of "booting" Jasmine. It initializes Jasmine,
 makes its globals available, and creates the env. This file should be loaded
 after `jasmine.js` and `jasmine_html.js`, but before `boot1.js` or any project
 source files or spec files are loaded.
 */
(function() {
  var jasmineRequire = window.jasmineRequire || require('./jasmine.js');

  /**
   * ## Require &amp; Instantiate
   *
   * Require Jasmine's core files. Specifically, this requires and attaches all of Jasmine's code to the `jasmine` reference.
   */
  var jasmine = jasmineRequire.core(jasmineRequire),
    global = jasmine.getGlobal();
  global.jasmine = jasmine;

  /**
   * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
   */
  jasmineRequire.html(jasmine);

  /**
   * Create the Jasmine environment. This is used to run all specs in a project.
   */
  var env = jasmine.getEnv();

  /**
   * ## The Global Interface
   *
   * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
   */
  var jasmineInterface = jasmineRequire.interface(jasmine, env);

  /**
   * Add all of the Jasmine global/public interface to the global scope, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
   */
  for (var property in jasmineInterface) {
    global[property] = jasmineInterface[property];
  }
}());
