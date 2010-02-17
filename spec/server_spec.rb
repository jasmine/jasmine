require File.expand_path(File.join(File.dirname(__FILE__), "spec_helper"))

def read(body)
  return body if body.is_a?(String)
  out = ""
  body.each {|data| out += data }
  out
end

describe Jasmine::Server do
  before(:each) do
    config = Jasmine::Config.new
    config.stub!(:mappings).and_return({
        "/src" => File.join(Jasmine.root, "src"),
        "/spec" => File.join(Jasmine.root, "spec")
    })

    config.stub!(:js_files).and_return(["/src/file1.js", "/spec/file2.js"])

    @server = Jasmine::Server.new(0, config)
    @thin_app = @server.thin.app
  end

  after(:each) do
    @server.thin.stop if @server && @server.thin.running?
  end

  it "should serve static files" do
    code, headers, body = @thin_app.call("PATH_INFO" => "/spec/suites/EnvSpec.js", "SCRIPT_NAME" => "xxx")
    code.should == 200
    headers["Content-Type"].should == "application/javascript"
    read(body).should == File.read(File.join(Jasmine.root, "spec/suites/EnvSpec.js"))
  end

  it "should serve Jasmine static files under /__JASMINE_ROOT__/" do
    code, headers, body = @thin_app.call("PATH_INFO" => "/__JASMINE_ROOT__/lib/jasmine.css", "SCRIPT_NAME" => "xxx")
    code.should == 200
    headers["Content-Type"].should == "text/css"
    read(body).should == File.read(File.join(Jasmine.root, "lib/jasmine.css"))
  end

  it "should redirect /run.html to /" do
    code, headers, body = @thin_app.call("PATH_INFO" => "/run.html", "SCRIPT_NAME" => "xxx")
    code.should == 302
    headers["Location"].should == "/"
  end

  it "should 404 non-existent files" do
    code, headers, body = @thin_app.call("PATH_INFO" => "/some-non-existent-file", "SCRIPT_NAME" => "xxx")
    code.should == 404

  end

  describe "/ page" do
    it "should load each js file in order" do
      code, headers, body = @thin_app.call("PATH_INFO" => "/", "SCRIPT_NAME" => "xxx", "REQUEST_METHOD" => 'GET')
      code.should == 200
      body = read(body)
      body.should include("\"/src/file1.js")
      body.should include("\"/spec/file2.js")
      body.should satisfy {|s| s.index("/src/file1.js") < s.index("/spec/file2.js") }
    end

    it "should return an empty 200 for HEAD requests to /" do
      code, headers, body = @thin_app.call("PATH_INFO" => "/", "SCRIPT_NAME" => "xxx", "REQUEST_METHOD" => 'HEAD')
      code.should == 200
      headers.should == { 'Content-Type' => 'text/html' }
      body.should == ''
    end

  end

end