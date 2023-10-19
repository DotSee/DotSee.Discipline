var enableHideNodes = "";

$.ajax({
    url: "/umbraco/api/TreeVariantSettings/HideUnpublishedVariantsFromTree",
    success: function (data) {
        enableHideNodes = data;
    }
    , async: false
});

if (enableHideNodes === "true") {

    $(document).arrive("li.umb-tree-item.not-published-add", function () {
        var name = $(this).find("a").text();
        if (name.startsWith("(") && name.endsWith(")")) {
            $(this).hide();
        }
    });
    $(document).arrive("li.umb-tree-item.not-published", function () {
        var name = $(this).find("a").text();
        if (name.startsWith("(") && name.endsWith(")")) {
            $(this).hide();
        }
    });
}
