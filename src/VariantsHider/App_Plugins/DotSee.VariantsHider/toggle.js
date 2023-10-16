function HideShowTreeNodes()
{
    $("li.umb-tree-item.not-published").each(function () {
        tgl($(this));
    });

    $(document).arrive("li.umb-tree-item.not-published-add", function () {
        tgl($(this));
    });
};
    function tgl(t) {
        var name = t.find("a").text();
        if (name.startsWith("(") && name.endsWith(")")) {
            t.toggle();
        }
    }



