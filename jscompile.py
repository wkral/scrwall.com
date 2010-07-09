import urllib
import urllib2
import json
import sys

lines = []

for f in sys.argv[1:]:
    with open(f) as js:
        lines.extend(js.readlines())

code = ''.join(lines)

request = [
    ('js_code', code),
    ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
    ('output_format', 'json'),
    ('output_info', 'compiled_code'),
    ('output_info', 'errors'),
    ('output_info', 'warnings'),
]

resp = urllib2.urlopen('http://closure-compiler.appspot.com/compile', urllib.urlencode(request))

code_obj = json.loads(resp.read())

def print_errors(errors, key):
    for error in errors:
        sys.stderr.write('line, char: %s, %s\n' % (error['lineno'], error['charno']))
        sys.stderr.write('line: %s\n' % error['line'])
        sys.stderr.write('type: %s\n' % error['type'])
        sys.stderr.write('error: %s\n\n' % error[key])

if 'warnings' in code_obj:
    sys.stderr.write('\nWARNINGS:\n---------\n\n')
    print_errors(code_obj['warnings'], 'warning')

if 'errors' in code_obj:
    sys.stderr.write('\nERRORS:\n-------\n\n')
    print_errors(code_obj['errors'], 'error')

else:
    print code_obj['compiledCode']
