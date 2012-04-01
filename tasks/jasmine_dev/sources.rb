class JasmineDev < Thor
  JASMINE_SOURCES = {
    :core => [
      "base.js",
      "util.js",
      "Env.js",
      "Reporter.js",
      "Block.js",
      "JsApiReporter.js",
      "Matchers.js",
      "mock-timeout.js",
      "MultiReporter.js",
      "NestedResults.js",
      "PrettyPrinter.js",
      "Queue.js",
      "Runner.js",
      "Spec.js",
      "Suite.js",
      "WaitsBlock.js",
      "WaitsForBlock.js"
    ],

    :html => [
      "HtmlReporterHelpers.js",
      "HtmlReporter.js",
      "ReporterView.js",
      "SpecView.js",
      "SuiteView.js",
      "TrivialReporter.js"
    ]
  }
end
