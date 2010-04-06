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
