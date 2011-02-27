module FrankHelpers
  def jasmine_snippet
    "<span class='nx'>describe</span><span class='p'>(</span><span class='s2'>&quot;Jasmine&quot;</span><span class='p'>,</span> <span class='kd'>function</span><span class='p'>()</span> <span class='p'>{</span>
  <span class='nx'>it</span><span class='p'>(</span><span class='s2'>&quot;makes testing JavaScript awesome!&quot;</span><span class='p'>,</span> <span class='kd'>function</span><span class='p'>()</span> <span class='p'>{</span>
    <span class='nx'>expect</span><span class='p'>(</span><span class='nx'>yourCode</span><span class='p'>).</span><span class='nx'>toBeLotsBetter</span><span class='p'>();</span>
  <span class='p'>});</span>
<span class='p'>});</span>"
  end

end