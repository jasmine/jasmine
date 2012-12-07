class JasmineDev < Thor
  JASMINE_SOURCES = {
    :core => [
      "base.js",
      "util.js",
      "ExpectationResult.js",
      "Env.js",
      "Reporter.js",
      "JsApiReporter.js",
      "Matchers.js",
      "MultiReporter.js",
      "NestedResults.js",
      "PrettyPrinter.js",
      "Queue.js",
      "Runner.js",
      "Spec.js",
      "Suite.js",
      "Clock.js",
      "DelayedFunctionScheduler.js"
    ],

    :html => [
      "HtmlReporterHelpers.js",
      "HtmlReporter.js",
      "ReporterView.js",
      "SpecView.js",
      "SuiteView.js",
    ]
  }
end
