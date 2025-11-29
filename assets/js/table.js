// Difficulty Table
let mark = "";
let data_link = "";
let isSabunPage = window.location.href.indexOf("sabun");
document.addEventListener("DOMContentLoaded", function () {
  async function getJSON() {
    const response = await fetch(
      document.querySelector("meta[name=bmstable]").getAttribute("content")
    );
    const header = await response.json();
    document.getElementById("changelogText").value = "Loading...";
    document.getElementById("smallTableTitle").innerHTML =
      "<i class='fa-solid fa-table me-2'></i>" + header.name;
    if (header.symbol) mark = header.symbol;
    if (header.data_url) data_link = header.data_url;
    if (header.level_order) {
      const enumOrder = header.level_order.map((e) => mark + e);
      DataTable.enum(enumOrder);
    }
    makeBMSTable();
  }
  if (document.querySelector("meta[name=bmstable]")) getJSON();
});

// BMS table
function makeBMSTable() {
  let bmsTable = new DataTable("#tableDiff", {
    paging: false,

    layout: {
      bottomStart:
        isSabunPage !== -1
          ? {
              info: {
                text:
                  languagePrefix === "ko"
                    ? "(검색된) 차분 갯수: _TOTAL_개"
                    : "（検索された）差分数: _TOTAL_",
              },
            }
          : null,
    },

    language: {
      url: `//cdn.datatables.net/plug-ins/2.3.4/i18n/${languagePrefix}.json`,
    },

    ajax: {
      url: data_link,
      dataSrc: "",
    },

    columns:
      typeof tableColumns === "undefined" ? defaultColumns : tableColumns,

    createdRow: function (row, data) {
      const rowColor = {
        1: "bg-primary-subtle",
        2: "bg-warning-subtle",
        3: "bg-success-subtle",
        4: "bg-secondary-subtle",
        5: "bg-info-subtle",
      };
      if (data.state) row.classList.add(rowColor[data.state]);
    },

    initComplete: function () {
      if (isSabunPage !== -1) {
        // Make Changelog
        makeChangelog(bmsTable);
        // Filter
        makeFilter(bmsTable);
        // Tooltips
        const tooltipTriggerList = document.querySelectorAll(
          "[data-bs-toggle='tooltip']"
        );
        const tooltipList = [...tooltipTriggerList].map(
          (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
        );
      }
    },
  });
}

// Changelog
function makeChangelog(table) {
  const data = table.ajax.json();
  // Special Date
  const blogOpen = {
    date: "Sat Sep 08 2018 00:00:00 GMT+0900 (JST)",
    title: "Sabun Blog Open.",
    state: "special",
  };
  const siteMove1 = {
    date: "Thu Feb 28 2019 00:00:00 GMT+0900 (JST)",
    title: "Site Moved.",
    state: "special",
  };
  const siteMove2 = {
    date: "Thu May 02 2019 00:00:00 GMT+0900 (JST)",
    title: "Site Moved.",
    state: "special",
  };
  const domainTransfer1 = {
    date: "Fri Aug 15 2025 00:00:00 GMT+0900 (JST)",
    title: "Domain Transferred. (bms.parksulab.xyz → parksu.darksabun.club)",
    state: "special",
  };
  data.push(blogOpen, siteMove1, siteMove2, domainTransfer1);
  data.sort((a, b) => new Date(b.date) - new Date(a.date));
  const changelogData = data
    .map(function (song) {
      const dateStr = formatDateString(song.date);
      if (song.state == "special") {
        return `(${dateStr}) ${song.title}`;
      } else {
        return `(${dateStr}) ${mark}${song.level} ${song.title} Added.`;
      }
    })
    .join("\n");
  document.getElementById("changelogText").value = changelogData;
}

// Make Filter
function makeFilter(table) {
  const column = table.column(0);
  const filterText =
    languagePrefix === "ko" ? "레벨별 필터: " : "レベルでフィルタ: ";

  const selectContainer = document.createElement("div");
  selectContainer.classList.add("dt-length");

  const select = document.createElement("select");
  select.classList.add("form-select", "form-select-sm");
  select.add(new Option("All", ""));

  select.addEventListener("change", function () {
    const val = DataTable.util.escapeRegex(this.value);
    column.search(val ? "^" + val + "$" : "", true, false).draw();
  });

  selectContainer.appendChild(document.createTextNode(filterText));
  selectContainer.appendChild(select);

  document
    .querySelector("#tableDiff_wrapper > div > .dt-layout-start")
    .prepend(selectContainer);

  column
    .data()
    .unique()
    .sort(function (a, b) {
      // a - b = asc, b - a = desc
      return parseInt(a) - parseInt(b);
    })
    .each(function (d, j) {
      const option = document.createElement("option");
      option.value = mark + d;
      option.textContent = d;
      select.appendChild(option);
    });
}

// Date Format
function formatDateString(dateStr) {
  const date_ = new Date(dateStr);
  const year = date_.getFullYear();
  const month = String(date_.getMonth() + 1).padStart(2, "0");
  const day = String(date_.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

const tableData = {
  tableLevel: function (data) {
    return mark + data;
  },

  tableMinIR: function (data) {
    const scoreBaseURL = `https://www.gaftalk.com/minir/#/viewer/song/${data}/0`;
    return `<a href="${scoreBaseURL}" target="_blank">MinIR</a>`;
  },

  tableTitle: function (data, type, row) {
    let lr2irURL =
      "http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=";
    lr2irURL += row.md5;
    return `<a href='${lr2irURL}' target='_blank'>${data}</a>`;
  },

  tableScore: function (data) {
    let scoreURL = "https://bms-score-viewer.pages.dev/view?md5=";
    scoreURL += data;
    if (data) {
      return `<a href='${scoreURL}' target='_blank'>
                <i class='fa-solid fa-music fa-lg'></i>
              </a>`;
    } else {
      return "";
    }
  },

  tableMovie: function (data) {
    let movieURL = "https://www.youtube.com/watch?v=";
    if (data) {
      movieURL += data.slice(-11);
      return `<a href='${movieURL}' target='_blank'>
                <i class='fa-solid fa-play fa-lg'></i>
              </a>`;
    } else {
      return "";
    }
  },

  tableArtist: function (data, type, row) {
    let artistStr = "";
    if (row.url) {
      artistStr = `<a href='${row.url}' target='_blank'>${data || row.url}</a>`;
    }
    if (row.url_pack) {
      if (row.name_pack) {
        artistStr += `<br />(<a href='${row.url_pack}' target='_blank'>${row.name_pack}</a>)`;
      } else {
        artistStr += `<br />(<a href='${row.url_pack}' target='_blank'>${row.url_pack}</a>)`;
      }
    } else if (row.name_pack) {
      artistStr += `<br />(${row.name_pack})`;
    }
    return artistStr;
  },

  tableDate: function (data) {
    if (data) {
      return formatDateString(data);
    } else {
      return "";
    }
  },

  // Chart Download
  tableChart: function (data, type, row) {
    if (row.url_diff) {
      if (data) {
        return `<a href='${row.url_diff}' target='_blank'>${data}</a>`;
      } else {
        return `<a href='${row.url_diff}'>
                  <i class='fa-solid fa-arrow-down fa-lg'></i>
                </a>`;
      }
    } else {
      if (data) {
        return data;
      } else {
        if (languagePrefix === "ko") {
          return "동봉";
        } else {
          return "同梱";
        }
      }
    }
  },

  // Total, Notes, Gauge
  tableGauge: function (data, type, row) {
    let gaugeCaculate, totalNotesStr, textColor, gaugeText, judgeRankText;

    if (row.judge) {
      const judgeRank = {
        ve: "V.EASY<br />(if LR2, NORMAL)",
        ez: "EASY",
        nm: "NORMAL",
        hd: "HARD",
        vh: "V.HARD",
        ran: "???",
        none: "???<br />(if LR2, NORMAL)",
      };
      judgeRankText = "Judge Rank: " + judgeRank[row.judge];
    }

    if (row.notes === "ran" && row.total === "ran") {
      gaugeCaculate = "???";
      totalNotesStr = "Notes: ???<br />Total: ???<br />" + judgeRankText;
    } else if (row.notes === "ran") {
      gaugeCaculate = "???";
      totalNotesStr =
        "Notes: ???<br />Total: " + row.total + "<br />" + judgeRankText;
    } else if (row.total === "0") {
      const notes = Number(row.notes);

      if (notes < 400) {
        row.total = 0.16 * notes + 160;
      } else if (notes >= 400 && notes < 600) {
        row.total = 0.32 * notes + 96;
      } else {
        row.total = 0.16 * notes + 192;
      }

      gaugeCaculate = Math.floor((Number(row.total) / notes) * 1000) / 1000;
      totalNotesStr = `Notes: ${row.notes}<br />Total: 0<br />${judgeRankText}<br />(Based on LR2 gauge calculation formula)`;
    } else {
      gaugeCaculate =
        Math.floor((Number(row.total) / Number(row.notes)) * 1000) / 1000;
      totalNotesStr = `Notes: ${row.notes}<br />Total: ${row.total}<br />${judgeRankText}`;
    }

    if (gaugeCaculate < 0.18) {
      textColor = "text-danger";
    } else if (gaugeCaculate > 0.25) {
      textColor = "text-primary";
    } else {
      textColor = "";
    }

    gaugeText = `<span class='${textColor}'
                    data-bs-toggle='tooltip'
                    data-bs-html='true'
                    title='${totalNotesStr}'>
                      ${gaugeCaculate}
                </span>`;

    return gaugeText;
  },

  // Comment
  tableComment: function (data, type, row) {
    if (getLanguage.slice(0, 2) === "ko") {
      return row.comment_ko;
    } else {
      return row.comment;
    }
  },
};

const defaultColumns = [
  {
    title: "Level",
    width: "5.75%",
    data: "level",
    render: tableData.tableLevel,
  },
  {
    title: "<i class='fa-solid fa-music fa-lg'></i>",
    width: "1%",
    data: "md5",
    orderable: false,
    searchable: false,
    render: tableData.tableScore,
  },
  {
    title: "<i class='fa-solid fa-play fa-lg'></i>",
    width: "1%",
    data: "movie_link",
    orderable: false,
    searchable: false,
    render: tableData.tableMovie,
  },
  {
    title: "MinIR",
    width: "1%",
    data: "sha256",
    orderable: false,
    searchable: false,
    render: tableData.tableMinIR,
  },
  {
    title: "Title<br />(LR2IR)",
    width: "30%",
    data: "title",
    render: tableData.tableTitle,
  },
  {
    title: "Artist<br />(BMS DL)",
    width: "30%",
    data: "artist",
    render: tableData.tableArtist,
  },
  {
    title: "DL",
    width: "1%",
    data: "name_diff",
    className: "text-nowrap",
    orderable: false,
    render: tableData.tableChart,
  },
  {
    title: "Date",
    width: "5%",
    data: "date",
    className: "text-center",
    render: tableData.tableDate,
  },
  {
    title: languagePrefix === "ko" ? "회복량<br />(T/N)" : "回復量<br />(T/N)",
    width: "1%",
    orderable: false,
    className: "text-nowrap",
    render: tableData.tableGauge,
  },
  {
    title: "Comment",
    width: "30%",
    render: tableData.tableComment,
  },
];
