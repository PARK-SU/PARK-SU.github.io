// Difficulty Table
$(document).ready(function() {
    $.getJSON($("meta[name=bmstable]").attr("content"), function(header) {
        mark = header.symbol;
        getLanguage = navigator.language;
        if (header.last_update != null) $("#update").text("Last Update : " + header.last_update);
        if (header.enum_level_order != null) $.fn.dataTable.enum(header.enum_level_order);
        if (header.changelog_url != null) makeChangelog(header.changelog_url);
        makeBMSTable(header);
    });
});

// Changelog
function makeChangelog(url) {
    $("#changelog").load(url);
    $("#show_log").click(function() {
        if ($("#changelog").css("display") == "none" && $(this).html() == "View Changelog") {
            $("#changelog").show();
            $(this).html("Hide Changelog");
        } else {
            $("#changelog").hide();
            $(this).html("View Changelog");
        }
    });
}

// BMS table
function makeBMSTable(header) {
    $("#table_diff").DataTable({
        paging: false,
        info: false,
        lengthChange: false,

        language: {
            url: getLanguage === "ko-KR" || getLanguage === "ko-kr" || getLanguage === "ko"
                 ? "//cdn.datatables.net/plug-ins/1.10.22/i18n/Korean.json"
                 : "//cdn.datatables.net/plug-ins/1.10.22/i18n/Japanese.json"
        },

        ajax: {
            "url": typeof data_link != "undefined"
                   ? data_link
                   : header.data_url,
            "dataSrc": ""
        },

        columns: typeof tableColumns != "undefined"
                 ? tableColumns
                 : defaultColumns,

        createdRow: function(row, data) {
            if (data.state == 1) {
                $(row).addClass("table-primary"); // New
            }
            if (data.state == 2) {
                $(row).addClass("table-warning"); // Fixed
            }
            if (data.state == 3) {
                $(row).addClass("table-success"); // Chartin
            }
            if (data.state == 4) {
                $(row).addClass("table-secondary"); // Darkhistory
            }
            if (data.state == 5) {
                $(row).addClass("table-info"); // Recommend
            }
        },

        initComplete: function() { // Filter
            if (getLanguage === "ko-KR" || getLanguage === "ko-kr" || getLanguage === "ko") { // Filter by Korean
                this.api().columns(0).every(function() {
                    var column = this;
                    var select = $("<div class='dataTables_length' style='float:left'>레벨 필터: <select class='form-control'><option value=''>Level</option></select></div>")
                        .prependTo($("#table_diff_wrapper"))
                        .on("change", function() {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).find("select").val()
                            );
                            column.search(val ? "^" + val + "$" : "", true, false).draw();
                        });
                    column
                        .data()
                        .unique()
                        .sort(function(a, b) {
                            return parseInt(a) - parseInt(b); // a - b는 오름차순, b - a 는 내림차순
                        })
                        .each(function(d, j) {
                            select.find("select").append("<option value='" + mark + d + "'>" + d + "</option>")
                        });
                });
            } else { // Filter by Japanese
                this.api().columns(0).every(function() {
                    var column = this;
                    var select = $("<div class='dataTables_length' style='float:left'>レベルでフィルタ: <select class='form-control'><option value=''>Level</option></select></div>")
                        .prependTo($("#table_diff_wrapper"))
                        .on("change", function() {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).find("select").val()
                            );
                            column.search(val ? "^" + val + "$" : "", true, false).draw();
                        });
                    column
                        .data()
                        .unique()
                        .sort(function(a, b) {
                            return parseInt(a) - parseInt(b); // a - b는 오름차순, b - a 는 내림차순
                        })
                        .each(function(d, j) {
                            select.find("select").append("<option value='" + mark + d + "'>" + d + "</option>")
                        });
                });
            }
        }
    });
}

