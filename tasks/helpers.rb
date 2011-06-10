require 'json'

def core_sources
  first_sources = JSON.parse(File.read('src/SourcesList.json')).collect { |f| "src/core/#{f}" }

  remaining_sources = Dir.glob('src/core/*.js').reject { |f| first_sources.include?(f) }.sort

  first_sources + remaining_sources
end

def html_sources
  Dir.glob('src/html/*.js')
end

def console_sources
  Dir.glob('src/console/*.js')
end

def core_specfiles
  Dir.glob('spec/core/*.js')
end

def html_specfiles
   Dir.glob('spec/html/*.js')
end

def console_specfiles
  Dir.glob('spec/console/*.js')
end

def version_string
  "#{version_hash['major']}.#{version_hash['minor']}.#{version_hash['build']}"
end

def version_source
<<-JS
jasmine.version_= {
  "major": #{version_hash['major'].to_json},
  "minor": #{version_hash['minor'].to_json},
  "build": #{version_hash['build'].to_json},
  "revision": #{Time.now.to_i}
}
JS
end

def version_hash
  @version ||= JSON.parse(File.new("src/core/version.json").read);
end

def node_installed?
 `which node` =~ /node/
end
