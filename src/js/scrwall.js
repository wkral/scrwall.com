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
    try {
    var PADDING = 11;
    var MARGIN = 10;

    //dirty global until I figure something better
    var LOADING_QUEUE = 0;

    var funcs = {
        defaultValue: function(el, value) {
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
        },
        stopEvent: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        startDrag: function(e) {
            var body = $('#body');
            body.data('cursor', {
                mousedown: true,
                x: e.pageX,
                y: e.pageY
            });
            funcs.stopEvent(e);
        },
        stopDrag: function(e) {
            var body = $('#body');
            var cursor = body.data('cursor');
            cursor.mousedown = false;
            body.data('cursor', cursor);
            funcs.stopEvent(e);
        },
        drag: function(e) {
            mover.cancel();
            var body = $('#body');
            var cursor = body.data('cursor');
            if(cursor.mousedown) {
                var deltaX = e.pageX - cursor.x;
                var deltaY = e.pageY - cursor.y;
                cursor.x = e.pageX;
                cursor.y = e.pageY;
                funcs.move(deltaX, deltaY);
            }
            funcs.stopEvent(e);
        },
        move: function(deltaX, deltaY) {
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
        addItem: function(url, callback) {
            var image = new Image();
            $(image).attr({
                src: url,
                alt: 'Collection Item'
            });
            $(image).load(callback);
        },
        loadExistingImage: function() {
            funcs.appendImage(this);
        },
        loadNewImage: function() {
            var item = funcs.appendImage(this);

            var body = $('#body');
            var position = body.data('position');

            var centerX = item.left + item.width / 2;
            var centerY = item.top + item.height / 2;

            var deltaX = -centerX - position.offsetX + body.width() / 2;
            var deltaY = -centerY - position.offsetY + body.height() / 2;

            mover.move(deltaX, deltaY);
        },
        appendImage: function(img) {
            var domItem = $('<div>', {
                'class': 'item'
            }).append($(img));

            var body = $('#body');

            var layout = body.data('layout');

            var position = body.data('position');

            var box_padding = (MARGIN + PADDING) * 2;

            var item = layout.add(img.width + box_padding, img.height + box_padding);

            var top = item.top + MARGIN;
            var left = item.left + MARGIN;
            domItem.css('top', top + position.offsetY + 'px');
            domItem.css('left', left + position.offsetX + 'px');
            domItem.data('top', top);
            domItem.data('left', left);

            body.append(domItem);
            return item;
        }
    };

    var mover = {
        step: null,
        timeout: null,
        move: function(deltaX, deltaY) {
            var stepX = deltaX / 50;
            var stepY = deltaY / 50;
            
            window.clearTimeout(this.timeout);
            this.step = {x: stepX, y: stepY, count: 50};
            this.proceed();
        },
        proceed: function() {
            if(mover.step != null) {
                var step = mover.step;
                funcs.move(step.x, step.y);
                step.count--;
                var time = 5;
                if(step.count < 10) {
                    time = time * (10 - step.count);
                }
                if(step.count <= 0) {
                    mover.step = null;
                }
                mover.timeout = window.setTimeout(mover.proceed, time);
            }
        },
        cancel: function() {
            window.clearTimeout(this.timeout);
        }
    };
     
    funcs.defaultValue($('#coll-name'), 'Name your collection');
    funcs.defaultValue($('#img-url'), 'Paste your image URLs here');
   
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
                funcs.addItem(item.url, funcs.loadNewImage);
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
        mousedown: funcs.startDrag,
        mouseout: funcs.stopDrag,
        mouseup: funcs.stopDrag,
        mousemove: funcs.drag
    });
    cover.get(0).addEventListener('mousewheel', function (e) {
        funcs.move(e.wheelDeltaX / 60, e.wheelDeltaY / 60);
    }, true);
    window.addEventListener('DOMMouseScroll', function (e) {
        if(e.axis == e.HORIZONTAL_AXIS) {
            funcs.move(e.detail * -3, 0);
        } else {
            funcs.move(0, e.detail * -3);
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

    body.data('layout', SpiralLayout(PADDING, MARGIN));
    
    $.each(items, function () {
        funcs.addItem(this, funcs.loadExistingImage);
    });
    } catch (e) {
        //swallow top level exceptions
    }
});


