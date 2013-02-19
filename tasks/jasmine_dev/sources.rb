class JasmineDev < Thor
  JASMINE_SOURCES = {
    :core => [
      "base.js",
      "util.js",
      "ExceptionFormatter.js",
      "ExpectationResult.js",
      "Env.js",
      "JsApiReporter.js",
      "Matchers.js",
      "PrettyPrinter.js",
      "QueueRunner.js",
      "Spec.js",
      "Suite.js",
      "Clock.js",
      "DelayedFunctionScheduler.js",
      "ReportDispatcher.js"
    ],

    :html => [
      "HtmlReporter.js",
      "ResultsNode.js",
      "QueryString.js"
    ]
  }
end
