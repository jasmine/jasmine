require 'spec_helper.rb'

describe "Build Github Pages task" do

  let(:pages_dir) { File.join(Dir.tmpdir, 'pages') }
  let(:jasmine_dev) { JasmineDev.new }

  before do
    reset_dir pages_dir
  end

  describe "when the Github pages submodule is not present" do
    before do
      jasmine_dev.should_receive(:has_pages_submodule?).and_return(false)

      @output = capture_output { jasmine_dev.build_github_pages pages_dir }
    end

    it "should tell the user the task is running" do
      @output.should match(/Building Github Pages/)
    end

    it "should prompt the user to install the submodule" do
      @output.should match(/Submodule for Github Pages isn't present/)
    end
  end

  describe "when the Github pages submodule is present" do
    before do
      jasmine_dev.should_receive(:has_pages_submodule?).and_return(true)

      @output = capture_output { jasmine_dev.build_github_pages pages_dir }
    end

    it "should tell the user the task is running" do
      @output.should match(/Building Github Pages/)
    end

    it "should copy the latest jasmine files to the pages dir" do
      ['jasmine.js', 'jasmine.css', 'jasmine-html.js'].each do |lib_file|
        source = File.read(File.join(project_root, 'lib', 'jasmine-core', lib_file))
        dest = File.read(File.join(pages_dir, 'lib', lib_file))

        source.should == dest
      end
    end

    it "should build a new page" do
      @output.should match(/rocco/)
      File.exist?(File.join(pages_dir, 'introduction.html')).should be_true
    end

    it "should copy the rocco output to index.html" do
      introduction = File.read(File.join(pages_dir, 'introduction.html'))
      index = File.read(File.join(pages_dir, 'index.html'))

      index.should == introduction
    end
  end
end