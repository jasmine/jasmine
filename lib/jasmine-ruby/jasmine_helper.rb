class JasmineHelper
  def self.lib_dir
    File.expand_path(File.join(root, 'lib'))
  end

  def self.jasmine
    ['/lib/' + File.basename(Dir.glob("#{JasmineHelper.lib_dir}/jasmine*.js").first)] +
      ['/lib/json2.js',
       '/lib/TrivialReporter.js']
  end

  def self.root
    File.expand_path(File.join(File.dirname(__FILE__), '..', '..', 'jasmine'))
  end

  def self.spec_dir
    File.expand_path('spec/javascripts')
  end

  def self.spec_files
    Dir.glob(File.join(spec_dir, "**/*[Ss]pec.js"))
  end

  def self.specs
    spec_files.collect {|f| f.sub(spec_dir, "/spec")}
  end

  def self.spec_helpers_files
    Dir.glob(File.join(spec_dir, "helpers/**/*.js"))
  end

  def self.spec_helpers
    spec_helpers_files.collect {|f| f.sub(spec_dir, "/spec")}
  end

  def self.dir_mappings
    {
      "/spec" => spec_dir,
      "/lib" => lib_dir
    }
  end

  def self.meta_spec_path
    File.expand_path(File.join(File.dirname(__FILE__), '..', '..', 'lib', 'jasmine-ruby', 'jasmine_meta_spec.rb'))    
  end

end
