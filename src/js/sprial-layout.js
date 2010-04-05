function SpiralLayout(pad, marg) {

    var margin = marg;

    var box_padding = pad + marg;

    function add(a, b, positive){
        return positive? a + b : a - b;
    }

    function less_than(a, b, positive) {
        return positive ? a < b : a > b;
    }

    var spiral_props = {
        right: { expanding: 'up', next: 'down'},
        down: { expanding: 'right', next: 'left'},
        left: { expanding: 'down', next: 'up'},
        up: { expanding: 'left', next: 'right'}
    };

    var direction_props = {
        right: { from: 'left', to: 'right', horizontal: true, positive: true},
        left: { from: 'right', to: 'left', horizontal: true, positive: false},
        down: { from: 'top', to: 'bottom', horizontal: false, positive: true},
        up: { from: 'bottom', to: 'top', horizontal: false, positive: false}
    };

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
        area.last_moving = item.top;
        area.last_inner = item.right;
        area.direction = 'down';
    }

    function add_normal(area, item) {
        var props = spiral_props[area.direction];
        var moving = direction_props[area.direction];
        var expanding = direction_props[props.expanding];

        //assign temp location based on previous expanding and anchor edges
        item[moving.from] = area.last_moving;
        item[expanding.from] = area.last_inner;
        
        item[moving.to] = get_to_edge(item, moving);
        item[expanding.to] = get_to_edge(item, expanding);

        area.last_moving = item[moving.to];
        area.last_inner = item[expanding.from];

        //Check if the border has been crossed and turn
        if(less_than(area[moving.to], item[moving.to], moving.positive)) {
            area.direction = props.next;

            area.last_moving = item[expanding.from];
            area.last_inner = area[moving.to];

            //assign new outer value for direction moving in
            area[moving.to] = item[moving.to];
        }

        //expand the outer edge if necessary
        if(less_than(area[expanding.to], item[expanding.to],
                     expanding.positive)) {
            area[expanding.to] = item[expanding.to];
        }
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
                dom_width: w,
                dom_height: h,
                width: w + 2 * box_padding,
                height: h + 2 * box_padding
            }

            if(this.direction == '') {
                add_center(this, item);
            } else {
                add_normal(this, item);
            }

            this.space.put(item);

            item.dom_top = item.top + margin;
            item.dom_left = item.left + margin;
            
            return item;
        }

    };
}
