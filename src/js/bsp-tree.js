/* 
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
