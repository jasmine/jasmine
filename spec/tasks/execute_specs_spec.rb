require 'spec_helper.rb'

describe "Spec tasks" do

  let(:jasmine_dev) { JasmineDev.new }

  describe "execute_specs_in_node" do
    describe "when Node.js is not present" do
      before do
        jasmine_dev.should_receive(:has_node?).and_return(false)
        @output = capture_output { jasmine_dev.execute_specs_in_node }
      end

      it "should prompt the user to install Node" do
        @output.should match(/Node\.js is required/)
      end
    end

    describe "when Node.js is present" do
      before do
        jasmine_dev.should_receive(:has_node?).and_return(true)
        @output = capture_output { jasmine_dev.execute_specs_in_node }
      end

      it "should build the distribution" do
        @output.should match(/Building Jasmine distribution/)
      end

      it "should tell the developer that the specs are being counted" do
        @output.should match(/Counting specs/)
      end

      it "should tell the user that the specs are running in Node.js" do
        @output.should match(/specs via Node/)
        @output.should match(/Started/)
        @output.should match(/\d+ specs, 0 failures/)
      end
    end
  end

  describe "execute_specs_in_browser" do
    before do
      jasmine_dev.should_receive(:run)
      @output = capture_output { jasmine_dev.execute_specs_in_browser }
    end

    it "should build the distribution" do
      @output.should match(/Building Jasmine distribution/)
    end

    it "should tell the developer that the specs are being counted" do
      @output.should match(/Counting specs/)
    end

    it "should tell the user that the specs are running in the broswer" do
      @output.should match(/specs via the default web browser/)
    end
  end

  describe "execute_specs" do
    before do
      @output = capture_output { jasmine_dev.execute_specs }
    end

    it "should build the distribution" do
      @output.should match(/Building Jasmine distribution/)
    end

    it "should tell the developer that the specs are being counted" do
      @output.should match(/Counting specs/)
    end

    it "should tell the user that the specs are running in Node.js" do
      @output.should match(/specs via Node/)
    end

    it "should tell the user that the specs are running in the broswer" do
      @output.should match(/specs via the default web browser/)
    end
  end
end