// Table Data
var tableData = {

    // Level (IR)
    tableLevel: function(data, type, row) {
        return "<a href='http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=" + row.md5 + "' target='_blank'>" + mark + data + "</a>";
    },

    // Title (Movie Link)
    tableTitle: function(data, type, row) {
        if (row.movie_link != "") {
            if (data != "") {
                return "<a href='" + row.movie_link + "' target='_blank'>" + data + "</a>";
            } else {
                return "<a href='" + row.movie_link + "' target='_blank'>" + row.movie_link + "</a>";
            }
        } else {
            if (data != "") {
                return data;
            } else {
                return "";
            }
        }
    },

    // Artist (Song DL)
    tableArtist: function(data, type, row) {
        var astr = "";
        if (row.url != "") {
            if (data != "") {
                astr = "<a href='" + row.url + "' target='_blank'>" + data + "</a>";
            } else {
                astr = "<a href='" + row.url + "' target='_blank'>" + row.url + "</a>";
            }
        } else {
            if (data != "") {
                astr = data;
            }
        }
        if (row.url_pack != "") {
            if (row.name_pack != "") {
                astr += "<br>(<a href='" + row.url_pack + "' target='_blank'>" + row.name_pack + "</a>)";
            } else {
                astr += "<br>(<a href='" + row.url_pack + "' target='_blank'>" + row.url_pack + "</a>)";
            }
        } else {
            if (row.name_pack != "") {
                astr += "<br>(" + row.name_pack + ")";
            }
        }
        return astr;
    },

    // Pattern Download
    tablePattern: function(data, type, row) {
        if (row.url_diff != "") {
            if (data != "") {
                return "<a href='" + row.url_diff + "' target='_blank'>" + data + "</a>";
            } else {
                return "<a href='" + row.url_diff + "'><i class='far fa-lg fa-arrow-alt-circle-down'></i></a>";
            }
        } else {
            if (data != "") {
                return data;
            } else {
                return "同梱";
            }
        }
    },

    // Added Date
    tableDate: function(data, type, row) {
        if (data != "") {
            var addDate = new Date(data);
            var year = addDate.getFullYear();
            var month = addDate.getMonth() + 1;
            var day = addDate.getDate();
            if (month < 10) {
                month = "0" + month;
            }
            if (day < 10) {
                day = "0" + day;
            }
            return year + "." + month + "." + day;
        } else {
            return "";
        }
    },

    // View Pattern
    tableScore: function(data, type, row) {
        return "<a href='http://www.ribbit.xyz/bms/score/view?md5=" + data + "' target='_blank'><i class='fas fa-lg fa-music'></i></a>";
    },

    // Comment
    tableComment: function(data, type, row) {
        if (getLanguage === "ko-KR" || getLanguage === "ko-kr" || getLanguage === "ko") {
            return row.comment_kr;
        } else {
            return data;
        }
    },
};

var defaultColumns = [
    {
        "title": "Level<br>(IR)",
        "width": "1%",
        "data": "level",
        "type": "natural-nohtml",
        "render": tableData.tableLevel
    },
    {
        "title": "Title<br>(Movie)",
        "width": "30%",
        "data": "title",
        "render": tableData.tableTitle
    },
    {
        "title": "Artist<br>(Song DL)",
        "width": "30%",
        "data": "artist",
        "render": tableData.tableArtist
    },
    {
        "title": "DL",
        "width": "1%",
        "data": "name_diff",
        "orderable": false,
        "searchable": false,
        "render": tableData.tablePattern
    },
    {
        "title": "Date",
        "width": "5%",
        "data": "date",
        "render": tableData.tableDate
    },
    {
        "title": "<i class='fas fa-lg fa-search'></i>",
        "width": "1%",
        "data": "md5",
        "orderable": false,
        "searchable": false,
        "render": tableData.tableScore
    },
    {
        "title": "Comment",
        "width": "30%",
        "data": "comment",
        "render": tableData.tableComment
    },
];