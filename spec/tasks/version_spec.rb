require 'spec_helper.rb'

describe "Version tasks" do

  let(:jasmine_dev) { JasmineDev.new }

  describe "write_version_files" do

    before do
      @output = capture_output { jasmine_dev.write_version_files }
    end

    it "should tell the user that the task has started" do
      @output.should match(/Building version files/)
    end

    it "should build the version.js file" do 
      js_version = File.read(File.join(project_root, 'src', 'version.js'))
      js_version.should match(%Q{"build": #{jasmine_version_object["build"]}})
      js_version.should match(%Q{"minor": #{jasmine_version_object["minor"]}})
      js_version.should match(%Q{"build": #{jasmine_version_object["build"]}})

      if jasmine_version_object["release_candidate"]
        js_version.should match(%Q{"release_candidate": #{jasmine_version_object["release_candidate"]}})
      end

      js_version.should match(/"revision": \d+/)
    end
    
    it "should build the jasmine-core ruby gem version" do
      ruby_version = File.read(File.join(project_root, 'lib', 'jasmine-core', 'version.rb'))
      ruby_version.should match(%Q{VERSION = "#{jasmine_version}"})
    end
  end

  describe "display_version" do
    describe "when Node.js is not present" do
      before do
        @output = capture_output { jasmine_dev.display_version }
      end

      it "should display a version header" do
        @output.should match(/Current version/)
      end

      it "should display the current version Object" do
        @output.should match(/Display version: \e\[33m\d+\.\d+\.\d+/)
      end

      it "should display the current version string" do
        @output.should match(/\{ "major": \d+, "minor": \d+, "build": \d+/)
      end
    end
  end
end