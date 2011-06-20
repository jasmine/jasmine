require 'json'

def core_sources
  first_sources = JSON.parse(File.read('./src/SourcesList.json')).collect { |f| "./src/core/#{f}" }

  remaining_sources = Dir.glob('./src/core/*.js').reject { |f| first_sources.include?(f) }.sort

  first_sources + remaining_sources
end

def html_sources
  Dir.glob('./src/html/*.js')
end

def console_sources
  Dir.glob('./src/console/*.js')
end

def core_specfiles
  Dir.glob('./spec/core/*.js')
end

def html_specfiles
   Dir.glob('./spec/html/*.js')
end

def console_specfiles
  Dir.glob('./spec/console/*.js')
end

def version_string
  version = "#{version_hash['major']}.#{version_hash['minor']}.#{version_hash['build']}"
  version += ".rc#{version_hash['release_candidate']}" if version_hash['release_candidate']
  version
end

def version_hash
  @version ||= JSON.parse(File.new("./src/version.json").read);
end

def script_tags_for(files)
  script_tag = Tilt::new('./spec/templates/script_tag.html.erb')

  srcs = (files.is_a?(String) ? [files] : files)
  srcs.inject([]) do |tags, f|
    scope = OpenStruct.new :file => f
    tags << script_tag.render(scope)
    tags
  end.join("\n  ")
end
