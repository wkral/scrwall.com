function SpiralLayout(pad, marg) {

    var padding = pad;
    var margin = marg;

    var directionProps = {
        right: { anchor: 'left', expand: 'right', dim: 'width', func: 'add'},
        left: { anchor: 'right', expand: 'left', dim: 'width', func: 'sub'},
        down: { anchor: 'top', expand: 'bottom', dim: 'height', func: 'add'},
        up: { anchor: 'bottom', expand: 'top', dim: 'height', func: 'sub'}
    };

    var funcs = {
        add: function(a, b) {
            return a + b;
        },
        sub: function(a, b) {
            return a - b;
        }
    };

    var cmp = {
        add: function (a, b) {
            return a > b;
        },
        sub: function(a, b) {
            return a < b;
        }
    };

    var layoutProps = {
        right: { other: 'up', next: 'down'},
        down: { other: 'right', next: 'left'},
        left: { other: 'down', next: 'up'},
        up: {other: 'left', next: 'right'}
    };

    function addCenter(area, item) {
        var halfHeight = Math.floor(item.height / 2);
        var halfWidth = Math.floor(item.width / 2);

        item.top = -halfHeight - padding;
        item.left = -halfWidth - padding;
        item.right = setExpantionEdge(item, directionProps['right']);
        item.bottom = setExpantionEdge(item, directionProps['down']);
        area.top.inner = item.top;
        area.left.inner = item.left;
        //subtract to account for a potentially lost pixel in int division
        area.bottom.inner = item.height - halfHeight + padding;
        area.right.inner = item.width - halfWidth + padding;

        area.top.outer = area.top.inner;
        area.bottom.outer = area.bottom.inner;
        area.left.outer = area.left.inner;
        area.right.outer = area.right.inner;

        //special case
        area.lastEdge = area.right.outer;
        area.direction = 'special';
    }

    function addSpecial(area, item) {
        item.top = area.top.outer;
        item.left = area.lastEdge + margin;
        item.right = setExpantionEdge(item, directionProps['right']);
        item.bottom = setExpantionEdge(item, directionProps['down']);
        area.right.outer = item.left + item.width + padding * 2;
        if(item.top + item.height + padding * 2 > area.bottom.outer) {
            area.lastEdge = item.left;
            area.direction = 'left';
            area.right.inner = area.right.outer;
            area.bottom.outer = item.top + item.height + padding * 2;
        } else {
            area.lastEdge = item.top + item.height + padding * 2;
            area.direction = 'down';
        }
    }

    function addNormal(area, item) {
        var props = layoutProps[area.direction];
        var moving = directionProps[area.direction];
        var other = directionProps[props.other];

        //Assign new top and left based on previous state
        /* moving right -> inner top = bottom edge
           moving down  -> inner right = left edge
           moving left  -> inner bottom = top edge
           moving up    -> inner left = right edge */
        item[moving.anchor] = funcs[moving.func](area.lastEdge, margin);
        item[moving.expand] = setExpantionEdge(item, moving);

        var anchorItem = findAnchorEdge(area, moving, other, 
            item[moving.anchor], item[moving.expand]);

        item[other.anchor] = funcs[other.func](anchorItem[other.expand],
            margin);
        item[other.expand] = setExpantionEdge(item, other);

        // Assign new outer value if item is larger than others on that plane
        /* follow same mapping based on direction moving */
        if(cmp[other.func](item[other.expand], area[other.expand].outer)) {
            area[other.expand].outer = item[other.expand];
        }
        //Check if the border has been crossed
        /* check the outer value of the direction its moving in */
        if(cmp[moving.func](item[moving.expand], area[moving.expand].outer)) {
            area.direction = props.next;
            //assign new outer value for direction moving in
            area[moving.expand].outer = item[moving.expand];
            //the outer becomes the inner now that we're not working on it
            area[other.expand].inner = area[other.expand].outer;
        }
        //assign last edge values in the direction moving in
        area.lastEdge = item[directionProps[area.direction].expand];
    }

    function findAnchorEdge(area, moving, other, edge1, edge2) {
        var start = edge1 < edge2 ? edge1 : edge2 - margin;
        var end = edge1 > edge2 ? edge1 : edge2 + margin;

        var items = area[moving.anchor + 'Edges'].range(start, end);
        items = items.concat(area[moving.expand + 'Edges'].range(start, end));

        var item = items.reduce(function (prev, curr) {
            return cmp[other.func](prev[other.expand], curr[other.expand]) ?
                prev : curr;
        });
        return item;
    }

    function setExpantionEdge(item, dir) {
        var func = funcs[dir.func];
        var dim = item[dir.dim] + padding *2;
        return func(item[dir.anchor], dim);
    }

    return {
        top: { inner: 0, outer: 0},
        bottom: { inner: 0, outer: 0},
        left: { inner: 0, outer: 0},
        right: { inner: 0, outer: 0},

        direction: '',
        lastEdge: 0,

        topEdges: SortedTree(),
        rightEdges: SortedTree(),
        bottomEdges: SortedTree(),
        leftEdges: SortedTree(),

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
                addCenter(this, item);
            } else if (this.direction == 'special') {
                addSpecial(this, item);
            } else {
                addNormal(this, item);
            }

            this.leftEdges.put(item.left, item);
            this.topEdges.put(item.top, item);
            this.rightEdges.put(item.right, item);
            this.bottomEdges.put(item.bottom, item);

            return item;
        }

    };
}
