/**
 * NateFerrero.com
 */
var router = new window.Router();
var md = new window.Markdown.Converter();

function showPhoto(url, style) {
    $('.content').append(
        $('<div style="'+style+';background-image:url('+url+')">')
    );
}

var post = function(name) {
    home.load = false;
    $.ajax({
        type: 'GET',
        dataType: 'text',
        url: '/posts/' + name + '.md',
        success: function(data) {
            data = data.split('\n');
            var text = '', config = {};
            for(var i = 0; i < data.length; i++) {
                var c = data[i];
                if(c.charAt(0) === '@') {
                    var d = c.substr(1).split(' ');
                    var e = d.shift();
                    config[e] = d.join(' ');
                } else {
                    text += c + '\n';
                }
            }
            
            /**
             * Date from URL
             */
            if(name[4] + name[7] + name[10] === '---') {
                config.date = name.substr(0, 10);
            }
            
            /**
             * Spotify Track Support
             */
            text = text.replace(/\-(spotify:[:\w]+)/g, '<div class="fwrap"><iframe src="https://embed.spotify.com/?uri=$1"'+
                ' height="80" frameborder="0" allowtransparency="true"></iframe></div>');
            text = text.replace(/\+(spotify:[:\w]+)/g, '<div class="fwrap"><iframe src="https://embed.spotify.com/?uri=$1"'+
                ' height="380" frameborder="0" allowtransparency="true"></iframe></div>');
            
            /**
             * Render to HTML
             */
            text = md.makeHtml(text);

            /**
             * Automatically add class to next element
             */
            text = text.replace(/\~(app):(.+?)\s*<(.+?)>(.*?<\/.+?>)/g, '<$3 class="$1" style="background-image: url(/images/favicons/$2.png);">$4');
            
            /**
             * Render
             */
            $('head > title').html(config.title + " &bull; Nate Ferrero");
            $('.content').html(text);
            $('.content').append($('<div class="author">').html(
                '<a href="/' + name + '">Permalink</a>' +
                (config.date ? ' &ndash; ' + dateFormat(config.date) : '') +
                ' &ndash; <a href="/">Nate Ferrero</a>'
            ));
        },
        error: function() {
            $('.content').html('<h1>Page Not Found</h1>'+
                '<p>You may want to go to the <a href="/">home page</a>.</p>');
        }
    });
};

var home = {load: true};
var info = {};
home.show = function() {
    if(!home.load) {
        return;
    }
    if(postIndex[0]) {
        post(postIndex[0].url);
    }
};

router.route('/', home.show);
router.route('/:name', post);
router.route('/:name/', function(name) {
    router.navigate('/' + name);
});

function ord(x) {
    var n = x % 100;
    var suff = ["th", "st", "nd", "rd", "th"]; // suff for suffix
    return x + (n<21?(n<4 ? suff[n]:suff[0]): (n%10>4 ? suff[0] : suff[n%10]));
}

/**
 * Date Format
 */
function dateFormat(x) {
    x = x.split('-');
    var y = parseInt(x[0]), m = parseInt(x[1]), d = parseInt(x[2]);
    return 'Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec'.split(' ')[m-1] +
        ' ' + ord(d) + ', ' + y;
}

/**
 * Load Post List
 */
var postIndex = [];
$(function() {
    $.ajax({
        type: 'GET',
        dataType: 'text',
        url: '/posts/index.md',
        success: function(data) {
            data = data.split('\n');
            var config = {};
            for(var i = 0; i < data.length; i++) {
                var c = data[i];
                if(c.charAt(0) === '@') {
                    var d = c.substr(1).split(' ');
                    var e = d.shift();
                    config[e] = d.join(' ');
                } else if(c.indexOf(' ') > 0) {
                    var f = c.split(' ');
                    config.url = f.shift();
                    config.title = f.join(' ');
                    config.tags = config.tags ? config.tags.split(' ') : [];
                    
                    /**
                     * Date from URL
                     */
                    var n = config.url;
                    if(n[4] + n[7] + n[10] === '---') {
                        config.date = n.substr(0, 10);
                    }

                    postIndex.push(config);
                    config = {};
                } else {
                    config = {};
                }
            }
            if(home.load) {
                home.show();
            }
            /**
             * Update search results
             */
            var results = $('#search-results');
            for(i = 0; i < postIndex.length; i++) {
                var post = postIndex[i];
                results.append($('<a class="item">')
                    .attr('href', '/' + post.url)
                    .append(
                        $('<div class="date">')
                            .html(dateFormat(post.date))
                    )
                    .append(
                        $('<span>').html(post.title)
                    )
                );
            }
        }
    });

    /**
     * Capture all links
     */
    $('.width').on('click', 'a', function(e) {
        var href = $(this).attr('href');
        if(href.substr(0, 1) === '/'
            && !e.metaKey
            && !e.ctrlKey
            && !e.altKey
        ) {
            home.load = true;
            router.navigate(href);
            e.preventDefault();
            closeSearch();
            return false;
        }
    });
    
    /**
     * Fix search CSS
     */
    function closeSearch() {
        if(!info.searchEnabled) {
            return;
        }
        info.searchEnabled = false;
        $('#search-results').fadeOut();
        setTimeout(function() {
            $('.search').removeClass('search-active');
        }, 1000);
    }
    
    $('.search').on('click', 'input', function(e) {
        e.stopPropagation();
    });

    $('body').on('click', function(e) {
        closeSearch();
    });

    $("#search-box").on('focus', function(e) {
        if(document.activeElement === this) {
            $('.search').addClass('search-active');
            $('#search-results').fadeIn(300);
            info.searchEnabled = true;
        } else {
            closeSearch();
        }
    });
    $("#search-results").on('mouseover', 'a', function(e) {
        if(!info.searchEnabled) {
            return;
        }
        $('#search-results .item-active').removeClass('item-active');
        $(this).addClass('item-active');
    });
    
    $('.icon-container').on('click', '.toggle-fullscreen', function(e) {
        var f = 'fullscreen';
        var x = $('.content');
        var y = $('.icon-container');
        var z = $('.search');
        if(x.hasClass(f)) {
            x.removeClass(f);
            y.removeClass(f);
            z.removeClass(f);
            document.cookie = "fullscreen=n"
        } else {
            x.addClass(f);
            y.addClass(f);
            z.addClass(f);
            document.cookie = "fullscreen=y"
        }
    });
    
    if(document.cookie.indexOf("fullscreen=y") > -1) {
        $('.toggle-fullscreen').click();
    }
});