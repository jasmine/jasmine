require 'spec_helper.rb'

describe "Build Standalone runner HTML task" do

  let(:jasmine_dev) { JasmineDev.new }
  let(:standalone_temp_dir) { "#{Dir.tmpdir}/jasmine_test" }

  describe "build_standalone_runner" do
    before do
      reset_dir standalone_temp_dir
      Dir.should_receive(:tmpdir).any_number_of_times.and_return(standalone_temp_dir)

      @standalone_staging_dir = File.join(standalone_temp_dir, 'jasmine_standalone')

      @version_dir = File.join(@standalone_staging_dir, "jasmine-standalone-#{jasmine_version}")

      @output = capture_output { jasmine_dev.build_standalone_runner }
    end

    it "should tell the developer the task has started" do
      @output.should match(/Building standalone runner HTML/)
    end

    it "should copy a build SpecRunner.html to the staging directory" do
      File.exist?(File.join(@version_dir, 'SpecRunner.html')).should be_true
    end

    describe "should build the file that has HTML that" do
      before do
        html = File.read(File.join(@version_dir, 'SpecRunner.html'))
        @runner = Nokogiri(html)
      end

      it "should have the favicon tag" do
        favicon_tag = @runner.css('link')[0]
        favicon_tag['href'].should match("lib/jasmine-#{jasmine_version}/jasmine_favicon.png")
      end

      it "should have the stylesheet" do
        css_tag = @runner.css('link')[1]
        css_tag['href'].should match("lib/jasmine-#{jasmine_version}/jasmine.css")
      end

       it "should have the jasmine script tags" do
         script_sources = @runner.css('script').collect {|tag| tag['src']}
         script_sources.should include("lib/jasmine-#{jasmine_version}/jasmine.js")
         script_sources.should include("lib/jasmine-#{jasmine_version}/jasmine-html.js")
       end

      it "should have the example source files" do
        script_sources = @runner.css('script').collect {|tag| tag['src']}
        script_sources.should include('src/Player.js')
        script_sources.should include('src/Song.js')
      end

      it "should have the example source files" do
        script_sources = @runner.css('script').collect {|tag| tag['src']}
        script_sources.should include('spec/SpecHelper.js')
        script_sources.should include('spec/PlayerSpec.js')
      end
    end
  end
end
