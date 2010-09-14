---
layout: default
title: Jasmine Release Notes
---
<h1>Release Notes</h1>

<div class="wikistyle">

  <div class="release" style="display: none">
    <h2>Release 1.0 — September 14, 2010</h2>
    <h3>Jasmine Core</h3>

    <h4>Features</h4>
    <ul>
      <li><code>waitsFor()</code> arguments can now be specified in any order. Timeout and message are optional.</li>
      <li>The default <code>waitsFor()</code> timeout period is now specified in <code>env.defaultTimeoutInterval</code>; the default value is 5 seconds.</li>
      <li>Added link to jasmine site from html runner.</li>
      <li>Added license file to standalone distribution.</li>
      <li>New friendly version number.</li>
    </ul>

    <h4>Bugs fixed:</h4>
    <ul>
      <li><code>waitsFor()</code> hanged forever if latch function never returned true.</li>
      <li>The <code>not.toThrow()</code> matcher threw an exception when used with no args.</li>
      <li>The <code>toThrow()</code> matcher, when inverted, gave misleading failure messages.</li>
      <li>Spy matchers, when inverted, gave misleading failure messages.</li>
    </ul>

    <h4>Deprecations</h4>
    <ul>
      <li>Deprecated <code>waits()</code> block in favor of <code>waitsFor()</code>; <code>waits()</code> will be removed in a future release.</li>
      <li>Deprecated <code>toNotBe()</code>, <code>toNotEqual()</code>, <code>toNotMatch()</code>, and <code>toNotContain()</code> matchers; they will be removed in a future release.</li>
      <li>Console X was removed from the distribution as it was no longer used.</li>
      <li>To give us some flexibility for future features, wrapped matcher functions now return <code>undefined</code> (they previously returned <code>true</code> or <code>false</code>, but this was undocumented).</li>
    </ul>

    <h3>Jasmine Gem</h3>
    <h4>Features</h4>
    <ul>
      <li>Jasmine now supports JRuby.</li>
      <li>Jasmine now supports Ruby 1.9.</li>
    </ul>

    <h4>Bugs fixed:</h4>
    <ul>
      <li>Various generator issues fixed.</li>
    </ul>

    <h4>Known issues:</h4>
    <ul>
      <li>Rails 3 and RSpec 2 are not yet fully supported.</li>
    </ul>
  </div>


  <div class="release">
    <h2>Release 0.11.1 — June 25, 2010</h2>
    <h3>Jasmine Core</h3>

    <h4>Features</h4>
    <ul>
      <li>Jasmine no longer logs "Jasmine Running…" messages to the log by default. This can be enabled in runner.html by adding 'trivialReporter.logRunningSpecs = true;'.</li>
      <li>The <code>wasCalled()</code>, <code>wasCalledWith()</code>, <code>wasNotCalled()</code> and <code>wasNotCalledWith()</code> matchers have been deprecated. The new matchers <code>toHaveBeenCalled()</code> and <code>toHaveBeenCalledWith()</code> have been added. You can use the <code>not</code> prefix to achieve equivalent of the <code>wasNot…()</code> expectation (e.g. <code>not.toHaveBeenCalled()</code>).</li>
    </ul>

    <h4>Notables</h4>
    <ul>
      <li>A barebones version of Jasmine is now available on <a href="http://pivotal.github.com/jasmine/">http://pivotal.github.com/jasmine/</a>.</li>
    </ul>
  </div>


  <div class="release">
    <h2>Release 0.11.0 — June 23, 2010</h2>
    <h3>Jasmine Core</h3>

    <h4>Features</h4>
    <ul>
      <li>The version number has been removed from the generated single-file /lib/jasmine.js. We're also now uploading this file, with the version number in the filename, to github's Downloads page.</li>
      <li>Old-style matchers (those using this.report(), from before 0.10.x) are no longer supported. See the <span class="caps">README</span> for instructions on writing new-style matchers.</li>
      <li><strong>jasmine.log</strong> pretty-prints its parameters to the spec's output.</li>
      <li>Jasmine no longer depends on 'window'.</li>
      <li><span class="caps">HTML</span> runner should show number of passes/fails by spec, not expectation.</li>
      <li>Small modification to JsApiReporter data format.</li>
    </ul>

    <h4>Bugs fixed:</h4>
    <ul>
      <li>If multiple beforeEach blocks were declared, they were executed in reverse order.</li>
      <li>Specs with duplicate names confused TrivialReporter output.</li>
      <li>Errors in describe functions caused later tests to be weirdly nested.</li>
      <li>Nested specs weren't reported properly by the JsApiReporter.</li>
    </ul>

    <h4>Known issues:</h4>
    <ul>
      <li>If you turn on the mock clock, you'll get a spurious log message at the end of your spec.</li>
    </ul>
  </div>
</div>
