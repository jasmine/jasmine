require 'ostruct'

desc "build the browser spec for Jasmine core based on current tree"
task :build_runner_html do
  template = Tilt.new('spec/templates/runner.html.erb')

  File.open('spec/runner.html', 'w+') do |f|
    scope = OpenStruct.new(:title => "Jasmine Spec Runner: Jasmine Core",
                           :favicon => favicon,
                           :jasmine_tags => core_jasmine_tags,
                           :source_tags => other_source_file_tags,
                           :spec_file_tags => spec_file_tags)
    f << template.render(scope)
  end
end

def favicon
  <<HTML
<link rel="shortcut icon" type="image/png" href="../images/jasmine_favicon.png">
HTML
end

def core_jasmine_tags
  tags = %Q{<link href="../lib/jasmine.css" rel="stylesheet"/>}
  tags << "\n  "
  tags << script_tags_for("../lib/jasmine.js")
  tags << "\n  "
  tags << undefined_catch
  tags
end

def undefined_catch
  <<HTML
<script type="text/javascript">
    // yes, really keep this here to keep us honest, but only for jasmine's own runner! [xw]
    undefined = "diz be undefined yo";
  </script>
HTML
end

def other_source_file_tags
  other_files = html_sources + console_sources
  script_tags_for other_files.collect { |f| "../#{f}" }
end

def spec_file_tags
  spec_files = core_specfiles + html_specfiles + console_specfiles
  script_tags_for spec_files.collect { |f| "../#{f}" }
end

