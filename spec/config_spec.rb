require File.expand_path(File.join(File.dirname(__FILE__), "spec_helper"))

describe Jasmine::Config do
  before(:each) do
    @template_dir = File.expand_path(File.join(File.dirname(__FILE__), "../generators/jasmine/templates"))
    @config = Jasmine::Config.new
    @config.stub!(:src_dir).and_return(File.join(@template_dir, "public"))
    @config.stub!(:spec_dir).and_return(File.join(@template_dir, "spec"))
  end

  describe "simple_config" do
    it "if sources.yaml not found" do
      File.stub!(:exist?).and_return(false)
      @config.src_files.should == []
      @config.stylesheets.should == []
      @config.spec_files.should == ['javascripts/ExampleSpec.js', 'javascripts/SpecHelper.js']
      @config.mappings.should == {
        '/__root__' => @config.project_root,
        '/__spec__' => @config.spec_dir
      }
    end

    it "if sources.yaml is empty" do
      @config.stub!(:simple_config_file).and_return(File.join(@template_dir, 'spec/javascripts/support/jasmine.yaml'))
      YAML.stub!(:load).and_return(false)
      @config.src_files.should == []
      @config.stylesheets.should == []
      @config.spec_files.should == ['javascripts/ExampleSpec.js', 'javascripts/SpecHelper.js']
      @config.mappings.should == {
        '/__root__' => @config.project_root,
        '/__spec__' => @config.spec_dir
      }
    end

    it "using default jasmine.yaml" do
      @config.stub!(:simple_config_file).and_return(File.join(@template_dir, 'spec/javascripts/support/jasmine.yaml'))
      @config.src_files.should == []
      @config.spec_files.should == ['javascripts/ExampleSpec.js', 'javascripts/SpecHelper.js']
      @config.mappings.should == {
        '/__root__' => @config.project_root,
        '/__spec__' => @config.spec_dir
      }
    end

    it "simple_config stylesheets" do
      @config.stub!(:simple_config_file).and_return(File.join(@template_dir, 'spec/javascripts/support/jasmine.yaml'))
      YAML.stub!(:load).and_return({'stylesheets' => ['foo.css', 'bar.css']})
      Dir.stub!(:glob).and_return do |glob_string|
        glob_string
      end
      @config.stylesheets.should == ['foo.css', 'bar.css']
    end

    it "using rails jasmine.yaml" do
      original_glob = Dir.method(:glob)
      Dir.stub!(:glob).and_return do |glob_string|
        if glob_string =~ /public/
          glob_string
        else
          original_glob.call(glob_string)
        end
      end
      @config.stub!(:simple_config_file).and_return(File.join(@template_dir, 'spec/javascripts/support/jasmine-rails.yaml'))
      @config.spec_files.should == ['javascripts/ExampleSpec.js', 'javascripts/SpecHelper.js']
      @config.src_files.should == ['javascripts/prototype.js',
                                   'javascripts/effects.js',
                                   'javascripts/controls.js',
                                   'javascripts/dragdrop.js',
                                   'javascripts/application.js']
      @config.js_files.should == [
        '/javascripts/prototype.js',
        '/javascripts/effects.js',
        '/javascripts/controls.js',
        '/javascripts/dragdrop.js',
        '/javascripts/application.js',
        '/__spec__/javascripts/ExampleSpec.js',
        '/__spec__/javascripts/SpecHelper.js',
      ]
    end
  end


  it "should provide dir mappings" do
    @config.mappings.should == {
      '/__root__' => @config.project_root,
      '/__spec__' => @config.spec_dir
    }
  end

  it "should provide a list of all spec files with full paths" do
    @config.spec_files_full_paths.should == [
      File.join(@template_dir, 'spec/javascripts/ExampleSpec.js'),
      File.join(@template_dir, 'spec/javascripts/SpecHelper.js')
    ]
  end

end