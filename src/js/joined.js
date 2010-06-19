/*
    http://www.JSON.org/json2.js
    2010-03-20

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
var boxes = {
    intersect: function(b1, b2, horizontal) {
        return horizontal ? 
            b1.top <= b2.bottom && b2.top <= b1.bottom:
            b1.left <= b2.right && b2.left <= b1.right;
    },

    overlap: function(b1, b2) {
        return this.intersect(b1, b2, true) && this.intersect(b1, b2, false);
    },

    left_of: function(b1, b2) {
        return b1.right < b2.left;
    },

    above: function(b1, b2) {
        return b1.bottom < b2.top;
    },

    to_string: function(box) {
        return '{ left: ' + box.left + ' right: ' + box.right +
            ' top: ' + box.top + ' bottom:' + box.bottom + '}';
    }
}/* 
 * BSP Tree inspired data structure for space optimization
 *
 * Nodes of the tree will be comprised of vectors with x and y coordinate
 * and a horizontal/vertical flag
 *
 * Leaves of the tree will be images with left, right, top, bottom edge data
 *
 * Nodes will alternate between hoirzontal and vertical vectors
 *
 * The vectors divide an infinite plane and do not detect if they intersect
 * with each other
 *
 * boxes put into the tree will be split each time they encounter a dividing
 * vector and create more leaves
 *
 * this will fail if boxes overlap
 */

