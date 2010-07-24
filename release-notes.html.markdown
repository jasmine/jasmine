---
layout: default
title: Jasmine Javascript Testing Framework
---
<h1>Release Notes</h1>

<div class="wikistyle">
  <h2>Release 0.11.1 — June 25, 2010</h2>
  <h3>Jasmine Core</h3>
  <h4>Features</h4>
  <ul>
    <li>Jasmine no longer logs &#8220;Jasmine Running&#8230;&#8221; messages to the log by default. This can be enabled in runner.html by adding &#8217;      trivialReporter.logRunningSpecs = true;&#8217;</li>
    <li>The &#8216;wasCalled&#8217;, &#8216;wasCalledWith&#8217;, &#8216;wasNotCalled&#8217; and &#8216;wasNotCalledWith&#8217; matchers have been deprecated. The new matchers &#8216;toHaveBeenCalled&#8217; and #&#8216;oHaveBeenCalledWith&#8217; have been added. You can use the &#8216;not&#8217; method to achieve the &#8216;wasNot&#8230;&#8217; expectation. (e.g. &#8216;not.toHaveBeenCalled&#8217;)</li>
  </ul>
  <h4>Notables</h4>
  <ul>
    <li>A barebones version of Jasmine is now available on http://pivotal.github.com/jasmine</li>
  </ul>
  <h2>Release 0.11.0 — June 23, 2010</h2>
  <h3>Jasmine Core</h3>
  <h4>Features</h4>
  <ul>
    <li>The version number has been removed from the generated single-file /lib/jasmine.js. We&#8217;re also now uploading this file, with the version number in the filename, to github&#8217;s Downloads page.</li>
    <li>Old-style matchers (those using this.report(), from before 0.10.x) are no longer supported. See the <span class="caps">README</span> for instructions on writing new-style matchers.</li>
    <li><strong>jasmine.log</strong> pretty-prints its parameters to the spec&#8217;s output.</li>
    <li>Jasmine no longer depends on &#8216;window&#8217;.</li>
    <li><span class="caps">HTML</span> runner should show number of passes/fails by spec, not expectation.</li>
    <li>Small modification to JsApiReporter data format</li>
  </ul>
  <h4>Bugs fixed:</h4>
  <ul>
    <li>If multiple beforeEach blocks were declared, they were executed in reverse order.</li>
    <li>Specs with duplicate names confused TrivialReporter output.</li>
    <li>Errors in describe functions caused later tests to be weirdly nested.</li>
    <li>Nested specs weren&#8217;t reported properly by the JsApiReporter.</li>
  </ul>
  <h4>Known issues:</h4>
  <ul>
    <li>If you turn on the mock clock, you&#8217;ll get a spurious log message at the end of your spec.</li>
  </ul>
</div>
