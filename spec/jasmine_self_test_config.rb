require 'jasmine'

class JasmineSelfTestConfig < Jasmine::Config
  def proj_root
    File.expand_path(File.join(File.dirname(__FILE__), ".."))
  end

  def src_dir
    File.join(proj_root, 'src')
  end

  def spec_dir
    File.join(proj_root, 'jasmine/spec')
  end
end