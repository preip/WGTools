$(document).ready(function() {
    $('.shopping-list-item').click(function(e){
        $('#' + e.currentTarget.id).toggleClass('strikethrough');
        updateEntry(e.currentTarget.id);
    });

    $('.shopping-list-delete').click(function(e) {
        var id = $(this).closest('tr').attr('id');
        deleteEntry(id);
    });
});

function deleteEntry(id) {
    console.log('/shoppinglist/Delete' + '?' + $.param({"Id": id}));
    $.ajax({
        url: '/shoppinglist/Delete' + '?' + $.param({"Id": id}), 
        type: 'Delete'}
    )
}

function updateEntry(id) {
    $.ajax({
        url: '/shoppinglist/Update' + '?' + $.param({"Id": id}), 
        type: 'POST'
    }
    )
}

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover({trigger: 'hover'});
});