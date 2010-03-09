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
    var body = $('body');
    body.data('cursor', {
        mousedown: true,
        x: e.pageX,
        y: e.pageY
    });
    body.css('cursor', '-moz-grabbing');
    stopEvent(e);
}
function stopDrag(e) {
    var body = $('body');
    var cursor = body.data('cursor');
    cursor.mousedown = false;
    body.data('cursor', cursor);
    body.css('cursor', '-moz-grab');
    stopEvent(e);
}
function drag(e) {
    var body = $('body');
    log('moving the mouse');
    var cursor = body.data('cursor');
    var w = body.data('window');
    if(cursor.mousedown) {
        var diffX = e.pageX - cursor.x;
        var diffY = e.pageY - cursor.y;
        cursor.x = e.pageX;
        cursor.y = e.pageY;
        w.offsetX += diffX;
        w.offsetY += diffY;
        log(e.pageX + ', ' + e.pageY);
        $('.item').each(function() {
            var item = $(this);
            var left = item.data('left');
            var top = item.data('top');
            item.css('left', (left + w.offsetX) + 'px');
            item.css('top', (top + w.offsetY) + 'px');
        });
    }
    stopEvent(e);
}

var nextDirection = {'right' : 'down',
                     'down' : 'left',
                     'left' : 'up',
                     'up' : 'right'};

$(function() {
    var body = $('body');
    var cover = $('<div>', {
        css: {
            height: document.body.clientHeight + 'px',
            width: document.body.clientWidth +'px',
            'z-index': 1000,
            position: 'absolute'
        },
        click: stopEvent,
        mousedown: startDrag,
        mouseout: stopDrag,
        mouseup: stopDrag,
        mousemove: drag
    });
    
    body.css('height', document.body.clientHeight + 'px');
    body.css('width', document.body.clientWidth +'px');


    body.append(cover);

    body.data('window', {
        offsetX: document.body.clientWidth / 2,
        offsetY: document.body.clientHeight / 2,

        top: { inner: 0, outer: 0},
        bottom: { inner: 0, outer: 0},
        left: { inner: 0, outer: 0},
        right: { inner: 0, outer: 0},
        direction: '',
        lastEdge: 0
    });

    body.data('cursor', {
        mousedown: false,
        x: 0,
        y: 0
    });
    
    $.each(['http://static.jquery.com/files/rocker/images/logo_jquery_215x53.gif',
        'http://waytoogood.ca/wp-content/gallery/inspiration/tumblr_kx1o246h871qza6kro1_500_large.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/tumblr_kx2u4yr5dk1qzs56do1_500.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/killer_ring.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/enhanced_penulum_channel.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/c52d1c18b02ceca2f3398ecb24851261_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/1238997252979083.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/1254078432801366.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/tumblr_kwc5flabuv1qa1zngo1_500_large.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/1246811539591344.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/4247965533_a94e3603f0_b.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/27605bbce5a1c3f75c383967c48d1b62_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/1726a734e902959a7fde10d2556f5bb5_l.png',
        'http://waytoogood.ca/wp-content/gallery/inspiration/copy_0_yx6zgzbltnl7hn0tnkp0pqgqo1_500.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/paradise_now-2.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/a342f0c470b7535ee05ead326c1e2c3d_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/tumblr_kwuahsjxnv1qzs56do1_500.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/fb66aed811d982341fcb4c3621c97090_l.png',
        'http://waytoogood.ca/wp-content/gallery/inspiration/xfvl90.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/3140453fce7b7a8b5719c3ed49a3b53e_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/9eb0a9b8728ced5ce590c41b7a69f16d_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/1244249870410811.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/0e210818795129a0fce6edc182684600_l.png',
        'http://waytoogood.ca/wp-content/gallery/inspiration/tumblr_kwjkkmotmc1qzs56do1_500.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/c61_by_willow32.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/tumblr_kuth8g6roz1qa9gago1_1280.jpg'
    ],
        function () {
            addItem(this);
        });
});

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

var gt = {
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

    var body = $('body');

    var w = body.data('window');

    var item = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: this.width,
        height: this.height
    }

    if(w.direction == '') {

        var halfHeight = Math.floor(item.height / 2);
        var halfWidth = Math.floor(item.width / 2);

        item.top = -halfHeight - PADDING;
        item.left = -halfWidth - PADDING;
        w.top.inner = item.top;
        w.left.inner = item.left;
        //subtract to account for a potentially lost pixel in int division
        w.bottom.inner = item.height - halfHeight + PADDING;
        w.right.inner = item.width - halfWidth + PADDING;

        w.top.outer = w.top.inner;
        w.bottom.outer = w.bottom.inner;
        w.left.outer = w.left.inner;
        w.right.outer = w.right.inner;

        //special case
        w.lastEdge = w.right.outer;
        w.direction = 'special';
    } else if (w.direction == 'special') {
        item.top = w.top.outer;
        item.left = w.lastEdge + MARGIN;
        w.right.outer = item.left + item.width + PADDING * 2;
        if(item.top + item.height + PADDING * 2 > w.bottom.outer) {
            w.lastEdge = item.left;
            w.direction = 'left';
            w.right.inner = w.right.outer;
            w.bottom.outer = item.top + item.height + PADDING * 2;
        } else {
            w.lastEdge = item.top + item.height + PADDING * 2;
            w.direction = 'down';
        }

    } else {

        var props = layoutProps[w.direction];
        var moving = directionProps[w.direction];
        var other = directionProps[props.other];

        //Assign new top and left based on previous state
        /* moving right -> inner top = bottom edge
           moving down  -> inner right = left edge
           moving left  -> inner bottom = top edge
           moving up    -> inner left = right edge */
        item[moving.anchor] = funcs[moving.func](w.lastEdge, MARGIN);
        item[other.anchor] = funcs[other.func](w[other.expand].inner, MARGIN);
        item[moving.expand] = setExpantionEdge(item, moving);
        item[other.expand] = setExpantionEdge(item, other);

        // Assign new outer value if item is larger than others on that plane
        /* follow same mapping based on direction moving */
        if(gt[other.func](item[other.expand], w[other.expand].outer)) {
            w[other.expand].outer = item[other.expand];
        }
        //Check if the border has been crossed
        /* check the outer value of the direction its moving in */
        if(gt[moving.func](item[moving.expand], w[moving.expand].outer)) {
            w.direction = props.next;
            //assign new outer value for direction moving in
            w[moving.expand].outer = item[moving.expand];
            //the outer becomes the inner now that we're not working on it
            w[other.expand].inner = w[other.expand].outer;
        }
        //assign last edge values in the direction moving in
        w.lastEdge = item[directionProps[w.direction].expand];
    }

    domItem.css('top', item.top + w.offsetY + 'px');
    domItem.css('left', item.left + w.offsetX +'px');
    domItem.data('top', item.top);
    domItem.data('left', item.left);

    body.append(domItem);
    body.data('window', w);

}

function setExpantionEdge(item, dir) {
    var func = funcs[dir.func];
    var dim = item[dir.dim] + PADDING *2;
    return func(item[dir.anchor], dim);
}
