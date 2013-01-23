/**
 * NateFerrero.com - Modal
 */
function modal(url) {
    return function() {
        var mfrm = $('<iframe width="100%" height="500">')
            .attr('src', url);
        var mdiv = $('<div class="modal">').append(mfrm);
        $('.content').hide();
        $('.page').append(mdiv);
    };
}