function BSPTree() {

    function less_than(box, vec) {
        return vec.horizontal ? vec.y > box.bottom : vec.x > box.right;
    }

    function intersects(box, vec) {
        return vec.horizontal ? 
            vec.y > box.top && vec.y <= box.bottom :
            vec.x > box.left && vec.x <= box.right;
    }

    function split(box, vec) {
        var s = {lt: $.extend({}, box), gt: $.extend({}, box)};
        if(vec.horizontal) {
            s.lt.bottom = vec.y -1;
            s.gt.top = vec.y;
        } else {
            s.gt.left = vec.x;
            s.lt.right = vec.x -1;
        }
        set_dimentions(s.lt);
        set_dimentions(s.gt);
        return s;
    }

    function set_dimentions(box) {
        box.width = box.right - box.left + 1;
        box.height = box.bottom - box.top + 1;
    }

    function insert(box, tree) {
        if(is_box(tree)) {
            return add_box(box, tree);
        } else if(is_vector(tree)) {
            if(intersects(box, tree)) {
                var s = split(box, tree);
                tree.lt = insert(s.lt, tree.lt);
                tree.gt = insert(s.gt, tree.gt);
            } else if (less_than(box, tree)) {
                tree.lt = insert(box, tree.lt);
            } else {
                tree.gt = insert(box, tree.gt);
            }
            return tree;
        }
        throw "tree should only contain vectors or boxes";
    }

    function find_adj(box, tree) {
        if(is_box(tree)) {
            return [tree];
        } else if(is_vector(tree)) {
            if(intersects(box, tree)) {
                var s = split(box, tree);
                return find_adj(s.lt, tree.lt).concat(find_adj(s.gt, tree.gt));
            } else if (less_than(box, tree)) {
                return find_adj(box, tree.lt);
            } else {
                return find_adj(box, tree.gt);
            }
        }
        throw "tree should only contain vectors or boxes";
    }

    function add_box(new_box, old_box) {
        if(!boxes.intersect(old_box, new_box, false)) {
            if (boxes.left_of(old_box, new_box)) {
                return {x: new_box.left, y: new_box.top, 
                    horizontal: false, lt: old_box, gt: new_box};
            } else {
                return {x: old_box.left, y: old_box.top,
                    horizontal: false, lt: new_box, gt: old_box };
            }
        } else if (!boxes.intersect(old_box, new_box, true)) {
            if(boxes.above(old_box, new_box)) {
                return {x: new_box.left, y: new_box.top, 
                    horizontal: true, lt: old_box, gt: new_box};
            } else {
                return {x: old_box.left, y: old_box.top,
                    horizontal: true, lt: new_box, gt: old_box};
            }
        }
        throw "intersecting boxes not supported current: " 
            + boxes.to_string(old_box) + "  new: " + boxes.to_string(new_box);
    }

    function is_box() {
        for(var i = 0; i < arguments.length; i++) {
            if (!has_properties(arguments[i], 'top', 'bottom', 'left', 'right'))
                return false;
        }
        return true;
    }

    function is_vector() {
        for(var i = 0; i < arguments.length; i++) {
            if (!has_properties(arguments[i], 'x', 'y', 'horizontal'))
                return false;
        }
        return true;
    }

    function has_properties() {
        var obj = arguments[0];
        for(var i = 1; i < arguments.length; i++) {
            if(obj[arguments[i]] == undefined) return false;
        }
        return true;
    }

    return {
        put: function(b) {
            if(this.head == null) {
                this.head = b;
            } else if (is_box(this.head)) {
                this.head = add_box(b, this.head);
            } else {
                //head should be a vector
                insert(b, this.head);
            }
        },
        find_adjacent: function(b) {
            if(this.head == null) return null;
            return find_adj(b, this.head);
        }
    };
}
function SpiralLayout() {

    function add(a, b, positive){
        return positive? a + b : a - b;
    }

    function less_than(a, b, positive) {
        return positive ? a < b : a > b;
    }

    var spiral_props = {
        right: { expand: 'up', next: 'down'},
        down: { expand: 'right', next: 'left'},
        left: { expand: 'down', next: 'up'},
        up: { expand: 'left', next: 'right'}
    };

    var direction_props = {
        right: { from: 'left', to: 'right', horizontal: true, positive: true},
        left: { from: 'right', to: 'left', horizontal: true, positive: false},
        down: { from: 'top', to: 'bottom', horizontal: false, positive: true},
        up: { from: 'bottom', to: 'top', horizontal: false, positive: false}
    };

    function get_spiral_properties(area) {
        var props = $.extend({}, spiral_props[area.direction]);
        props.moving = direction_props[area.direction];
        props.expanding = direction_props[props.expand];
        return props;
    }

    function add_center(area, item) {
        var halfHeight = Math.floor(item.height / 2);
        var halfWidth = Math.floor(item.width / 2);

        item.top = -halfHeight;
        item.left = -halfWidth;

        //subtract to account for a potentially lost pixel in int division
        item.right = item.width - halfWidth;
        item.bottom = item.height - halfHeight;

        area.top = item.top;
        area.left = item.left;
        area.bottom = item.bottom;
        area.right = item.right;

        // special case: next box diectly to the right moving down
        // adding in down direction will add 1 to box expanding edge
        area.last_moving = item.top - 1;
        area.last_inner = item.right + 1;
        area.direction = 'down';
    }

    function add_normal(area, item) {
        var spiral = get_spiral_properties(area);

        var from = {};
        //assign temp location based on previous expanding and anchor edges
        from.moving = add(area.last_moving, 1, spiral.moving.positive);

        //subtract one to probe inside the border to see if there is space
        from.expanding = add(area.last_inner, -1, spiral.expanding.positive);

        position(item, spiral, from);

        var adjacent = area.space.find_adjacent(item);

        check_overlapping(adjacent, item, spiral, from);
        
        position(item, spiral, from);

        area.last_moving = item[spiral.moving.to];
        area.last_inner = item[spiral.expanding.from];

        // if the border has been crossed do a turn
        if(crosses_border(area, item, spiral.moving)) {
            area.direction = spiral.next;

            area.last_moving = item[spiral.expanding.from];
            area.last_inner = add(area[spiral.moving.to], 1,
                spiral.moving.positive);

            //assign new outer value for direction moving in
            area[spiral.moving.to] = item[spiral.moving.to];
        }

        //expand the outer edge if necessary
        if(crosses_border(area, item, spiral.expanding)) {
            area[spiral.expanding.to] = item[spiral.expanding.to];
        }
    }

    function crosses_border(area, item, dir) {
        return less_than(area[dir.to], item[dir.to], dir.positive);
    }

    function check_overlapping(adjacent, item, spiral, from) {
        var split = divide_list(adjacent, function(box) {
            return boxes.overlap(box, item);
        });

        if(split.t.length > 0) {
            var pos = spiral.expanding.positive;
            from.expanding =
                add(max_edge(split.t, spiral.expanding.to, pos), 1, pos);
        } else {
            check_intersecting(split.f, item, spiral, from);
        }
    }

    function check_intersecting(non_overlapping, item, spiral, from) {
        var split = divide_list(non_overlapping, function(box) {
            return boxes.intersect(box, item, spiral.expanding.horizontal);
        });
        if(split.t.length > 0) {
            var pos = spiral.expanding.positive;
            from.expanding = 
                add(max_edge(split.t, spiral.expanding.to, pos), 1, pos);
        } else {
            check_non_intersecting(split.f, item, spiral, from);
        }
    }

    function check_non_intersecting(non_intersecting, item, spiral, from) {
        from.expanding = max_edge(non_intersecting, spiral.expanding.from,
            !spiral.expanding.positive);
        position(item, spiral, from);
        var split = divide_list(non_intersecting, function(box) {
            return boxes.intersect(box, item, spiral.moving.horizontal);
        });
        if(split.t.length > 0) {
            var pos = spiral.moving.positive;
            from.moving = add(max_edge(split.t, spiral.moving.to, pos), 1, pos);
        }

    }

    function divide_list(list, callback) {
        var lists = {t: [], f: []};
        for(var i = 0; i < list.length; i++) {
            (callback(list[i]) ? lists.t : lists.f).push(list[i]);
        }
        return lists;
    }

    function max_edge(bs, edge, positive) {
        return bs.reduce(function(max, box) {
            return less_than(max, box[edge], positive) ? box[edge]: max;
        }, bs[0][edge]);
    }

    function position(item, spiral, from) {
        item[spiral.moving.from] = from.moving;
        item[spiral.expanding.from] = from.expanding;

        item[spiral.moving.to] = get_to_edge(item, spiral.moving);
        item[spiral.expanding.to] = get_to_edge(item, spiral.expanding);
    }

    function get_to_edge(item, dir) {
        var dim = (dir.horizontal ? item.width : item.height);
        return add(item[dir.from], dim, dir.positive);
    }

    return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,

        direction: '',
        last_inner: 0,
        last_moving: 0,

        space: BSPTree(),

        add: function(w, h) {
            var item = {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                width: w,
                height: h
            }

            if(this.direction == '') {
                add_center(this, item);
            } else {
                add_normal(this, item);
            }

            this.space.put(item);
            
            return item;
        }

    };
}
var PADDING = 11;
var MARGIN = 10;

