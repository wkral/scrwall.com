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
        return vec.horizontal ? vec.x < box.top : vec.y < box.left;
    }
    function intersects(box, vec) {
        return vec.horizontal ? vec.x > box.top && vec.x <= box.bottom :
            vec.y > box.left && vec.y <= box.right;
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
        put: function (b) {
            if(this.head == null) {
                this.head = b;
            } else if (is_box(this.head)) {
                var old_head = this.head;
                if(!intersect_horizontally(old_head, b)) {
                    if (left_of(old_head, b)) {
                        this.head = {x: b.left, y: b.top, horizontal: false,
                            lt: old_head, gt: b};
                    } else {
                        this.head = {x: old_head.left, y: old_head.top,
                            horizontal: false, lt: b, gt: old_head };
                    }
                } else if (!intersect_vertically(old_head, b)) {
                    if(above(old_head, b)) {
                        this.head = {x: b.left, y: b.top, horizontal: true,
                            lt: old_head, gt: b};
                    } else {
                        this.head = {x: old_head.left, y:old_head.top,
                            horizontal: true, lt: b, gt: old_head};
                    }
                }
            }
        }
    };
}
