class JasmineHelper
  def self.jasmine_lib_dir
    File.expand_path(File.join(jasmine_root, 'lib'))
  end

  def self.jasmine_root  
    File.expand_path(File.join(File.dirname(__FILE__), '..', '..', '..'))
  end

  def self.jasmine
    ['/lib/' + File.basename(Dir.glob("#{JasmineHelper.jasmine_lib_dir}/jasmine*.js").first)] +
      ['/lib/json2.js',
     '/lib/TrivialReporter.js',
     '/lib/consolex.js'
     ]
  end

  def self.jasmine_src_dir
    File.expand_path(File.join(jasmine_root, 'src'))
  end

  def self.jasmine_spec_dir
    File.expand_path(File.join(File.dirname(__FILE__), '..', 'spec'))
  end

  def self.raw_spec_files
    Dir.glob(File.join(jasmine_spec_dir, "**/*[Ss]pec.js"))
  end

  def self.specs
    raw_spec_files.collect {|f| f.sub(jasmine_spec_dir, "/spec")}
  end

  def self.dir_mappings
    {
            "/src" => jasmine_src_dir,
            "/spec" => jasmine_spec_dir,
            "/lib" => jasmine_lib_dir
    }
  end
end