function log(message) {
    $('#debug').text(message);
}

function stopEvent(e) {
    e.stopPropagation();
    e.preventDefault();
}

function startDrag(e) {
    var body = $('#body');
    body.data('cursor', {
        mousedown: true,
        x: e.pageX,
        y: e.pageY
    });
    body.css('cursor', '-moz-grabbing');
    stopEvent(e);
}

function stopDrag(e) {
    var body = $('#body');
    var cursor = body.data('cursor');
    cursor.mousedown = false;
    body.data('cursor', cursor);
    body.css('cursor', '-moz-grab');
    stopEvent(e);
}

function drag(e) {
    var body = $('#body');
    log('moving the mouse');
    var cursor = body.data('cursor');
    var position = body.data('position');
    if(cursor.mousedown) {
        var diffX = e.pageX - cursor.x;
        var diffY = e.pageY - cursor.y;
        cursor.x = e.pageX;
        cursor.y = e.pageY;
        position.offsetX += diffX;
        position.offsetY += diffY;
        log(e.pageX + ', ' + e.pageY);
        $('.item').each(function() {
            var item = $(this);
            var left = item.data('left');
            var top = item.data('top');
            item.css('left', (left + position.offsetX) + 'px');
            item.css('top', (top + position.offsetY) + 'px');
        });
    }
    stopEvent(e);
}

