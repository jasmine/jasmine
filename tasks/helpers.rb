require 'json'

def get_sources(namespace)
  JSON.parse(File.read('./src/SourcesList.json'))[namespace]
end

def core_sources
  first_sources = get_sources('core_sources').collect {
    |f| "./src/core/#{f}" 
  }

  remaining_sources = Dir.glob('./src/core/*.js').reject {
    |f| first_sources.include?(f)
  }.sort

  first_sources + remaining_sources
end

def html_sources
  get_sources('html_sources').collect {
    |f| "./src/html/#{f}"
  }
end

def console_sources
  get_sources('console_sources').collect {
    |f| "./src/console/#{f}" 
  }
end

def core_specfiles
  get_sources('core_specfiles').collect {
    |f| "./spec/core/#{f}" 
  }
end

def html_specfiles
  get_sources('html_specfiles').collect {
    |f| "./spec/html/#{f}" 
  }
end

def console_specfiles
  get_sources('console_specfiles').collect {
    |f| "./spec/console/#{f}" 
  }
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
