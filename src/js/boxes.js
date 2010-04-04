var boxes = {
    intersect_vertically: function(b1, b2) {
        return b1.top < b2.bottom && b2.top < b1.bottom;
    },

    intersect_horizontally: function(b1, b2) {
        return b1.left < b2.right && b2.left < b1.right;
    },

    intersect: function(b1, b2) {
        return intersect_vertically(b1, b2) && intersect_horizontally(b1, b2);
    },

    left_of: function(b1, b2) {
        return b1.right < b2.left;
    },

    above: function(b1, b2) {
        return b1.bottom < b2.top;
    }
}