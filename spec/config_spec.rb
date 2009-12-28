require File.expand_path(File.join(File.dirname(__FILE__), "spec_helper"))

describe Jasmine::Config do
  before(:each) do
    @template_dir = File.expand_path(File.join(File.dirname(__FILE__), "../templates"))
    @config = Jasmine::Config.new
    @config.stub!(:src_dir).and_return(File.join(@template_dir, "public"))
    @config.stub!(:spec_dir).and_return(File.join(@template_dir, "spec"))
  end

  it "should provide a list of all src and spec files" do
    @config.src_files.should == ['javascripts/Example.js']
    @config.spec_files.should == ['javascript/ExampleSpec.js', 'javascript/SpecHelper.js']
  end

  it "should provide a list of all spec files with full paths" do
    @config.spec_files_full_paths.should == [
        File.join(@template_dir, 'spec/javascript/ExampleSpec.js'),
        File.join(@template_dir, 'spec/javascript/SpecHelper.js')
    ]
  end

  it "should provide a list of all js files" do
    @config.js_files.should == [
        'src/javascripts/Example.js',
        'spec/javascript/ExampleSpec.js',
        'spec/javascript/SpecHelper.js',
    ]
  end

  it "should provide dir mappings" do
    @config.mappings.should == {
        '/src' => @config.src_dir,
        '/spec' => @config.spec_dir
    }
  end
  
  it "should allow overriding src and spec paths" do
    @config.stub!(:src_path).and_return("public")
    @config.stub!(:spec_path).and_return("spekz")

    @config.js_files.should == [
        'public/javascripts/Example.js',
        'spekz/javascript/ExampleSpec.js',
        'spekz/javascript/SpecHelper.js',
    ]

    @config.mappings.should == {
        '/public' => @config.src_dir,
        '/spekz' => @config.spec_dir
    }
  end
end