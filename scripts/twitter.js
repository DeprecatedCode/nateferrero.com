/**
 * NateFerrero.com - Twitter
 */
function twitterCallback(data) {
    var tweet = data[0];
    var sn = tweet.user.screen_name;
    var html = tweet.text;
    var twa = '<a href="https://twitter.com/';
    html = html.replace(/(http|https)([^\s\)]+)/g, '<a href="$1$2">$1$2</a>');
    html = html.replace(/\@(\w+)/g, twa + '$1">@$1</a>');
    html = twa + sn + '/status/' + tweet.id_str +'">@' + sn +
        '</a> &ndash; ' + html;
    var div = $('<div class="tweet">').html(html).append($('<div class="bird">'));
    $('.header').append(div);
}

$.getJSON("http://api.twitter.com/1/statuses/user_timeline.json?callback=?&screen_name=NateFerrero&count=1&include_rts=true", twitterCallback);
