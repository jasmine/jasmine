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

    it "should tell the user the pages are built" do
      @output.should match(/Congratulations, project dumped to/)
    end

    it "should copy the pages output to the requested diretory" do
      Dir.chdir File.join(pages_dir, 'pages_output') do
        pages = Dir.glob(File.join('**', '*'))

        pages.should include('download.html')
        pages.should include('index.html')
        pages.should include(File.join('images', 'jasmine_logo.png'))
        pages.should include(File.join('images', 'pivotal_logo.gif'))
        pages.should include(File.join('css', 'pygments.css'))
        pages.should include(File.join('css', 'screen.css'))
      end
    end
  end
end