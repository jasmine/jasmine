require 'jasmine'

class JasmineSelfTestConfig < Jasmine::Config
  def project_root
    File.expand_path(File.join(File.dirname(__FILE__), ".."))
  end

  def src_dir
    File.join(project_root, 'src')
  end

  def spec_dir
    File.join(project_root, 'jasmine/spec')
  end
end