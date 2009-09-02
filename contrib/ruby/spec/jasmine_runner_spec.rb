require 'spec'
require 'open-uri'
require File.dirname(__FILE__) + '/../jasmine_runner'

describe Jasmine::SimpleServer do
  before do
    @port = Jasmine::find_unused_port
  end
  
  after do
    Jasmine::kill_process_group(@jasmine_server_pid) if @jasmine_server_pid
  end

  it "should start and print script tags" do
    @jasmine_server_pid = fork do
      Process.setpgrp
      Jasmine::SimpleServer.start(@port, ["file1", "file2"], {})
      exit! 0
    end

    Jasmine::wait_for_listener(@port)

    run_html = open("http://localhost:#{@port}/").read
    run_html.should =~ /<script src="file1"/
    run_html.should =~ /<script src="file2"/
  end

  it "should take a proc that returns a list of spec files" do
    spec_fileses = [["file1", "file2"], ["file1", "file2", "file3"]]
    spec_files_proc = lambda do
      spec_fileses.shift
    end
    
    @jasmine_server_pid = fork do
      Process.setpgrp
      Jasmine::SimpleServer.start(@port, spec_files_proc, {})
      exit! 0
    end

    Jasmine::wait_for_listener(@port)

    run_html = open("http://localhost:#{@port}/").read
    run_html.should =~ /<script src="file1"/
    run_html.should =~ /<script src="file2"/

    run_html = open("http://localhost:#{@port}/").read
    run_html.should =~ /<script src="file1"/
    run_html.should =~ /<script src="file2"/
    run_html.should =~ /<script src="file3"/
  end
end