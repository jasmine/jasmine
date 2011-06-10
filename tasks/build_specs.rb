require 'ostruct'

desc "build the browser spec runner.html based on current tree"
task :build_runner_html do
  template = Tilt.new('spec/templates/runner.html.erb')

  File.open('spec/runner.html', 'w+') do |f|
    scope = OpenStruct.new(:source_tags => other_source_file_tags,
                           :spec_file_tags => spec_file_tags)
    f << template.render(scope)
  end
end

def other_source_file_tags
  other_files = html_sources + console_sources
  script_tags_for other_files.collect { |f| "../#{f}" }
end

def spec_file_tags
  spec_files = core_specfiles + html_specfiles + console_specfiles
  script_tags_for spec_files.collect { |f| "../#{f}" }
end

def script_tags_for(files)
  script_tag = Tilt::new('spec/templates/script_tag.html.erb')

  files.inject([]) do |tags, f|
    scope = OpenStruct.new :file => f
    tags << script_tag.render(scope)
    tags
  end.join("\n  ")
end