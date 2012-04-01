require 'spec_helper.rb'

describe "Standalone Distribution tasks" do

  let(:jasmine_dev) { JasmineDev.new }
  let(:standalone_temp_dir) { File.join(Dir.tmpdir, 'jasmine_test') }
  let(:download_dir) { File.join(standalone_temp_dir, 'download')}

  describe "build_standalone_distribution" do
    before do
      reset_dir standalone_temp_dir
      reset_dir download_dir

      Dir.should_receive(:tmpdir).any_number_of_times.and_return(standalone_temp_dir)

      @standalone_staging_dir = File.join(standalone_temp_dir, 'jasmine_standalone')

      @version_dir = File.join(@standalone_staging_dir, "jasmine-standalone-#{jasmine_version}")
      @lib_dir = File.join(@version_dir, 'lib')
      @source_dir = File.join(@version_dir, 'src')
      @spec_dir = File.join(@version_dir, 'spec')

      @output = capture_output { jasmine_dev.build_standalone_distribution download_dir }
    end

    it "should build the distribution" do
      @output.should match(/Building Jasmine distribution/)
    end

    it "should tell the developer the task has started" do
      @output.should match(/Building standalone distribution/)
    end

    it "should copy the lib directory to the staging directory, under a versioned directory" do
      lib_dir_files = Dir.glob(File.join(standalone_temp_dir, 'jasmine_standalone', '**', '*'))

      staged_lib_files = %w{ jasmine.js jasmine-html.js jasmine.css MIT.LICENSE }
      staged_lib_files.each do |filename|
        lib_dir_files.should include(File.join(@lib_dir, "jasmine-#{jasmine_version}", filename))
      end
    end

    it "should copy the sample project source to the staging directory" do
      File.exist?(File.join(@source_dir, 'Player.js')).should be_true
      File.exist?(File.join(@source_dir, 'Song.js')).should be_true
    end

    it "should copy the sample project specs to the staging directory" do
      File.exist?(File.join(@spec_dir, 'PlayerSpec.js')).should be_true
      File.exist?(File.join(@spec_dir, 'SpecHelper.js')).should be_true
    end

    it "should copy a build SpecRunner.html to the staging directory" do
      File.exist?(File.join(@version_dir, 'SpecRunner.html')).should be_true
    end

    it "should zip up the contents of the staging directory" do
      File.exist?(File.join(@standalone_staging_dir, "jasmine-standalone-#{jasmine_version}.zip")).should be_true
    end

    it "should copy the zip file to the pages sub directory" do
      File.exist?(File.join(download_dir, "jasmine-standalone-#{jasmine_version}.zip")).should be_true
    end
    
    describe "when the zip file is unzipped" do
      before do
        @out_directory = File.join(standalone_temp_dir, 'unzip')
        reset_dir @out_directory

        FileUtils.cp File.join(@standalone_staging_dir, "jasmine-standalone-#{jasmine_version}.zip"),
                     @out_directory

        Dir.chdir @out_directory do
          system("unzip -qq jasmine-standalone-#{jasmine_version}.zip")
        end
      end

      describe "the distirbution" do
        before do
          Dir.chdir @out_directory do
            @files = Dir.glob(File.join('**', '*'))
          end
        end

        it "should include the correct root files" do
          @files.should include('SpecRunner.html')
        end

        it "should include the correct lib files" do
          %w{ jasmine.js jasmine-html.js jasmine.css MIT.LICENSE }.each do |file|
            @files.should include(File.join('lib', "jasmine-#{jasmine_version}", file))
          end
        end

        it "should include the correct src files" do
          %w{Player.js Song.js}.each do |file|
            @files.should include(File.join('src', file))
          end
        end

        it "should include the correct spec files" do
          %w{PlayerSpec.js SpecHelper.js}.each do |file|
            @files.should include(File.join('spec', file))
          end
        end
      end
    end
  end
end