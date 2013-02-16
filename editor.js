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
    $("#save-button").click(function () {
        setDownloadText();
        return true;
    });
    $("#editor").bind('keyup click blur focus change paste', function () {
        $('#word-count').text(countWords());
    });
});

function setEditorFont(font) {
    $("#editor").removeClass("font-ovo font-karla font-lusatania font-muli").addClass("font-"+font);
}

function setEditorFontSize(size) {
    $("#editor").css({"font-size":size+"pt","line-height":size+"pt"});
}

function setBackground(background) {
    $("body").removeClass("background-purple background-process background-felt").addClass("background-"+background);
}

function setDownloadText() {
    var dlText = $("#editor").val();
    var tag = $("#save-button");
    tag.attr("href", "data:text/plain;base64,"+ window.btoa(dlText));
}

function countWords() {
    var contents = $("#editor").val();
    var wordCount = 0;
    if(!(contents === '')) {
        wordCount = jQuery.trim($("#editor").val()).replace(/\s+/g, " ").split(" ").length;
    }
    return wordCount;
}

function loadFile(form) {
    if (typeof FileReader !== 'function') {
        $("#editor").val("Attempted file loading cannot occur as the File API is not supported.");
    } else {
        // XXX(akesling): lastElementChild is very fragile... if
        // anything else is added after it in the form it will break.
        var list = form.lastElementChild.files;
        if (list.length > 0) {
            var file = list[0];
            var reader = new FileReader();

            reader.onload = function(fileObj) {
                $("#editor").val(fileObj.target.result);
                $('#word-count').text(countWords());
            };

            reader.readAsText(file);
        }
    }
}
