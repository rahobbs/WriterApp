$(document).ready(function () {
    $("#font-select").change(function () {
        setEditorFont($("#font-select option:selected").val());
    });
    $("#font-size").change(function () {
        setEditorFontSize($("#font-size").val());
    });
    $("#background-select").change(function () {
        setBackground($("#background-select option:selected").val());
    });
});

function setEditorFont(font) {
    $("#editor").removeClass("font-ovo font-karla font-lusatania font-muli").addClass("font-"+font);
}

function setEditorFontSize(size) {
    $("#editor").css({"font-size":size+"pt","line-height":size+"pt"});
}

function setBackground(background) {
    $("body").removeClass("background-purple background-process").addClass("background-"+background);
}


