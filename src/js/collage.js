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
    var area = body.data('area');
    if(cursor.mousedown) {
        var diffX = e.pageX - cursor.x;
        var diffY = e.pageY - cursor.y;
        cursor.x = e.pageX;
        cursor.y = e.pageY;
        area.offsetX += diffX;
        area.offsetY += diffY;
        log(e.pageX + ', ' + e.pageY);
        $('.item').each(function() {
            var item = $(this);
            var left = item.data('left');
            var top = item.data('top');
            item.css('left', (left + area.offsetX) + 'px');
            item.css('top', (top + area.offsetY) + 'px');
        });
    }
    stopEvent(e);
}

var nextDirection = {'right' : 'down',
                     'down' : 'left',
                     'left' : 'up',
                     'up' : 'right'};

$(window).resize(function() {
    $('#cover').css({
        height: document.body.clientHeight + 'px',
        width: document.body.clientWidth + 'px'
    });
});

$(function() {
    var body = $('body');
    var cover = $('<div>', {
        id: 'cover',
        css: {
            height: document.body.clientHeight + 'px',
            width: document.body.clientWidth +'px',
            'z-index': 1000,
            position: 'absolute'
        },
        //click: stopEvent,
        mousedown: startDrag,
        mouseout: stopDrag,
        mouseup: stopDrag,
        mousemove: drag
    });
    
    body.css('height', document.body.clientHeight + 'px');
    body.css('width', document.body.clientWidth +'px');


    body.append(cover);

    body.data('area', {
        offsetX: document.body.clientWidth / 2,
        offsetY: document.body.clientHeight / 2,

        top: { inner: 0, outer: 0},
        bottom: { inner: 0, outer: 0},
        left: { inner: 0, outer: 0},
        right: { inner: 0, outer: 0},

        direction: '',
        lastEdge: 0,

        topEdges: SortedTree(),
        rightEdges: SortedTree(),
        bottomEdges: SortedTree(),
        leftEdges: SortedTree()
    });

    body.data('cursor', {
        mousedown: false,
        x: 0,
        y: 0
    });
    
    $.each(['http://static.jquery.com/files/rocker/images/logo_jquery_215x53.gif',
        'http://waytoogood.ca/wp-content/gallery/inspiration/tumblr_kx1o246h871qza6kro1_500_large.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/killer_ring.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/enhanced_penulum_channel.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/1238997252979083.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/1254078432801366.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/27605bbce5a1c3f75c383967c48d1b62_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/paradise_now-2.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/a342f0c470b7535ee05ead326c1e2c3d_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/tumblr_kwuahsjxnv1qzs56do1_500.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/fb66aed811d982341fcb4c3621c97090_l.png',
        'http://waytoogood.ca/wp-content/gallery/inspiration/xfvl90.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/3140453fce7b7a8b5719c3ed49a3b53e_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/9eb0a9b8728ced5ce590c41b7a69f16d_l.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/1244249870410811.jpg',
        'http://waytoogood.ca/wp-content/gallery/inspiration/0e210818795129a0fce6edc182684600_l.png'
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

    var area = body.data('area');

    var item = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: this.width,
        height: this.height
    }

    if(area.direction == '') {
        addCenter(area, item);
    } else if (area.direction == 'special') {
        addSpecial(area, item);
    } else {
        addNormal(area, item);
    }

    area.leftEdges.put(item.left, item);
    area.topEdges.put(item.top, item);
    area.rightEdges.put(item.right, item);
    area.bottomEdges.put(item.bottom, item);

    domItem.css('top', item.top + area.offsetY + 'px');
    domItem.css('left', item.left + area.offsetX +'px');
    domItem.data('top', item.top);
    domItem.data('left', item.left);

    body.append(domItem);
    body.data('area', area);
}

function addCenter(area, item) {
    var halfHeight = Math.floor(item.height / 2);
    var halfWidth = Math.floor(item.width / 2);

    item.top = -halfHeight - PADDING;
    item.left = -halfWidth - PADDING;
    item.right = setExpantionEdge(item, directionProps['right']);
    item.bottom = setExpantionEdge(item, directionProps['down']);
    area.top.inner = item.top;
    area.left.inner = item.left;
    //subtract to account for a potentially lost pixel in int division
    area.bottom.inner = item.height - halfHeight + PADDING;
    area.right.inner = item.width - halfWidth + PADDING;

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
    item.left = area.lastEdge + MARGIN;
    item.right = setExpantionEdge(item, directionProps['right']);
    item.bottom = setExpantionEdge(item, directionProps['down']);
    area.right.outer = item.left + item.width + PADDING * 2;
    if(item.top + item.height + PADDING * 2 > area.bottom.outer) {
        area.lastEdge = item.left;
        area.direction = 'left';
        area.right.inner = area.right.outer;
        area.bottom.outer = item.top + item.height + PADDING * 2;
    } else {
        area.lastEdge = item.top + item.height + PADDING * 2;
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
    item[moving.anchor] = funcs[moving.func](area.lastEdge, MARGIN);
    item[moving.expand] = setExpantionEdge(item, moving);

    var anchorItem = findAnchorEdge(area, moving, other, item[moving.anchor],
        item[moving.expand]);

    item[other.anchor] = funcs[other.func](anchorItem[other.expand], MARGIN);
    item[other.expand] = setExpantionEdge(item, other);

    // Assign new outer value if item is larger than others on that plane
    /* follow same mapping based on direction moving */
    if(gt[other.func](item[other.expand], area[other.expand].outer)) {
        area[other.expand].outer = item[other.expand];
    }
    //Check if the border has been crossed
    /* check the outer value of the direction its moving in */
    if(gt[moving.func](item[moving.expand], area[moving.expand].outer)) {
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
    var start = edge1 < edge2 ? edge1 : edge2 - MARGIN;
    var end = edge1 > edge2 ? edge1 : edge2 + MARGIN;

    var items = area[moving.anchor + 'Edges'].range(start, end);
    items = items.concat(area[moving.expand + 'Edges'].range(start, end));

    var item = items.reduce(function (prev, curr) {
        return gt[other.func](prev[other.expand], curr[other.expand]) ?
            prev : curr;
    });
    return item;
}

function setExpantionEdge(item, dir) {
    var func = funcs[dir.func];
    var dim = item[dir.dim] + PADDING *2;
    return func(item[dir.anchor], dim);
}
