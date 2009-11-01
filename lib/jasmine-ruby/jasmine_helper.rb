class JasmineHelper
  def self.jasmine_lib_dir
    File.expand_path(File.join(jasmine_root, 'lib'))
  end

  def self.jasmine
    ['/lib/' + File.basename(Dir.glob("#{JasmineHelper.jasmine_lib_dir}/jasmine*.js").first)] +
      ['/lib/json2.js',
       '/lib/TrivialReporter.js']
  end

  def self.jasmine_root
    File.expand_path(File.join(File.dirname(__FILE__), '..', '..', 'jasmine'))
  end

  def self.rails_root
    if defined? RAILS_ROOT
      RAILS_ROOT
    else
      ENV['RAILS_ROOT']
    end
  end

  def self.jasmine_spec_dir
    if rails_root
      File.expand_path(File.join(rails_root, "spec", "javascript"))
    else
      File.expand_path('spec')
    end
  end

  def self.spec_files
    Dir.glob(File.join(jasmine_spec_dir, "**/*[Ss]pec.js"))
  end

  def self.specs
    spec_files.collect {|f| f.sub(jasmine_spec_dir, "/spec")}
  end

  def self.spec_helpers_files
    Dir.glob(File.join(jasmine_spec_dir, "helpers/**/*.js"))
  end

  def self.spec_helpers
      spec_helpers_files.collect {|f| f.sub(jasmine_spec_dir, "/spec")}
  end

  def self.dir_mappings
    {
      "/spec" => jasmine_spec_dir,
      "/lib" => jasmine_lib_dir
    }
  end
end
