$(window).resize(function() {
    var win = $(window);
    var header = $('#header');
    $('#cover').css({
        height: win.height() + 'px',
        width: win.width() + 'px'
    });
    $('#body').css('height', (win.height() - header.height()) + 'px');
});

var wall = {
    padding: 11,
    margin: 10,
    addItem: function(url, key, callback) {
        var image = $(new Image());
        image.attr({
            src: url,
            alt: 'Collection Item'
        });
        image.load(callback);
        image.data('key', key);
    },
    loadExistingImage: function() {
        wall.appendImage(this);
    },
    loadNewImage: function() {
        var item = wall.appendImage(this);
        item.src = this.src;
        items[item.key] = item;
        nav.moveTo(item);
    },
    deleteItem: function (url) {
        //TODO pass
    },
    appendImage: function(img) {
        var image = $(img);
        var key = image.data('key');
        var domItem = $('<div>', {
            'class': 'item',
            id: 'item' + key,
            
        }).css({
            width: img.width + 'px',
            height: img.height + 'px',
        }).append(image);

        var body = $('#body');

        var layout = body.data('layout');

        var position = body.data('position');

        var box_padding = (wall.margin + wall.padding) * 2;

        var item = layout.add(img.width + box_padding, img.height + box_padding, key);

        var top = item.top + wall.margin;
        var left = item.left + wall.margin;
        domItem.css('top', top + position.offsetY + 'px');
        domItem.css('left', left + position.offsetX + 'px');
        domItem.data('top', top);
        domItem.data('left', left);

        body.append(domItem);

        $.extend(items[key], item);
        return item;
    }
};

var nav = {
    itemSelector: null,
    itemReset: function() {
        if(nav.itemSelector != null) {
            $('#body').find('#controls').remove();
            $(nav.itemSelector).css('z-index', 'auto').find('a').remove();
            nav.itemSelector = null;
        }
    }, 
    stopEvent: function(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    },
    startDrag: function(e) {
        var body = $('#body');
        body.data('cursor', {
            mousedown: true,
            x: e.pageX,
            y: e.pageY
        });
        return nav.stopEvent(e);
    },
    stopDrag: function(e) {
        var body = $('#body');
        var cursor = body.data('cursor');
        cursor.mousedown = false;
        body.data('cursor', cursor);
        return nav.stopEvent(e);
    },
    drag: function(e) {
        var body = $('#body');
        var cursor = body.data('cursor');
        if(cursor.mousedown) {
            mover.cancel();
            body.data('dragged', true);
            var deltaX = e.pageX - cursor.x;
            var deltaY = e.pageY - cursor.y;
            cursor.x = e.pageX;
            cursor.y = e.pageY;
            nav.move(deltaX, deltaY);
        }
        return nav.stopEvent(e);
    },
    select: function(e) {
        $('input[type="text"]').blur();
        var body = $('#body');
        if(body.data('dragged')) {
            body.data('dragged', false);
        } else {
            var layout = body.data('layout');
            var pos = body.data('position');
            var item = layout.find(e.pageX - pos.offsetX, 
                e.pageY - body.position().top - pos.offsetY);
            
            if(item == null) return false;
            
            item = items[item.key];
            nav.moveTo(item, nav.addControls);
        }
        return nav.stopEvent(e);
    },
    addControls: function(item) {
        var pos = $('#body').data('position');
        var control_top = this.top + wall.margin + wall.padding + 5 + pos.offsetY;
        var control_left = this.left + wall.margin + wall.padding + 5 + pos.offsetX;

        // make sure controls are always visible
        if(control_top < 40) control_top = 40;
        if(control_left < 10) control_left = 10;

        var controls = $('<div id="controls"><a href="#" class="delete"></a></div>').css({
            'position': 'absolute',
            'top': control_top + 'px',
            'left': control_left + 'px',
            'z-index': 1501
        });

        $('#item' + this.key).css('z-index', 1500)
        $('#body').append(controls);
        nav.itemSelector = '#item' + this.key;
    },
    move: function(deltaX, deltaY) {
        nav.itemReset();
        var position = $('#body').data('position');
        position.offsetX += deltaX;
        position.offsetY += deltaY;
        $('.item').each(function() {
            var item = $(this);
            var left = item.data('left');
            var top = item.data('top');
            item.css('left', (left + position.offsetX) + 'px');
            item.css('top', (top + position.offsetY) + 'px');
        });
    },
    moveTo: function(item, callback) {
        var body = $('#body');
        var position = body.data('position');

        var centerX = item.left + item.width / 2;
        var centerY = item.top + item.height / 2;

        var deltaX = -centerX - position.offsetX + body.width() / 2;
        var deltaY = -centerY - position.offsetY + body.height() / 2;

        mover.move(deltaX, deltaY, callback, item);
    },
};

var mover = {
    step: null,
    timeout: null,
    callback: null,
    move: function(deltaX, deltaY, callback, arg) {
        var stepX = deltaX / 50;
        var stepY = deltaY / 50;
        
        this.callback = callback;
        this.arg = arg;
        window.clearTimeout(this.timeout);
        this.step = {x: stepX, y: stepY, count: 50};
        this.proceed();
    },
    proceed: function() {
        if(mover.step != null) {
            var step = mover.step;
            nav.move(step.x, step.y);
            step.count--;
            var time = 5;
            if(step.count < 10) {
                time = time + Math.ceil(2.5 * (10 - step.count));
            }
            if(step.count <= 0) {
                mover.step = null;
                if(mover.callback != null) {
                    mover.callback.apply(mover.arg);
                }
            }
            mover.timeout = window.setTimeout(mover.proceed, time);
        }
    },
    cancel: function() {
        window.clearTimeout(this.timeout);
    }
};

$(function() {
    //pre-cache the image
    new Image().src = '/images/loading_btn.gif';
    
    forms.init();

    var body = $('#body');

    var win = $(window);
    var cover = $('<div>', {
        id: 'cover',
        css: {
            'height': win.height() + 'px',
            'width': win.width() +'px',
            'z-index': 1000,
            'position': 'absolute'
        },
        click: nav.select,
        mousedown: nav.startDrag,
        mouseup: nav.stopDrag,
        mouseout: function(e) {
            $('#body').data('dragged', false);
            return nav.stopDrag(e);
        },
        mousemove: nav.drag
    });

    // cross browser scrolling
    window.addEventListener('mousewheel', function (e) {
        mover.cancel();
        nav.move(e.wheelDeltaX / 60, e.wheelDeltaY / 60);
    }, true);

    window.addEventListener('DOMMouseScroll', function (e) {
        mover.cancel();
        if(e.axis == e.HORIZONTAL_AXIS) {
            nav.move(e.detail * -4, 0);
        } else {
            nav.move(0, e.detail * -4);
        }
    }, true);

    body.css('height', (win.height() - $('#header').height()) + 'px');

    body.append(cover);

    body.data('position', {
        offsetX: body.width() / 2,
        offsetY: body.height() / 2
    });

    body.data('cursor', {
        mousedown: false,
        x: 0,
        y: 0
    });

    body.data('layout', SpiralLayout(wall.padding, wall.margin));
    
    $.each(items, function (key, value) {
        wall.addItem(value.src, parseInt(key), wall.loadExistingImage);
    });
});


