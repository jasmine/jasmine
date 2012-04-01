require 'spec_helper.rb'

describe "Build Jasmine task" do

  let(:jasmine_core_dir) { "#{Dir.tmpdir}/jasmine-core" }
  let(:jasmine_dev) { JasmineDev.new }

  before do
    reset_dir jasmine_core_dir
    @output = capture_output { jasmine_dev.build_distribution jasmine_core_dir }
  end

  it "should say that JSHint is running" do
    @output.should match(/Running JSHint/)
    @output.should match(/Jasmine JSHint PASSED/)
  end

  it "should tell the developer it is building the distribution" do
    @output.should match(/Building Jasmine distribution/)
  end

  it "should build jasmine.js in the destination directory" do
    File.exist?("#{jasmine_core_dir}/jasmine.js").should be_true
  end

  it "should build jasmine-html.js in the destination directory" do
    File.exist?("#{jasmine_core_dir}/jasmine-html.js").should be_true
  end

  it "should build jasmine.css" do
    File.exist?("#{jasmine_core_dir}/jasmine.css").should be_true
  end
end