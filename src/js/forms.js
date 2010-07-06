var forms = {
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
    init: function () {
        forms.defaultValue($('#coll-name'), 'Name your collection');
        forms.defaultValue($('#img-url'), 'Paste your image URLs here');
       
        if(current.name != '') {
            $('#coll-name').val(current.name);
        }

        $('#collname form').submit(function (e) {

            $('#message').slideUp('fast');
            var form = $(this)
            form.find('.button').attr('disabled', 'true').addClass('loading');
            current.name = $('#coll-name').val();
            $.ajax({
                type: form.attr('method'),
                url: form.attr('action'),
                data: JSON.stringify(current),
                success: function() {
                    $('title').text(current.name + ' - Scrwall');
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
                success: function(d, s, xhr) {
                    // location has the id of the item at the end
                    var key = xhr.getResponseHeader('Location').replace(/.*\//, '');
                    wall.addItem(item.url, key, wall.loadNewImage);
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
    }
};

