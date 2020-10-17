// for Main & Link page
$(document).ready(function() {
    currentURL = location.pathname;
    getLanguage = navigator.language;
    data_link = "https://script.google.com/macros/s/AKfycbyIrtQcjXyAKri3Gc3wlutl9bdLl9Amd2Y7LC1Vt6aApb3B3_8/exec?table=";
    makeETCTable();
});

function makeETCTable() {
    table = $("#table_diff").DataTable({
        searching: currentURL != "/" 
                   ? true
                   : false,
        paging: false,
        info: false,
        lengthChange: false,

        language: {
            url: getLanguage === "ko-KR" || getLanguage === "ko"
                 ? "//cdn.datatables.net/plug-ins/1.10.21/i18n/Korean.json"
                 : "//cdn.datatables.net/plug-ins/1.10.21/i18n/Japanese.json"
        },

        ajax: {
            "url": currentURL != "/"
                   ? data_link += "bmsinfo"
                   : data_link += "sabun7",
            "dataSrc": ""
        },

        columns: currentURL != "/"
                 ? infoColumns
                 : homeColumns,

        createdRow: function(row, data) {
            if (data.proposal_level === "" && currentURL === "/") {
                $(row).empty();
            }
        },
    })
}

var tableData = {
    tableTitle: function(data, type, row) {
        if (row.proposal_level != "") {
            return "<a href='" + row.movie_link + "'>" + row.proposal_level + " " + data + "</a>";
        } else {
            return "";
        }
    },
    tablePattern: function(data, type, row) {
        if (row.proposal_level != "") {
            return "<a href='" + data + "'><i class='far fa-lg fa-arrow-alt-circle-down'></i></a>";
        } else {
            return "";
        }
    },
    tableName: function(data, type, row) {
        if (row.url != "") {
            if (data != "") {
                return "<a href='" + row.url + "' target='_blank'>" + data + "</a>";
            } else {
                return "<a href='" + row.url + "' target='_blank'>" + row.url + "</a>";
            }
        } else {
            if (data != "") {
                return data;
            } else {
                return "";
            }
        }
    },
    tableExp: function(data, type, row) {
        return data || row.name;
    },
};

var infoColumns = [
    {
        "title": "Title",
        "width": "3%",
        "data": "name",
        "render": tableData.tableName
    },
    {
        "title": "Comment",
        "width": "20%",
        "data": "exp",
        "render": tableData.tableExp
    },
];

var homeColumns = [
    {
        "title": "Title",
        "width": "15%",
        "data": "title",
        "type": "natural-nohtml",
        "render": tableData.tableTitle
    },
    {
        "title": "DL",
        "width": "1%",
        "data": "url_diff",
        "orderable": false,
        "render": tableData.tablePattern
    },
]