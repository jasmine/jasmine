module FrankHelpers
  def jasmine_snippet
    "<span class='nx'>describe</span><span class='p'>(</span><span class='s2'>&quot;Jasmine&quot;</span><span class='p'>,</span> <span class='kd'>function</span><span class='p'>()</span> <span class='p'>{</span>
  <span class='nx'>it</span><span class='p'>(</span><span class='s2'>&quot;makes testing JavaScript awesome!&quot;</span><span class='p'>,</span> <span class='kd'>function</span><span class='p'>()</span> <span class='p'>{</span>
    <span class='nx'>expect</span><span class='p'>(</span><span class='nx'>yourCode</span><span class='p'>).</span><span class='nx'>toBeLotsBetter</span><span class='p'>();</span>
  <span class='p'>});</span>
<span class='p'>});</span>"
  end

  def downloads
    require 'digest/sha1'

    Dir.glob('../downloads/*.zip').sort.reverse.collect do |f|
      item            = {}
      item[:filename] = File.basename(f)
      item[:version]  = /jasmine-standalone-(.*).zip/.match(f)[1]
      item[:rc]       = /\.rc/.match(f) ? 'rc' : ''
      item[:size]     = "#{File.size(f) / 1024}k"
      item[:date]     = File.mtime(f).strftime("%Y/%m/%d %H:%M:%S %Z")
      item[:sha]      = Digest::SHA1.hexdigest File.read(f)
      item
    end
  end

end