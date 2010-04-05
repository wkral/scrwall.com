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
    }
}