$(window).resize(function() {
    var win = $(window);
    var header = $('#header');
    $('#cover').css({
        height: win.height() + 'px',
        width: win.width() + 'px'
    });
    $('#body').css('height', (win.height() - header.height()) + 'px');
});

$(function() {
    //pre-cache the image
    new Image().src = '/images/loading_btn.gif';

    var defaultValue = function(el, value) {
        el.data('defaultValue', value);
        el.val(value);
        el.focus(function () {
            var input = $(this);
            if(input.val() == input.data('defaultValue')) {
                input.val('');
            }
        });
        el.blur(function () {
            var input = $(this);
            if(input.val() == '') {
                input.val(input.data('defaultValue'));
            }
        });
    };
     
    defaultValue($('#coll-name'), wall.name == '' ? 'Name your collection' : wall.name);
    defaultValue($('#img-url'), 'Paste your image URLs here');
    
    $('#collname form').submit(function (e) {

        $('#message').slideUp('fast');
        var form = $(this)
        form.find('.button').attr('disabled', 'true').addClass('loading');
        wall.name = $('#coll-name').val();
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: JSON.stringify(wall),
            success: function() {
                defaultValue($('#coll-name'), wall.name);
                $('title').text(wall.name + ' - Scrwall');
                form.find('.button').removeAttr('disabled').removeClass('loading');
            }
        });
        e.preventDefault();
        return false;
    }); 

    $('#closemsg').click(function() {
        $('#message').slideUp('fast');
    });

    $('#imgurl form').submit(function (e) {
        $('#message').slideUp('fast');
        var form = $(this)
        form.find('.button').attr('disabled', 'true').addClass('loading');
        var item = {"url": $('#img-url').val()};
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: JSON.stringify(item),
            success: function() {
                addItem(item.url);
                $("#img-url").val('').trigger('blur');
                form.find('.button').removeAttr('disabled').removeClass('loading');
            },
            error: function() {
                form.find('.button').removeAttr('disabled').removeClass('loading');
                $('#msgtxt').text('The url you provided didn\'t quite work could you try again?');
                $('#message').slideDown('fast');
            }
        });
        e.preventDefault();
        return false;
    });

    $('.feedback').click(function (e) {
        $('#overlay').fadeIn('fast');
        e.preventDefault();
        return false;
    });

    $('#close-feedback').click(function (e) {
        $('#overlay').css('display', 'none');
        e.preventDefault();
        return false;
    });


    var body = $('#body');

    var win = $(window);
    var cover = $('<div>', {
        id: 'cover',
        css: {
            'height': win.height() + 'px',
            'width': win.width() +'px',
            'z-index': 1000,
            'position': 'absolute'
        },
        click: function() {
            $('input[type="text"]').blur();
        },
        mousedown: startDrag,
        mouseout: stopDrag,
        mouseup: stopDrag,
        mousemove: drag
    });

    body.css('height', (win.height() - $('#header').height()) + 'px');

    body.append(cover);

    body.data('position', {
        offsetX: body.width() / 2,
        offsetY: body.height() / 2
    });

    body.data('cursor', {
        mousedown: false,
        x: 0,
        y: 0
    });

    body.data('layout', SpiralLayout(PADDING, MARGIN));
    
    $.each(items, function () {
        addItem(this);
    });
});

function addItem(url) {
    var image = new Image();
    $(image).attr({
        src: url,
        alt: 'Collection Item'
    });
    $(image).load(loadImage);
}

function loadImage() {

    var domItem = $('<div>', {
        'class': 'item'
    }).append($(this));

    var body = $('#body');

    var layout = body.data('layout');

    var position = body.data('position');

    var box_padding = (MARGIN + PADDING) * 2;

    var item = layout.add(this.width + box_padding, this.height + box_padding);

    var top = item.top + MARGIN;
    var left = item.left + MARGIN;
    domItem.css('top', top + position.offsetY + 'px');
    domItem.css('left', left + position.offsetX +'px');
    domItem.data('top', top);
    domItem.data('left', left);

    body.append(domItem);
}

