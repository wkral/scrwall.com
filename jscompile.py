import urllib
import urllib2
import json
import sys

lines = []

for f in sys.argv[1:]:
    with open(f) as js:
        lines.extend(js.readlines())

code = ''.join(lines)

request = {
    'js_code': code,
    'compilation_level': 'SIMPLE_OPTIMIZATIONS',
    'output_format': 'json',
    'output_info': 'compiled_code'
}

resp = urllib2.urlopen('http://closure-compiler.appspot.com/compile', urllib.urlencode(request))

code_obj = json.loads(resp.read())
print code_obj['compiledCode']
