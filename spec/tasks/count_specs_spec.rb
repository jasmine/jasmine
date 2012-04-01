require 'spec_helper.rb'

describe "Spec counting task" do

  let(:jasmine_dev) { JasmineDev.new }

  before do
    @output = capture_output { jasmine_dev.count_specs }
  end

  it "should tell the developer that the specs are being counted" do
    @output.should match(/Counting specs/)
  end

  it "should report the number of specs that will run in node" do
    @output.should match(/\d+ \e\[0mspecs for Node.js/)
  end

  it "should report the number of specs that will run in the browser" do
    @output.should match(/\d+ \e\[0mspecs for Browser/)
  end

  it "should remind the developer to check the count" do
    @output.should match(/Please verify/)
  end
end