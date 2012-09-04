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
    $("body").removeClass("background-purple background-process").addClass("background-"+background);
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

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}


document.getElementById('files').addEventListener('change', handleFileSelect, false);

