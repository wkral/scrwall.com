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
    var body = $('#body');
    body.data('cursor', {
        mousedown: true,
        x: e.pageX,
        y: e.pageY
    });
    body.css('cursor', '-moz-grabbing');
    stopEvent(e);
}

function stopDrag(e) {
    var body = $('#body');
    var cursor = body.data('cursor');
    cursor.mousedown = false;
    body.data('cursor', cursor);
    body.css('cursor', '-moz-grab');
    stopEvent(e);
}

function drag(e) {
    var body = $('#body');
    log('moving the mouse');
    var cursor = body.data('cursor');
    var position = body.data('position');
    if(cursor.mousedown) {
        var diffX = e.pageX - cursor.x;
        var diffY = e.pageY - cursor.y;
        cursor.x = e.pageX;
        cursor.y = e.pageY;
        position.offsetX += diffX;
        position.offsetY += diffY;
        log(e.pageX + ', ' + e.pageY);
        $('.item').each(function() {
            var item = $(this);
            var left = item.data('left');
            var top = item.data('top');
            item.css('left', (left + position.offsetX) + 'px');
            item.css('top', (top + position.offsetY) + 'px');
        });
    }
    stopEvent(e);
}

$(window).resize(function() {
    var win = $(window);
    var header = $('#header');
    $('#cover').css({
        height: win.height() + 'px',
        width: win.width() + 'px'
    });
    $('#body').css('height', (win.height() - header.height()) + 'px');
});

$(function() {
    //pre-cache the image
    new Image().src = '/images/loading_btn.gif';
     
    $('#coll-name').defaultvalue(wall.name == '' ? 'Name your collection' : wall.name);
    $('#img-url').defaultvalue('Paste your image URLs here');
    
    $('#collname form').submit(function (e) {

        $('#message').slideUp('fast');
        var form = $(this)
        form.find('input[type="submit"]').attr('disabled', 'true').addClass('loading');
        wall.name = $('#coll-name').val();
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: JSON.stringify(wall),
            success: function() {
                $('#coll-name').defaultvalue(wall.name);
                $('head title').text(wall.name);
                form.find('input[type="submit"]').removeAttr('disabled').removeClass('loading');
            }
        });
        e.preventDefault();
        return false;
    }); 

    $('#closemsg').click(function() {
        $('#message').slideUp('fast');
    });

    $('#imgurl form').submit(function (e) {
        $('#message').slideUp('fast');
        var form = $(this)
        form.find('input[type="submit"]').attr('disabled', 'true').addClass('loading');
        var item = {"url": $('#img-url').val()};
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: JSON.stringify(item),
            success: function() {
                addItem(item.url);
                $("#img-url").defaultvalue("Drop your image URLs here");
                form.find('input[type="submit"]').removeAttr('disabled').removeClass('loading');
            },
            error: function() {
                form.find('input[type="submit"]').removeAttr('disabled').removeClass('loading');
                $('#msgtxt').text('The url you provided didn\'t quite work could you try again?');
                $('#message').slideDown('fast');
            }
        });
        e.preventDefault();
        return false;
    });
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
        click: function() {
            $('input[type="text"]').blur();
        },
        mousedown: startDrag,
        mouseout: stopDrag,
        mouseup: stopDrag,
        mousemove: drag
    });

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

    body.data('layout', SpiralLayout(PADDING, MARGIN));
    
    $.each(/*[
        'http://static.jquery.com/files/rocker/images/logo_jquery_215x53.gif',
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
    ]*/items, function () {
        addItem(this);
    });
});

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

    var body = $('#body');

    var layout = body.data('layout');

    var position = body.data('position');

    var box_padding = (MARGIN + PADDING) * 2;

    var item = layout.add(this.width + box_padding, this.height + box_padding);

    var top = item.top + MARGIN;
    var left = item.left + MARGIN;
    domItem.css('top', top + position.offsetY + 'px');
    domItem.css('left', left + position.offsetX +'px');
    domItem.data('top', top);
    domItem.data('left', left);

    body.append(domItem);
}

