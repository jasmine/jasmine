desc "Build the Github pages HTML"
task :build_pages => :require_pages_submodule do
  Dir.chdir("pages") do
    FileUtils.rm_r('pages_output') if File.exist?('pages_output')
    Dir.chdir('pages_source') do
      system("frank export ../pages_output")
    end
    puts "\n"
    puts "Copying built website to the root of the gh-pages branch".cyan
    puts "\n\n"
    system("cp -r pages_output/* .")
  end
end