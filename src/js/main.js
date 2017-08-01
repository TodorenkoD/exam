//= tmpl/template.js
//= discover/stub.js

$(function($) {

    $('.jcarousel')
        .jcarousel({
            animation: 'slow',
            wrap: 'circular',
            auto: 2,
            scroll: 1
        })
        .jcarouselAutoscroll({
            interval: 4000,
            target: '+=1',
            autostart: true
        });

    $('.jcarousel-control-prev')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '-=1'
        });

    $('.jcarousel-control-next')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '+=1'
        });


    $.support.cors = true;

    function renderGrid(search) {

        var search = typeof search !== 'undefined' ? search : '';

        $.ajax({
            type: 'GET',
            url: 'http://api.pixplorer.co.uk/image?word=' + search + '&amount=7&size=m',
            dataType: 'json',
            cache: false,

            success: function(data) {
                rebuildGrid(data)
            },

            error: function() {
                rebuildGrid(discoverStub);
            }

        });

        function rebuildGrid(data) {

            if (data.status === 'failed') {
                data = discoverStub;
            }

            var html = $('#grid__template').html();
            var content = tmpl(html, { data: data.images });

            $('.grid').remove();
            $('.discover .width-wrapper').append(content);

            $('.grid').isotope({
                itemSelector: '.tile',
                layoutMode: 'masonry',
                masonry: {
                    gutter: 20
                }
            });

        } // rebuildGrid
    }

    $('.button--search').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $searchInput = $('.search__input');
        renderGrid(encodeURIComponent($searchInput.val()));

        $searchInput.val('');
        return false;
    });

    renderGrid();

}(jQuery));