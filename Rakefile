require 'fileutils'
require 'tilt'

desc "build all the introduction js files"
task :pages do
  FileUtils.rmtree 'tmp' if File.exist? 'tmp'
  FileUtils.mkdir 'tmp'

  layout_template = Tilt.new('src/layout.erb')

  Dir.glob('src/introduction-*.js').each do |intro|
    version = intro.match(/introduction-(.+)\.js/)[1]
    with_context = OpenStruct.new(jasmine_version: version)
    layout = "layout_#{version}.mustache"
    Dir.chdir 'tmp' do
      File.open("#{layout}", 'w+') do |f|
        f << layout_template.render(with_context)
      end
    end
    `bundle exec rocco -l js #{intro} -t tmp/#{layout} -o .`
  end
  `mv src/*.html .`
end