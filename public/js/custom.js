
var _shoppingListData = [];
getShoppingListJSON();

$(document).ready(function() {
    $('.shopping-list-item').click(function(e){
        $('#' + e.currentTarget.id).toggleClass('strikethrough');
        var item = _shoppingListData[e.currentTarget.id];
        item.isClaimed = !item.isClaimed;
        sendJSONToShoppingList(JSON.stringify(item));
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

function getShoppingListJSON() {
    $.get("/shoppinglist/GetAll")
    .done(function(data) {
        _shoppingListData = data;
    })
    .fail(function(data) {
        console.log("Getting the shoppingList JSON failed! " + data);
        _shoppingListData = [];
    });
}

function sendJSONToShoppingList(data) {
    $.ajax({
        url: '/shoppinglist/Update', 
        type: 'POST', 
        contentType: 'application/json', 
        data: data}
    )
}

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover({trigger: 'hover'});
});