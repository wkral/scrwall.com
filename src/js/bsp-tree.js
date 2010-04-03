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

    function intersect_vertically(b1, b2) {
        return b1.top < b2.bottom && b2.top < b1.bottom;
    }

    function intersect_horizontally(b1, b2) {
        return b1.left < b2.right && b2.left < b1.right;
    }

    function left_of(b1, b2) {
        return b1.right < b2.left;
    }

    function above(b1, b2) {
        return b1.bottom < b2.top;
    }

    function less_than(box, vec) {
        return vec.horizontal ? vec.x <= box.top : vec.y > box.right;
    }

    function intersects(box, vec) {
        return vec.horizontal ? 
            vec.y > box.top && vec.y <= box.bottom :
            vec.x > box.left && vec.x <= box.right;
    }

    function split(box, vec) {
        if(vec.horizontal) {
            return {
                gt: {top: box.top, bottom: vec.y -1,
                    left: box.left, right: box.right},
                lt: {top: vec.y, bottom: box.bottom,
                    left: box.left, right: box.right}
            };
        } else {
            return {
                gt: {left: vec.x, right: box.right,
                    top: box.top, bottom: box.bottom},
                lt: {left: box.left, right: vec.x -1,
                    top: box.top, bottom:box.bottom}
            };
        }
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

    function add_box(new_box, old_box) {
        if(!intersect_horizontally(old_box, new_box)) {
            if (left_of(old_box, new_box)) {
                return {x: new_box.left, y: new_box.top, 
                    horizontal: false, lt: old_box, gt: new_box};
            } else {
                return {x: old_box.left, y: old_box.top,
                    horizontal: false, lt: new_box, gt: old_box };
            }
        } else if (!intersect_vertically(old_box, new_box)) {
            if(above(old_box, new_box)) {
                return {x: new_box.left, y: new_box.top, 
                    horizontal: true, lt: new_box, gt: old_box};
            } else {
                return {x: old_box.left, y:old_box.top,
                    horizontal: true, lt: new_box, gt: old_box};
            }
        }
        throw "intersecting boxes not supported";
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
        }
    };
}
