
var _shoppingListData = [];
GetShoppingListJSON();

$(document).ready(function() {
    $('.shopping-list-item').click(function(e){
        $('#' + e.currentTarget.id).toggleClass('danger');
        var item = _shoppingListData[e.currentTarget.id];
        item.isClaimed = !item.isClaimed;
        SendJSONToShoppingList(JSON.stringify(item));
    });
});

function GetShoppingListJSON() {
    $.get("/shoppinglist/GetAll")
    .done(function(data) {
        _shoppingListData = data;
    })
    .fail(function(data) {
        console.log("Getting the shoppingList JSON failed! " + data);
        _shoppingListData = [];
    });
}

function SendJSONToShoppingList(data) {
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