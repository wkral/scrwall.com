/* 
 * BSP Tree inspired data structure for space optimization
 *
 * Nodes of the tree will be comprised of vectors with x and y coordinate
 * and a horizontal/vertical flag
 *
 * Leaves of the tree will be images with left, right, top, bottom edge data
 *
 * Leaves may appear in the tree in multiple places
 *
 * No forced alternation of horizontal and vertical nodes
 *
 * The vectors divide an infinite plane and do not detect if they intersect
 * with each other
 *
 * Assumption of no overlapping items
 */

function BSPTree() {

    function left_of(a, b) {
        if(is_box(a, b)) {
            return a.right < b.left;
        }
        return false;
    }

    function below(a, b) {
        if(is_box(a) && is_point(b)) {
            return a.top <= b.y;
        }
        return false;
    }

    function is_box() {
        for(var i = 0; i < arguments.length; i++) {
            if (!has_properties(arguments[i], 'top', 'bottom', 'left', 'right'))
                return false;
        }
        return true;
    }

    function is_point() {
        for(var i = 0; i < arguments.length; i++) {
            if (!has_properties(arguments[i], 'x', 'y'))
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
        put: function (pt, img) {
            if(this.head == null) {
                this.head = {
                    x: pt.x,
                    y: pt.y,
                    horizontal:true 
                };
                if(below(img, pt)) {
                    this.head.left = img;
                } else {
                    this.head.right = img;
                }
            }
        }
    };
}

