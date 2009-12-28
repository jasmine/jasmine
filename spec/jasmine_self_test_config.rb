require 'jasmine'

class JasmineSelfTestConfig < Jasmine::Config
  def proj_root
    File.expand_path(File.join(File.dirname(__FILE__), ".."))
  end

  def src_dir
    File.join(proj_root, 'src')
  end

  def src_files
    Dir.glob(File.join(src_dir, "**/*.js"))
  end

  def spec_dir
    File.join(proj_root, 'jasmine/spec')
  end

  def spec_files
    Dir.glob(File.join(spec_dir, "**/*[Ss]pec.js")).collect { |f| f.sub("#{spec_dir}/", "spec/") }
  end

  def mappings
    {
        "/src" => src_dir,
        "/spec" => spec_dir
    }
  end
end