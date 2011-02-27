# ----------------------
#  Server settings:
#
#  Change the server host/port to bind rack to.
# 'server' can be any Rack-supported server, e.g.
#  Mongrel, Thin, WEBrick
#
Frank.server.handler = "mongrel"
Frank.server.hostname = "0.0.0.0"
Frank.server.port = "3601"

# ----------------------
#  Static folder:
#
#  All files in this folder will be served up
#  directly, without interpretation
#
Frank.static_folder = "static"

# ----------------------
#  Dynamic folder:
#
#  Frank will try to interpret any of the files
#  in this folder based on their extension
#
Frank.dynamic_folder = "dynamic"

# ----------------------
#  Layouts folder:
#
#  Frank will look for layouts in this folder
#  the default layout is `default'
#  it respects nested layouts that correspond to nested
#  folders in the `dynamic_folder'
#  for example: a template: `dynamic_folder/blog/a-blog-post.haml'
#  would look for a layout: `layouts/blog/default.haml'
#  and if not found use the default: `layouts/default.haml'
#
#  Frank also supports defining layouts on an
#  individual template basis using meta data
#  you can do this by defining a meta field `layout: my_layout.haml'
#
Frank.layouts_folder = "layouts"

# ----------------------
#  Publish settings:
#
#  Frank can publish your exported project to
#  a server. All you have to do is tell Frank what host, path, and username.
#  If you have ssh keys setup there is no need for a password.
#  Just uncomment the Publish settings below and
#  make the appropriate changes.
#
#  Frank.publish.host = "example.com"
#  Frank.publish.path = "/www"
#  Frank.publish.username = 'me'
#  Frank.publish.password = 'secret'
#  Frank.publish.port = 22
#

# ----------------------
# Sass Options:
# Frank.sass_options = { :load_paths => [ File.join(File.dirname(__FILE__), 'dynamic/css') ] }


# ----------------------
# Initializers:
#
# Add any other project setup code, or requires here
# ....