class JasmineDev < Thor
  include Thor::Actions

  def self.source_root
    File.dirname(__FILE__)
  end

  def self.source_paths
    [
      File.join(JasmineDev.project_root, 'lib', 'jasmine-core'),
      JasmineDev.project_root
    ]
  end

  def self.project_root
    File.join(JasmineDev.source_root, '..', '..')
  end

  def self.spacer
    "\n--------------------"
  end

  no_tasks do
    # allows merged stdout in test with low-harassment
    def run_with_output(*run_args)
      say run *run_args
    end

    def node_installed?
      return true if has_node?

      say "Node.js is required to develop Jasmine. Please visit http://nodejs.org to install.",
          :red
      false
    end

    def has_node?
      run "which node", :verbose => false, :capture => true
      $?.exitstatus == 0
    end

    def pages_submodule_installed?
      return true if has_pages_submodule?

      say "Submodule for Github Pages isn't present. Run git submodule update --init",
          :red
      false
    end

    def has_pages_submodule?
      File.exist?(File.join(JasmineDev.project_root, 'pages', 'index.html'))
    end
  end
end
