# Release Notes

## Summary

## Changes

* SHA: [00f88edc04b7e6cf2a92869d444cd8a996e06ee1](https://github.com/pivotal/jasmine/commit/00f88edc04b7e6cf2a92869d444cd8a996e06ee1)
    * [Finishes #52731407](http://www.pivotaltracker.com/story/52731407) Escape special regex characters from the spec param
    * JR Boyens, pair+jboyens@pivotallabs.com


* SHA: [98fa58ee49f4251a413cc56fd42b53bcece05e9f](https://github.com/pivotal/jasmine/commit/98fa58ee49f4251a413cc56fd42b53bcece05e9f)
    * Async timeout support
    * JR Boyens, pair+jboyens@pivotallabs.com


* SHA: [984074ec95320422d0354612603d3c248a69f872](https://github.com/pivotal/jasmine/commit/984074ec95320422d0354612603d3c248a69f872)
    * small QueueRunner refactors
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [6bb8a91301f6cbe90a9cb2163922f028f342978f](https://github.com/pivotal/jasmine/commit/6bb8a91301f6cbe90a9cb2163922f028f342978f)
    * inline the specConstructor
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [97ce3960087d816e3b8bdaa3b4605c3a009e8a1f](https://github.com/pivotal/jasmine/commit/97ce3960087d816e3b8bdaa3b4605c3a009e8a1f)
    * Build distribution; fix test in FF
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [051f3499ecea470fe4a9c490ee14c3a0728fee6c](https://github.com/pivotal/jasmine/commit/051f3499ecea470fe4a9c490ee14c3a0728fee6c)
    * Revert "[Finishes #45476285](http://www.pivotaltracker.com/story/45476285) Add timeout support to async tests"

This reverts commit 8f5d0beb8cebd4cba141db604aaae670fb6add4e.

Async timeout support is just not ready for prime time.
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [8f5d0beb8cebd4cba141db604aaae670fb6add4e](https://github.com/pivotal/jasmine/commit/8f5d0beb8cebd4cba141db604aaae670fb6add4e)
    * [Finishes #45476285](http://www.pivotaltracker.com/story/45476285) Add timeout support to async tests
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [9609aba25fd85561a66156c74e2c2f2fafab14c0](https://github.com/pivotal/jasmine/commit/9609aba25fd85561a66156c74e2c2f2fafab14c0)
    * [Finishes #52959947](http://www.pivotaltracker.com/story/52959947) Warn user about spy conflicts; Refactor spy tests to more reflect responsibilities and removed duplicate tests
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [30aec66ce5e93f983c311a9a9c9590cf38f3e843](https://github.com/pivotal/jasmine/commit/30aec66ce5e93f983c311a9a9c9590cf38f3e843)
    * [Finishes #14177231](http://www.pivotaltracker.com/story/14177231) copy properties onto spy
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [663a58d61735a501a5f0708aff145193b0209750](https://github.com/pivotal/jasmine/commit/663a58d61735a501a5f0708aff145193b0209750)
    * [Finishes #51528655](http://www.pivotaltracker.com/story/51528655) spies should support and.stub()
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [3847557bbcf0308de99c6fc91e5553e2db016050](https://github.com/pivotal/jasmine/commit/3847557bbcf0308de99c6fc91e5553e2db016050)
    * Squashed spy refactor and new spy syntax

Jasmine spies now have a 'and' property which allows the user to
change the spy's execution strategy-- such as '.and.callReturn(4)'
and a 'calls' property which allows inspection of the calls a spy
has received.

* This is a breaking change *

There is a CallTracker that keeps track of all calls and arguments
and a SpyStrategy which determines what the spy should do when it
is called.
    * Davis W. Frank & Sheel Choksi, pair+davis+sheel@pivotallabs.com


* SHA: [18c30566bd54ccc31933de73f983886cd1cd22b6](https://github.com/pivotal/jasmine/commit/18c30566bd54ccc31933de73f983886cd1cd22b6)
    * Move from global to Env
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [f2306729cd97fd9edf8d0367920c1006919dd50b](https://github.com/pivotal/jasmine/commit/f2306729cd97fd9edf8d0367920c1006919dd50b)
    * Improve isIE check to allow us to check for a minimum version
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [2165d71dc5831cc9435954e3118674f9b920ba7b](https://github.com/pivotal/jasmine/commit/2165d71dc5831cc9435954e3118674f9b920ba7b)
    * Update matrix for Safari 5
    * Colin O'Byrne and JR Boyens, pair+cobyrne+jboyens@pivotallabs.com


* SHA: [8c1881053caed0836d0401a49dfad5967da30c23](https://github.com/pivotal/jasmine/commit/8c1881053caed0836d0401a49dfad5967da30c23)
    * Resolve remaining test issues
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [61a1f934887ca34fa00000beb4f4c2ab99d2cc53](https://github.com/pivotal/jasmine/commit/61a1f934887ca34fa00000beb4f4c2ab99d2cc53)
    * Older IE fixes

Still not green, but getting close. Summary of Older IE discrepancies:
- Older IE doesn't have apply/call on the timing functions
- Older IE doesn't allow applying falsy arguments
- Older IE doesn't allow setting onclick to undefined values
- Older IE doesn't have text property on dom nodes
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [d4f78922cd9ffb175df72f7191cb6ddf25a31773](https://github.com/pivotal/jasmine/commit/d4f78922cd9ffb175df72f7191cb6ddf25a31773)
    * Update built distribution, it's a few commits behind
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [04ac41d91191f5d6ebaed45a9bb6cb267a54dbb8](https://github.com/pivotal/jasmine/commit/04ac41d91191f5d6ebaed45a9bb6cb267a54dbb8)
    * Fix phantomjs by using fnNameFor

Phantomjs's execptions toString include a ': ' at the end, so instead
use the exception's name property
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [75b9dc64afc0c5300d2dcfaf8e2e4e32843d5e2e](https://github.com/pivotal/jasmine/commit/75b9dc64afc0c5300d2dcfaf8e2e4e32843d5e2e)
    * Add in Safari version number since that seems to get Sauce to run it
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [2d7fe0b6ce1e62dd331123099ccc634ea900fd9a](https://github.com/pivotal/jasmine/commit/2d7fe0b6ce1e62dd331123099ccc634ea900fd9a)
    * Merge pull request #388 from sheelc/html_self_test

Have Jasmine HTML use the source files in specs
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [44feee57ac6088a754f8ba7fcecc67873d516366](https://github.com/pivotal/jasmine/commit/44feee57ac6088a754f8ba7fcecc67873d516366)
    * Merge pull request #394 from albertandrejev/ObjectContaing-message

ObjectContaining wrong filed value error message
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [1394899c3caae1c75d75fc1bd69ed59eee01f5f7](https://github.com/pivotal/jasmine/commit/1394899c3caae1c75d75fc1bd69ed59eee01f5f7)
    * Even more explanation. Closes #396.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [d0825a37a39718632936012f4981d8e08d640a92](https://github.com/pivotal/jasmine/commit/d0825a37a39718632936012f4981d8e08d640a92)
    * Cleaning up with latest command line tools
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [fc3d08bf40b25e71f2ee26e17b9aba9bdaf0088a](https://github.com/pivotal/jasmine/commit/fc3d08bf40b25e71f2ee26e17b9aba9bdaf0088a)
    * Merge pull request #397 from valera-rozuvan/remove_unnecessary_parameter_to_function_call

Removed unnecessary parameter from suiteFactory() call.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [990cc41f45387121600718c218eadea09e24ead0](https://github.com/pivotal/jasmine/commit/990cc41f45387121600718c218eadea09e24ead0)
    * Remove debugger statement
    * JR Boyens, jboyens@fooninja.org


* SHA: [03ffe5ce6aeb83531bb3c1aededdcec8ba370a0c](https://github.com/pivotal/jasmine/commit/03ffe5ce6aeb83531bb3c1aededdcec8ba370a0c)
    * DRY up some sopping wet code
    * JR Boyens, jboyens@fooninja.org


* SHA: [1b0b4f22a03b4d2c711cc42724ee6b77cd4b5451](https://github.com/pivotal/jasmine/commit/1b0b4f22a03b4d2c711cc42724ee6b77cd4b5451)
    * Fix IE10
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [a6953df28c24e6cf0eba9132afffbbe47c6d8844](https://github.com/pivotal/jasmine/commit/a6953df28c24e6cf0eba9132afffbbe47c6d8844)
    * Add corrected tunnel identifier
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [5e71f3031e38934f8dd823a829c441080410ed6b](https://github.com/pivotal/jasmine/commit/5e71f3031e38934f8dd823a829c441080410ed6b)
    * Update broken travis.yml
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [4ea4ed25eefa6626b6b64f4e82c8f94eabb0fc48](https://github.com/pivotal/jasmine/commit/4ea4ed25eefa6626b6b64f4e82c8f94eabb0fc48)
    * Revert previous change
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [39d40a1cadb528f29609b7a0141669f242214ee3](https://github.com/pivotal/jasmine/commit/39d40a1cadb528f29609b7a0141669f242214ee3)
    * Come on Travis... build it
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [d40e0cebaca41487487c0e7c07b7f7762bb88fe0](https://github.com/pivotal/jasmine/commit/d40e0cebaca41487487c0e7c07b7f7762bb88fe0)
    * Use Sauce Labs to test Jasmine against a metric ton of browsers
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [89a54ea2bb36e364542283a6421ce3eee80a93b7](https://github.com/pivotal/jasmine/commit/89a54ea2bb36e364542283a6421ce3eee80a93b7)
    * Hacking the Gibson
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [bc9c857f434ad039a51068ce46c644c55c06d749](https://github.com/pivotal/jasmine/commit/bc9c857f434ad039a51068ce46c644c55c06d749)
    * Valid YAML again
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [24a7f55fa612758fe8cb8c27146aa09c0e68f058](https://github.com/pivotal/jasmine/commit/24a7f55fa612758fe8cb8c27146aa09c0e68f058)
    * DEBIAN env variable is defined on the OS X host as well
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [182cff4bd4bc55e9e44841fb34ff72832c50873e](https://github.com/pivotal/jasmine/commit/182cff4bd4bc55e9e44841fb34ff72832c50873e)
    * Build matrix tweak
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [5dce5b127240b2a8360d34d592c7a68ecd166cf2](https://github.com/pivotal/jasmine/commit/5dce5b127240b2a8360d34d592c7a68ecd166cf2)
    * Try multi-language OS X build
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [7c17b0685626d0aa8b15ccdfa79a13c577d2d195](https://github.com/pivotal/jasmine/commit/7c17b0685626d0aa8b15ccdfa79a13c577d2d195)
    * Make chromedriver executable
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [6569176cc92e060d7f63002e35b6da5ee8d8a294](https://github.com/pivotal/jasmine/commit/6569176cc92e060d7f63002e35b6da5ee8d8a294)
    * Run specs on multiple browsers
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [0f803430e4771ec907401a828cd17c289e279c17](https://github.com/pivotal/jasmine/commit/0f803430e4771ec907401a828cd17c289e279c17)
    * Testing out travis changes
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [821f13dff51fa391c8962d5d030030a2b454bd3a](https://github.com/pivotal/jasmine/commit/821f13dff51fa391c8962d5d030030a2b454bd3a)
    * Don't refer to window for the sake of Node specs
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [3e2d9baec2bb462b042970722ebe8afe2cb43eae](https://github.com/pivotal/jasmine/commit/3e2d9baec2bb462b042970722ebe8afe2cb43eae)
    * [Finishes #40853563](http://www.pivotaltracker.com/story/40853563) Allowed the DelayedFunctionScheduler to support strings that are eval'd
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [f637c1f83372860b08cb8319d149d4a881fa8bda](https://github.com/pivotal/jasmine/commit/f637c1f83372860b08cb8319d149d4a881fa8bda)
    * Add images dir
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [82b6904093a456267f76924b635f7b6a46082a61](https://github.com/pivotal/jasmine/commit/82b6904093a456267f76924b635f7b6a46082a61)
    * [Finishes #52810607](http://www.pivotaltracker.com/story/52810607) separate out the build standalone tasks
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [0daae4d7b4c006e23ff345709516108289334988](https://github.com/pivotal/jasmine/commit/0daae4d7b4c006e23ff345709516108289334988)
    * Update examples for 2.0
    * Greg Cobb and JR Boyens, pair+gcobb+jboyens@pivotallabs.com


* SHA: [f68657f14e46bdaa144c24f457a8501a21b90d32](https://github.com/pivotal/jasmine/commit/f68657f14e46bdaa144c24f457a8501a21b90d32)
    * Have Jasmine HTML use the source files in specs

Similar to the changes in Jasmine core and console, this gets the
HTML specs of Jasmine using j$ instead of jasmine so that they use
the source files instead of the built distribution
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [c91df21a96cdb3a207095a83618e7314ecfea516](https://github.com/pivotal/jasmine/commit/c91df21a96cdb3a207095a83618e7314ecfea516)
    * Detailed error messages in toThrow/toThrowError

- included what was thrown for failure messages in toThrow and toThrowError
- fixed typo from 'execption' to 'exception' in toThrowError failure messages
- clarified failure messages in toThrowError to include specific error types

[Fixes #52680709](http://www.pivotaltracker.com/story/52680709)
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [5b986c953cc760a192512d1357fadeee208c06df](https://github.com/pivotal/jasmine/commit/5b986c953cc760a192512d1357fadeee208c06df)
    * Remove symlinked boot.js from spec/support

[Finishes #52810587](http://www.pivotaltracker.com/story/52810587)
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [a932320d6c1d00b02f7943e1757989bd13b75166](https://github.com/pivotal/jasmine/commit/a932320d6c1d00b02f7943e1757989bd13b75166)
    * Merge pull request #401 from sheelc/async_queue_runner

Async queue runner fixes
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [aabf8cec8246ed4fa63d55ec8d044d702c74cc73](https://github.com/pivotal/jasmine/commit/aabf8cec8246ed4fa63d55ec8d044d702c74cc73)
    * Specs/Suites wait for an async spec to finish

Go back to having all suites and specs run asynchronously so that
they properly wait for any async specs that there might be
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [ccdcb293f4f15c60d6173866e7b169d80afd2c29](https://github.com/pivotal/jasmine/commit/ccdcb293f4f15c60d6173866e7b169d80afd2c29)
    * Add back in forgotten 'env' to Env integration specs

As pointed out by @jdmarshall. Fixes #399
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [ec7d58fce0ca9475d942afd1a965495e75df3abd](https://github.com/pivotal/jasmine/commit/ec7d58fce0ca9475d942afd1a965495e75df3abd)
    * QueueRunner continues running functions in async case

Continue running functions even if an async spec throws an
exception during the synchronous portion of the spec
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [7f6b16ccf2903c5716835364757394de03fbc281](https://github.com/pivotal/jasmine/commit/7f6b16ccf2903c5716835364757394de03fbc281)
    * Only clear stack when QueueRunner is done with its functions
    * Davis W. Frank and Sheel Choksi, pair+davis+sheel@pivotallabs.com


* SHA: [34b8bf5fb0de8f35800cc140ead3beb054f4a3ab](https://github.com/pivotal/jasmine/commit/34b8bf5fb0de8f35800cc140ead3beb054f4a3ab)
    * Remove Env's calculation of executionTime
[#45659879](http://www.pivotaltracker.com/story/45659879)
    * Sheel Choksi, pair+sheel@pivotallabs.com


* SHA: [179e54b9fb53f5ee508fbbb19f5aaa3d3ea16a9c](https://github.com/pivotal/jasmine/commit/179e54b9fb53f5ee508fbbb19f5aaa3d3ea16a9c)
    * Refactor suite timing out of Env and into each Reporter
[finishes #45659879](http://www.pivotaltracker.com/story/45659879)
    * Davis W. Frank and Sheel Choksi, pair+davis+sheel@pivotallabs.com


* SHA: [09fe7b05400c75a93b1299ca350916fe92508954](https://github.com/pivotal/jasmine/commit/09fe7b05400c75a93b1299ca350916fe92508954)
    * Have QueueRunner run specs iteratively if possible, fallback to recursion for async specs

This prevents the stack from growing as large for the normal cases and is giving a significant speedup for the performance suite
    * Davis W. Frank and Sheel Choksi, pair+davis+sheel@pivotallabs.com


* SHA: [264b1fea50832ac64b18e9ce96c3ca446332bded](https://github.com/pivotal/jasmine/commit/264b1fea50832ac64b18e9ce96c3ca446332bded)
    * Merge the node performance suite into the node suite

The node performance suite can be run with node: `node
spec/node_suite.js --perf`
    * Davis W. Frank and Sheel Choksi, pair+davis+sheel@pivotallabs.com


* SHA: [dcf7a0867ebc3ed07d2f5fb0f09deaea86336865](https://github.com/pivotal/jasmine/commit/dcf7a0867ebc3ed07d2f5fb0f09deaea86336865)
    * Test asynchronous parts of Jasmine asynchronously
    * Davis W. Frank and Sheel Choksi, pair+davis+sheel@pivotallabs.com


* SHA: [f5bc9faf63136715ef9f36ee1824ac024b1b0c52](https://github.com/pivotal/jasmine/commit/f5bc9faf63136715ef9f36ee1824ac024b1b0c52)
    * Rename for stack-clearing post spec run to be more clear; use the real setTimeout when clearing stack
    * Davis W. Frank and Sheel Choksi, pair+davis+sheel@pivotallabs.com


* SHA: [2916a8a1ffea04a654beedd99589ceaa9e2727ca](https://github.com/pivotal/jasmine/commit/2916a8a1ffea04a654beedd99589ceaa9e2727ca)
    * Cleaning up explicit dependencies
    * Davis W. Frank and Sheel Choksi, pair+davis+sheel@pivotallabs.com


* SHA: [8ac33ff6c2ec52fc33112251339f451dcc35b03e](https://github.com/pivotal/jasmine/commit/8ac33ff6c2ec52fc33112251339f451dcc35b03e)
    * Removed unnecessary parameter from suiteFactory() call.
    * Valera Rozuvan, valera@edx.org


* SHA: [661a8844164d4508d9c8595cdd3f93a5e2579d14](https://github.com/pivotal/jasmine/commit/661a8844164d4508d9c8595cdd3f93a5e2579d14)
    * Merge pull request #392 from albertandrejev/jasmine.Any

jasmine.any Boolean support
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [7acc6b327aac1eec6cf5cf7375fb74f327bdcc16](https://github.com/pivotal/jasmine/commit/7acc6b327aac1eec6cf5cf7375fb74f327bdcc16)
    * ObjectContaining wrong filed value error message
    * Albert Andrejev, albert.andrejev@gmail.com


* SHA: [e40e0c917011a98ab32ef879efae36737ab76d14](https://github.com/pivotal/jasmine/commit/e40e0c917011a98ab32ef879efae36737ab76d14)
    * jasmine.any Boolean support
    * Albert Andrejev, albert.andrejev@gmail.com


* SHA: [7ae3fa9fefc66b943059e687b46fd8ea74c560a2](https://github.com/pivotal/jasmine/commit/7ae3fa9fefc66b943059e687b46fd8ea74c560a2)
    * Fixed some specs that were not referring to the correct instance of Jasmine
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [e73b9e790201bb83c321b5908dd9e5159c46b473](https://github.com/pivotal/jasmine/commit/e73b9e790201bb83c321b5908dd9e5159c46b473)
    * Merge pull request #384 from sheelc/apireporter_execution_time

Add execution time elapsed to JsApiReporter
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [ffdf1eb16dd337f236e03c6b4fb6c8b5e0597ae7](https://github.com/pivotal/jasmine/commit/ffdf1eb16dd337f236e03c6b4fb6c8b5e0597ae7)
    * Add execution time elapsed to JsApiReporter

Since this information is desired in ConsoleReporter, HtmlReporter,
and now JsApiReporter, the executionTime is passed through in
jasmineDone from Env instead of making each reporter compute it.

Fixes #30, [Finishes #45659879](http://www.pivotaltracker.com/story/45659879)
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [d5f126441686d03240d77f341abc45ff2d897feb](https://github.com/pivotal/jasmine/commit/d5f126441686d03240d77f341abc45ff2d897feb)
    * Merge pull request #383 from sheelc/remove_format_exception

Remove unused formatException from util
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [579fddc2d2c17579717ae81a189078b640d017e9](https://github.com/pivotal/jasmine/commit/579fddc2d2c17579717ae81a189078b640d017e9)
    * Remove unused formatException from util

The ExceptionFormatter is used instead of formatException from jasmine util
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [313e607135568ca4ede74f3dee82b6f34de23a76](https://github.com/pivotal/jasmine/commit/313e607135568ca4ede74f3dee82b6f34de23a76)
    * Merge pull request #369 from sheelc/query-selectors

Query selectors
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [b6599d52aa076ffab8226eac9a063a41e1a72418](https://github.com/pivotal/jasmine/commit/b6599d52aa076ffab8226eac9a063a41e1a72418)
    * Merge pull request #358 from sheelc/safari_exception_fix

Fix spec to throw error, ensuring a stack property
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [582ad6512ad7f410669892d6cc00b14920646ce5](https://github.com/pivotal/jasmine/commit/582ad6512ad7f410669892d6cc00b14920646ce5)
    * Merge pull request #379 from sheelc/toThrowError_fixup

Fix up refactoring mistake in toThrowError
    * pivotalprivate, accounts+github+private@pivotallabs.com


* SHA: [600be098af7f320aec09a119bcd415b1f5067e46](https://github.com/pivotal/jasmine/commit/600be098af7f320aec09a119bcd415b1f5067e46)
    * Fix up my refactoring mistake in toThrowError

strengthen the associated tests to protect against it in the future
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [b87eb240b3b8fd9ee28966d195e4da48c5d7e537](https://github.com/pivotal/jasmine/commit/b87eb240b3b8fd9ee28966d195e4da48c5d7e537)
    * Merge pull request #378 from sheelc/toThrowError_modifications

Avoid instantiating passed in errorType in toThrowError
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [7055d95584d33bb8e84f469313eb57a70aefdc6e](https://github.com/pivotal/jasmine/commit/7055d95584d33bb8e84f469313eb57a70aefdc6e)
    * Avoid instantiating passed in errorType in toThrowError

since the passed in errorType could be a custom user function,
we instead detect if its an instanceof Error by using a Surrogate
(inspired by Backbone's use of surrogacy)
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [1c87060804f129542a2e9315ca676bec68c66584](https://github.com/pivotal/jasmine/commit/1c87060804f129542a2e9315ca676bec68c66584)
    * Fix spec to throw error, ensuring a stack property

In Safari Mac 6.0.4 (and possibly other versions), a new error does
not have the stack property. Throwing the error and then catching it
ensures that the stack property has the correct value.

This fix gets the specs to run green in Safari.
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [b4acdbd90ab9ed85b7489af2e51f824f29650ed2](https://github.com/pivotal/jasmine/commit/b4acdbd90ab9ed85b7489af2e51f824f29650ed2)
    * Remove use of getElementsByTagName and getElementsByClassName

Replace calls to these functions with querySelector and querySelectorAll
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [fbb9f53524945ad2358456c24d170d33f3289eb7](https://github.com/pivotal/jasmine/commit/fbb9f53524945ad2358456c24d170d33f3289eb7)
    * Fixing red build. Not sure why, but this spec was green in Chrome and Node.js
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [0ac497db6b6bead644dcf7000592ff89ebcc8647](https://github.com/pivotal/jasmine/commit/0ac497db6b6bead644dcf7000592ff89ebcc8647)
    * Simplifying toThrow:
- It still supports no expected, which means that something was thrown
- Expected value is now tested via equality in order to pass

Adding toThrowError:
- toThrowError() passes if an Error type was thrown
- toThrowError(String) & toThrowError(RegExp) compare Expected to the Error message
- toThrowError(Error constructor) compares Expected to the constructor of what was thrown
- toThrowError(Error constructor, String) & toThrowError(Error constructor, RegExp) compares both the Error and the message

Also, equality now handles Errors, enforcing the message as part of the equality.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [9e31201f1a8e350c5a2ea9b904ed1597746123e8](https://github.com/pivotal/jasmine/commit/9e31201f1a8e350c5a2ea9b904ed1597746123e8)
    * Breaking out Spies into their own source file
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [d53002c63a1dff6e6e22bc13cb62987118b2bc7a](https://github.com/pivotal/jasmine/commit/d53002c63a1dff6e6e22bc13cb62987118b2bc7a)
    * Matchers & Matchers specs now broken up into individual files. There is now a requireMatchers jasmineRequire function to attach matchers properly.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [3271dc8838ff9caf0dea09518c59eaad7e9ee9f0](https://github.com/pivotal/jasmine/commit/3271dc8838ff9caf0dea09518c59eaad7e9ee9f0)
    * Last commit did not include self-test with Any and ObjectContaining in separate files. Fixed.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [475aacbfbbbe598eb4aa4223deac3ff0683ba66f](https://github.com/pivotal/jasmine/commit/475aacbfbbbe598eb4aa4223deac3ff0683ba66f)
    * [Finishes #50607273](http://www.pivotaltracker.com/story/50607273) - added specs to cover the cases from GitHub issue #371
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [8303c79f26fe3d3daf5f176b76e673ca8e1ea2bf](https://github.com/pivotal/jasmine/commit/8303c79f26fe3d3daf5f176b76e673ca8e1ea2bf)
    * Adding spec to cover equality of frozen objects, per GitHub issue #266
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [5700ace2c9bb7f585fe9e821a1a3b0b60f2ad542](https://github.com/pivotal/jasmine/commit/5700ace2c9bb7f585fe9e821a1a3b0b60f2ad542)
    * Squashed matchers refactor - matchers now unit-testable apart from Expectation and Spec.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [aca43bd3a382449ae2654c0e32e79476c23c805b](https://github.com/pivotal/jasmine/commit/aca43bd3a382449ae2654c0e32e79476c23c805b)
    * Squashed commit of work to make Jasmine a collection of isolated modules. Note now that in our test suite, "jasmine" now always refers to the build jasmine loaded from jasmine.js and "j$" always refers to the code in the src directories.

Also, dev_boot.js is now a copy of boot.js and has additional changes to load jasmine the second time, into the j$ reference.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [7516bba2b0d11a76710ec93a7e4cca782268dec2](https://github.com/pivotal/jasmine/commit/7516bba2b0d11a76710ec93a7e4cca782268dec2)
    * Updating gem source to secure version
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [4f19d34ad7e2fa0af52a6f9390af24503143cd78](https://github.com/pivotal/jasmine/commit/4f19d34ad7e2fa0af52a6f9390af24503143cd78)
    * Merge pull request #363 from robinboehm/remove-deprecated-matcherspp

Remove deprecated jasmine.Matchers.pp function.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [c40b64a24c607596fa7488f2a0ddb98d063c872a](https://github.com/pivotal/jasmine/commit/c40b64a24c607596fa7488f2a0ddb98d063c872a)
    * Remove deprecated jasmine.Matchers.pp function. Marked deprecated at may 2010.
    * Robin Böhm, robinboehm@googlemail.com


* SHA: [baad5ff01f96b4d34ceee5e74ac0f62a46998409](https://github.com/pivotal/jasmine/commit/baad5ff01f96b4d34ceee5e74ac0f62a46998409)
    * Merge pull request #356 from sheelc/spec_titles

Add titles to specs in HtmlReporter
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [bf2adf55ebf25386b0a2bfe0323a14d4fe02b575](https://github.com/pivotal/jasmine/commit/bf2adf55ebf25386b0a2bfe0323a14d4fe02b575)
    * Add titles to specs in HtmlReporter

Each spec symbol contains a title, which is the full name of the
spec it represents.

[Finishes #48420677](http://www.pivotaltracker.com/story/48420677)
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [dd8d3f9788d24745a2bcdd3f9d2f42a84dc58bd6](https://github.com/pivotal/jasmine/commit/dd8d3f9788d24745a2bcdd3f9d2f42a84dc58bd6)
    * Fix [#48420035](http://www.pivotaltracker.com/story/48420035)
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [9c4467bac0f892ce133f9ca0b53e818d53f303d5](https://github.com/pivotal/jasmine/commit/9c4467bac0f892ce133f9ca0b53e818d53f303d5)
    * Merge pull request #347 from sheelc/regex-exception-matching

Regex exception matching
    * Rajan Agaskar, ragaskar@gmail.com


* SHA: [c0172571647e4e48d0595452852a47e4bc977459](https://github.com/pivotal/jasmine/commit/c0172571647e4e48d0595452852a47e4bc977459)
    * add in regex matching for toThrow matcher
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [2445fb36dc44203de77787de53fce9506712b483](https://github.com/pivotal/jasmine/commit/2445fb36dc44203de77787de53fce9506712b483)
    * simplify failure message logic in the toThrow matcher
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [eec6d7d23ece1d38386828db9ba944ef10a0d732](https://github.com/pivotal/jasmine/commit/eec6d7d23ece1d38386828db9ba944ef10a0d732)
    * update lib/jasmine-core/jasmine.js to make 'grunt execSpecsinNode' pass again
    * Sheel Choksi, sheelchoksi@gmail.com


* SHA: [3110da62e5ef96d0694bc693fa3a53bec9234603](https://github.com/pivotal/jasmine/commit/3110da62e5ef96d0694bc693fa3a53bec9234603)
    * Update Contribute.markdown
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [d41b281eb18831dc2a5533869aa50be55cc8e5ed](https://github.com/pivotal/jasmine/commit/d41b281eb18831dc2a5533869aa50be55cc8e5ed)
    * Update Contribute.markdown

Adding link for how to get grunt-cli installed
    * pivotalprivate, accounts+github+private@pivotallabs.com


* SHA: [6feb12485310595d106268b4a2fc7af491a104de](https://github.com/pivotal/jasmine/commit/6feb12485310595d106268b4a2fc7af491a104de)
    * Remove JSDocs from everywhere in the Repo - source code, GHPages, etc. We're not using them and the stale docs were confusing. Fixes #338 Fixes #99
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [3be247ceb1e404b46222242ad1d40096035afea5](https://github.com/pivotal/jasmine/commit/3be247ceb1e404b46222242ad1d40096035afea5)
    * Merge branch 'master' of https://github.com/pivotal/jasmine
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [edc2bfae93208ebf30824a2842f06b543f82fc10](https://github.com/pivotal/jasmine/commit/edc2bfae93208ebf30824a2842f06b543f82fc10)
    * All Jasmine file manipulation/development moved from Thor to Grunt. Thor has been removed completely. Run `grunt --help` to see available tasks.

Canonical Jasmine version now lives in `package.json` (Node formatted) and is copied into Jasmine source (JavaScript and Ruby)

Jasmine distribution now has MIT license and Pivotal Labs copyright at the top of each distributed file.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [01b2fc612caa5bcc34d2f387ea759225adbd75e4](https://github.com/pivotal/jasmine/commit/01b2fc612caa5bcc34d2f387ea759225adbd75e4)
    * Merge pull request #340 from CaioToOn/fix-clock-settimeout DelayedFunctionScheduler tick, setTimeout/Interval delay defaults to 0
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [d8f6aac2cd19da0a8f260dc26bc3b3eab520446f](https://github.com/pivotal/jasmine/commit/d8f6aac2cd19da0a8f260dc26bc3b3eab520446f)
    * Added spec for #tick default delay
    * Caio Cunha, opensource@caiotoon.com


* SHA: [e7a930a5b35720e4dc933ff6e2c93e92c0073115](https://github.com/pivotal/jasmine/commit/e7a930a5b35720e4dc933ff6e2c93e92c0073115)
    * DelayedFunctionScheduler tick, setTimeout/Interval delay defaults to 0

If ommited or null, delay for refered methods will default to 0. This
will make setTimeout and setInterval methods to behave as expected by
[HTML5 specs](http://www.w3.org/TR/html51/webappapis.html#timers):

"Let timeout [delay] be the second argument to the method, or zero if the
argument was omitted."

This commit also fixes an issue with tick() being called without arguments,
that causes the scheduler to break and stop working after this call.
    * Caio Cunha, opensource@caiotoon.com


* SHA: [538b32e40133f2a5997b1a304d72eb3d9b6292c0](https://github.com/pivotal/jasmine/commit/538b32e40133f2a5997b1a304d72eb3d9b6292c0)
    * Default character encoding is now UTF-8
    * Dan Hansen and Davis W. Frank, pair+dhansen+dwf@pivotallabs.com


* SHA: [e6e8908f4930e89ced4c38a83add477c658acfdb](https://github.com/pivotal/jasmine/commit/e6e8908f4930e89ced4c38a83add477c658acfdb)
    * Merge pull request #332 from bjornblomqvist/preserve-whitespace-in-result-message. Fixes #296, Whitespace failures will now be esier to understand.
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [86dafd5d2da7d50fa71696ba3ef23dcf75c703b5](https://github.com/pivotal/jasmine/commit/86dafd5d2da7d50fa71696ba3ef23dcf75c703b5)
    * Merge pull request #329 from sunliwen/master
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [aa60d5f00d954ce47fd4c5ffce8be16fc8ddc33a](https://github.com/pivotal/jasmine/commit/aa60d5f00d954ce47fd4c5ffce8be16fc8ddc33a)
    * Removed old jsDoc comments
    * Davis W. Frank, dwfrank+github@infe.ws


* SHA: [079e6e1e089ad8e2dc9212614712978c03c6ea65](https://github.com/pivotal/jasmine/commit/079e6e1e089ad8e2dc9212614712978c03c6ea65)
    * Merge pull request #333 from bjornblomqvist/utf8-fix fix so that utf-8 characters are rendered correctly in the browser
    * Davis W. Frank, dwfrank+github@infe.ws

* SHA: [e09fd4093302b63776af14ade7e56e5442e2c693](https://github.com/pivotal/jasmine/commit/e09fd4093302b63776af14ade7e56e5442e2c693)
    * Move to grunt for building all distribution files.
    * Dan Hansen and Davis W. Frank, pair+dhansen+dwf@pivotallabs.com

* SHA: [6eecc562ff14302a9b474b81962cb712e0de4e4d](https://github.com/pivotal/jasmine/commit/6eecc562ff14302a9b474b81962cb712e0de4e4d)
    * This spec is for a case where FF *sometimes* loses it's exception message property. Fixed the spec using a double so that the test will
run green on non-FF environments.
    * Dan Hansen and Davis W. Frank, pair+dhansen+dwf@pivotallabs.com


* SHA: [cf7bb0269b573eab87cbc3f613dea74f6e1b2078](https://github.com/pivotal/jasmine/commit/cf7bb0269b573eab87cbc3f613dea74f6e1b2078)
    * Added grunt to project.
    * Dan Hansen and Davis W. Frank, pair+dhansen+dwf@pivotallabs.com

* SHA: [b7af6abca5d03535eabd0c25ab1c2f20380c80c8](https://github.com/pivotal/jasmine/commit/b7af6abca5d03535eabd0c25ab1c2f20380c80c8)
    * Support pending specs with: `xit`, `it` with a null function body ( `it("should be pending");` ). calling `pending()` inside a spec, or having a spec without any expectations
    * Suites are still disabled with `xdescribe` and means its specs are never executed.
    * Dan Hansen and Davis W. Frank, pair+dhansen+dwf@pivotallabs.com

* SHA: [d6da13a8ddb07eb37e577bc2076bed486ba7b0d5](https://github.com/pivotal/jasmine/commit/d6da13a8ddb07eb37e577bc2076bed486ba7b0d5)
    * Attempt at normalizing error stacks across browsers. Failed expectations now have a `stack` property, remove `trace.stack`
    * Dan Hansen and Davis W. Frank, pair+dhansen+dwf@pivotallabs.com


* SHA: [92492c01446140908e0b6429f93db371278eee2c](https://github.com/pivotal/jasmine/commit/92492c01446140908e0b6429f93db371278eee2c)
    * Env#addMatchers is no longer exposed on spec, it is exposed globally in boot.js.
    * Dan Hansen and Davis W. Frank, pair+dhansen+dwf@pivotallabs.com

* SHA: [98ae076f0c11385406e1c019c49ca689a7672ba9](https://github.com/pivotal/jasmine/commit/98ae076f0c11385406e1c019c49ca689a7672ba9)
    * JsApiReporter - better inteface for getting spec results (it's a slice!)
    * Dan Hansen and Davis W. Frank, pair+dhansen+dwf@pivotallabs.com


* SHA: [5a744884fe1d853af9f879b4ae765ab01d9b87d1](https://github.com/pivotal/jasmine/commit/5a744884fe1d853af9f879b4ae765ab01d9b87d1)
    * fix so that utf-8 characters are rendered correctly in the browser
    * Darwin, darwin.git@marianna.se


* SHA: [e6888b840de7eec583855f940a66df1479860df3](https://github.com/pivotal/jasmine/commit/e6888b840de7eec583855f940a66df1479860df3)
    * Fixes #296, Whitespace failures will now be esier to understand.
    * Darwin, darwin.git@marianna.se

* SHA: [e682d1838762a7155d3748ae6469c55c7e523a56](https://github.com/pivotal/jasmine/commit/e682d1838762a7155d3748ae6469c55c7e523a56)
    * When filtering spec, match against the full name of the spec
    * Dan Hansen, pair+dhansen@pivotallabs.com


* SHA: [3fc79bac9e3097d75fffcfc774ac77743d55e596](https://github.com/pivotal/jasmine/commit/3fc79bac9e3097d75fffcfc774ac77743d55e596)
    * New reporter interface across all reporters
    * xdescribe & xit now store disabled specs
    * Rewrite of HtmlReporter to support new interface and be more performant
    * Davis W. Frank, dwfrank@pivotallabs.com

* SHA: [05977203a6a8556ddf8420192070a93a643e5671](https://github.com/pivotal/jasmine/commit/05977203a6a8556ddf8420192070a93a643e5671)
    * Cleanup of Exception formatting (incl. better Browser support re: toString;
    * Davis W. Frank, dwfrank@.infe.ws

* SHA: [5bea864e1c9162a5ffb92ff6551d0135072caf2d](https://github.com/pivotal/jasmine/commit/5bea864e1c9162a5ffb92ff6551d0135072caf2d)
    * Update README.markdown
    * Sun, Liwen, sunliwen@gmail.com


* SHA: [a9eaa66da59755c865847ba4aed2a92f76ee8aaa](https://github.com/pivotal/jasmine/commit/a9eaa66da59755c865847ba4aed2a92f76ee8aaa)
    * removing the exception formatter from the util namespace
    * Davis W. Frank, dwfrank@.infe.ws


* SHA: [30bf565e69d929de3b1500cca2b5e882349b88cd](https://github.com/pivotal/jasmine/commit/30bf565e69d929de3b1500cca2b5e882349b88cd)
    * removing jasmine.VERBOSE - not used
    * Davis W. Frank, dwfrank@.infe.ws


* SHA: [668dd784ef0dcf031d805c3d3789aaec9d97f9cb](https://github.com/pivotal/jasmine/commit/668dd784ef0dcf031d805c3d3789aaec9d97f9cb)
    * Remove jasmine.util.extend
    * Davis W. Frank, dwfrank@.infe.ws


* SHA: [43552494ee9e6bedd78e3e16ff45883d1edba62c](https://github.com/pivotal/jasmine/commit/43552494ee9e6bedd78e3e16ff45883d1edba62c)
    * Remove jasmine.CATCH_EXCEPTIONS
    * Rajan Agaskar, rajan@pivotallabs.com


* SHA: [98c99c4ebba67c4a64182a737bbf67afbcf26efe](https://github.com/pivotal/jasmine/commit/98c99c4ebba67c4a64182a737bbf67afbcf26efe)
    * jasmine.log is no longer supported.
    * Rajan Agaskar, rajan@pivotallabs.com


* SHA: [4318de464727adf747939256ac14f9aaae95b1a0](https://github.com/pivotal/jasmine/commit/4318de464727adf747939256ac14f9aaae95b1a0)
    * Remove obsolete bindOriginal, timing bindings.
    * Rajan Agaskar, rajan@pivotallabs.com


* SHA: [a526ebf26179afaad719e73de198c265031e5241](https://github.com/pivotal/jasmine/commit/a526ebf26179afaad719e73de198c265031e5241)
    * Re-add async support (achieved via done callbacks)
    * Davis W. Frank & Rajan Agaskar, pair+dwfrank+rajan@pivotallabs.com

* SHA: [c2e1327f39cbd691a64b4deb3d8525006b403e1e](https://github.com/pivotal/jasmine/commit/c2e1327f39cbd691a64b4deb3d8525006b403e1e)
    * Permit HTMLReporter to render every 250ms
    * Davis W. Frank & Rajan Agaskar, pair+dwfrank+rajan@pivotallabs.com

* SHA: [74f928fd5402a9daabb7afb7ed52312abfc6b104](https://github.com/pivotal/jasmine/commit/74f928fd5402a9daabb7afb7ed52312abfc6b104)
    * Re-add Mock Clock behavior as global 'clock'. Use clock.install, clock.tick...
    * Davis W. Frank & Rajan Agaskar, pair+dwfrank+rajan@pivotallabs.com



* SHA: [8b02bf731b193e135ccb486e99b3ecd7165bf95c](https://github.com/pivotal/jasmine/commit/8b02bf731b193e135ccb486e99b3ecd7165bf95c)
    * Make all tests use syntax compatible with IE6/7/8
    * Vikki, vikki.read@gmail.com


* SHA: [cd3a0c854b454241661cce609bbf1d54c96d1ba7](https://github.com/pivotal/jasmine/commit/cd3a0c854b454241661cce609bbf1d54c96d1ba7)
    * buildExpectationResult now returns a data object. Meant for passing to reporters.
    * Davis W. Frank & Rajan Agaskar, pair+dwfrank+rajan@pivotallabs.com


* SHA: [34bd1969e7cc704fe70239095b76511ed635cd46](https://github.com/pivotal/jasmine/commit/34bd1969e7cc704fe70239095b76511ed635cd46)
    * Add performance smoke suite
    * Davis W. Frank & Rajan Agaskar, pair+dwfrank+rajan@pivotallabs.com



* SHA: [3e5da57cf91f72172ac47ea4afba1197fc899491](https://github.com/pivotal/jasmine/commit/3e5da57cf91f72172ac47ea4afba1197fc899491)
    * Remove jasmine.XmlHttpRequest

* SHA: [e2af08e0a68b1090bd05c55fb9b0969198eb330a](https://github.com/pivotal/jasmine/commit/e2af08e0a68b1090bd05c55fb9b0969198eb330a)
    * Move most jasmine global usage into boot.
    * Davis W. Frank & Rajan Agaskar, pair+dwfrank+rajan@pivotallabs.com

------

_Release Notes generated with _[Anchorman](http://github.com/infews/anchorman)_