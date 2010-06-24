var PADDING = 11;
var MARGIN = 10;

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
    stopEvent(e);
}

function stopDrag(e) {
    var body = $('#body');
    var cursor = body.data('cursor');
    cursor.mousedown = false;
    body.data('cursor', cursor);
    stopEvent(e);
}

function drag(e) {
    var body = $('#body');
    var cursor = body.data('cursor');
    var position = body.data('position');
    if(cursor.mousedown) {
        var diffX = e.pageX - cursor.x;
        var diffY = e.pageY - cursor.y;
        cursor.x = e.pageX;
        cursor.y = e.pageY;
        position.offsetX += diffX;
        position.offsetY += diffY;
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

    var defaultValue = function(el, value) {
        el.data('defaultValue', value);
        el.val(value);
        el.focus(function () {
            var input = $(this);
            if(input.val() == input.data('defaultValue')) {
                input.val('');
            }
        });
        el.blur(function () {
            var input = $(this);
            if(input.val() == '') {
                input.val(input.data('defaultValue'));
            }
        });
    };
     
    defaultValue($('#coll-name'), 'Name your collection');
    defaultValue($('#img-url'), 'Paste your image URLs here');
   
    if(wall.name != '') {
        $('#coll-name').val(wall.name);
    }
    $('#collname form').submit(function (e) {

        $('#message').slideUp('fast');
        var form = $(this)
        form.find('.button').attr('disabled', 'true').addClass('loading');
        wall.name = $('#coll-name').val();
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: JSON.stringify(wall),
            success: function() {
                $('title').text(wall.name + ' - Scrwall');
                form.find('.button').removeAttr('disabled').removeClass('loading');
            },
            error: function() {
                form.find('.button').removeAttr('disabled').removeClass('loading');
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
        form.find('.button').attr('disabled', 'true').addClass('loading');
        var item = {"url": $('#img-url').val()};
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: JSON.stringify(item),
            success: function() {
                addItem(item.url);
                $("#img-url").val('').blur();
                form.find('.button').removeAttr('disabled').removeClass('loading');
            },
            error: function() {
                form.find('.button').removeAttr('disabled').removeClass('loading');
                $('#msgtxt').text('The url you provided didn\'t quite work could you try again?');
                $('#message').slideDown('fast');
            }
        });
        e.preventDefault();
        return false;
    });

    $('.feedback').click(function (e) {
        $('#overlay').fadeIn('fast');
        e.preventDefault();
        return false;
    });

    $('#close-feedback').click(function (e) {
        $('#overlay').css('display', 'none');
        e.preventDefault();
        return false;
    });

    $('#commentform').submit(function (e) {
        var form = $(this)
        form.find('.button').attr('disabled', 'true').addClass('loading');
        var feedback = {
            "comment": $('#feedback_comment').val(),
            "name": $('#feedback_name').val(),
            "email": $('#feedback_email').val()
        };
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: JSON.stringify(feedback),
            success: function() {
                form.find('.button').removeAttr('disabled').removeClass('loading');
                $('#overlay').fadeOut('fast');
            },
            error: function() {
                form.find('.button').removeAttr('disabled').removeClass('loading');
                $('#overlay').fadeOut('fast');
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
    
    $.each(items, function () {
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

