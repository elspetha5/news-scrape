$(document).on("click", ".noteButton", function () {
    $("#notes").empty();

    let thisId = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        .then(function (data) {
            $("#notes").append("<h3>Notes on:</h3>");
            $("#notes").append("<h3>" + data.title + "</h3>");
            $("#notes").append('<textarea id="noteBody"></textarea>');
            $("#notes").append('<button data-id="' + data._id + '" id="addNote">Add/Update note</button>');

            if (data.note) {
                $("#noteBody").val(data.note.body);
            };
        });

    $("#notes").removeAttr("hidden").show();
});


$(document).on("click", "#addNote", function () {
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "articles/" + thisId,
        data: {
            body: $("#noteBody").val()
        }
    })
        .then(function (data) {
            console.log(data);
            $("#notes").hide().empty();
        });

    $("#noteBody").val("");
});


$(document).on("click", ".saveArticle", function () {
    var thisId = $(this).attr("data-id");
    var saved = $(this).attr("data-saved");

    if (saved === false) {
        $.ajax({
            method: "GET",
            url: "saved/" + thisId
        })
            .then(function (data) {
                console.log("Saved")
            });
    } else {
        $.ajax({
            method: "GET",
            url: "unsaved/" + thisId
        })
            .then(function (data) {
                console.log("Unsaved");
            });
    }
});