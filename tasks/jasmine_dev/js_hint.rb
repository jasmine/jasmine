class JasmineDev < Thor

  desc "js_hint", "Run Jasmine source through JSHint"
  def js_hint
    say JasmineDev.spacer

    return unless node_installed?

    say "Running JSHint on Jasmine source and specs...", :cyan

    run_with_output "node jshint/run.js", :capture => true
  end
end