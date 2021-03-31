// メニュー開閉
function menu(tName) {
    var tMenu = document.getElementById(tName).style;
    if (tMenu.display == "none") {
        tMenu.display = "block";
    } else {
        tMenu.display = "none";
    }
}

function getJSON(url, callback) {
    var req = new XMLHttpRequest();
    req.onload = function() {
        var data = JSON.parse(req.responseText);
        return callback(data);
    };
    req.open("GET", url, true);
    req.send(null);
}

getJSON(document.querySelector("meta[name=bmstable]").getAttribute("content"),
    function(header) {
        if (header.last_update != null) {
            var last_update = new Date(header.last_update);
            document.getElementById("update").textContent = last_update.toLocaleDateString();
        }
        getJSON(header.data_url,
            function(information) {
                if (header.level_order) {
                    makeBMSTable(information, header.symbol, header.level_order);
                } else {
                    makeBMSTable(information, header.symbol);
                }
            });
    });


// ソートのための引数追加
function makeBMSTable(info, mark, order) {
    // orderが未指定の場合はnull
    if (typeof order === "undefined") {
        order = null;
    }

    var x = "";
    var ev = "";
    var total = 0;
    var count = 0;
    var obj = document.querySelector("#table_int");

    // ソート
    if (order != "" && order != null) {
        // header.jsonにsortが存在する場合は指定順->タイトル順にソート

        var orderAry = [];
        for (var l = 0; l < order.length; l++) {
            orderAry.push(order[l].toString());
        }

        for (var j = 0; j < info.length; j++) {
            var index = orderAry.indexOf(info[j]["level"]);
            info[j]["_index"] = index;
        }

        info.sort(function(a, b) {
            if (a["_index"] < b["_index"]) {
                return -1;
            } else if (a["_index"] > b["_index"]) {
                return 1;
            } else if (a["title"].toLowerCase() < b["title"].toLowerCase()) {
                return -1;
            } else if (a["title"].toLowerCase() > b["title"].toLowerCase()) {
                return 1;
            } else {
                return 0;
            }
        });
        for (var k = 0; k < info.length; k++) {
            delete info[k]["_index"];
        }
    } else {
        // そうでない場合はレベル順->タイトル順にソート
        info.sort(
            function(a, b) {
                var aLv = a["level"].toString();
                var bLv = b["level"].toString();
                if (isNaN(a["level"]) == false && isNaN(b["level"]) == false) {
                    return a["level"] - b["level"];
                } else if (aLv < bLv) {
                    return -1;
                } else if (aLv > bLv) {
                    return 1;
                } else if (a["title"].toLowerCase() < b["title"].toLowerCase()) {
                    return -1;
                } else if (a["title"].toLowerCase() > b["title"].toLowerCase()) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }

    // 表のクリア
    obj.innerHTML = "<thead><tr><td>Level</td><td>Movie</td><td>Chart</td><td>Title</td><td>Artist</td><td>DL</td><td>Date</td><td>Comment</td></tr></thead>"
    var obj_sep = null;
    for (var i = 0; i < info.length; i++) {
        // 難度ごとの区切り
        if (x != info[i].level) {
            // 前の区切りに譜面数、平均密度を追加
            if (obj_sep != null) {
                obj_sep.innerHTML = "<td colspan='8'>" + "<b>" + mark + x + " (" + count + " Charts)</b></td>";
            }
            obj_sep = document.createElement("tr");
            obj_sep.setAttribute("class", "tr_separate");
            obj_sep.setAttribute("id", mark + info[i].level);
            obj.appendChild(obj_sep);
            total += count;
            count = 0;
            x = info[i].level;
        }
        // 本文
        var str = "";
        var ele = document.createElement("tr");
        if (info[i].state == 1) {
            ele.setAttribute("class", "state1");
        } else if (info[i].state == 2) {
            ele.setAttribute("class", "state2");
        } else if (info[i].state == 3) {
            ele.setAttribute("class", "state3");
        } else if (info[i].state == 4) {
            ele.setAttribute("class", "state4");
        } else if (info[i].state == 5) {
            ele.setAttribute("class", "state5");
        } else if (info[i].state == 6) {
            ele.setAttribute("class", "state6");
        } else {
            ele.setAttribute("class", "tr_normal");
        }

        // レベル表記
        str += "<td width='1%'>" + mark + x + "</td>";
        // 動画
        if (info[i].movie_link != "" && info[i].movie_link != null) {
            // ニコニコ
            str += "<td width='1%'><a href='" + info[i].movie_link + "' target='_blank'>■</a></td>";
        } else {
            str += "<td width='1%'></td>";
        }
        // 譜面画像
        str += "<td width='1%'><a href='http://www.ribbit.xyz/bms/score/view?p=1&md5=" + info[i].md5 + "' target='_blank'>■</a></td>";

        // タイトル
        str += "<td width='20%'>" + "<a href='http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=" + info[i].md5 + "' target='_blank'>" + info[i].title + "</a></td>";
        // アーティスト
        var astr = "";
        if (info[i].url != "" && info[i].url != null) {
            if (info[i].artist != "" && info[i].artist != null) {
                astr = "<a href='" + info[i].url + "'>" + info[i].artist + "</a>";
            } else {
                astr = "<a href='" + info[i].url + "'>" + info[i].url + "</a>";
            }
        } else {
            if (info[i].artist != "" && info[i].artist != null) {
                astr = info[i].artist;
            }
        }
        if (info[i].url_pack != "" && info[i].url_pack != null) {
            if (info[i].name_pack != "" && info[i].name_pack != null) {
                astr += "<br>(<a href='" + info[i].url_pack + "'>" + info[i].name_pack + "</a>)";
            } else {
                astr += "<br>(<a href='" + info[i].url_pack + "'>" + info[i].url_pack + "</a>)";
            }
        } else {
            if (info[i].name_pack != "" && info[i].name_pack != null) {
                astr += "<br>(" + info[i].name_pack + ")";
            }
        }
        str += "<td width='20%'>" + astr + "</td>";
        // 差分
        if (info[i].url_diff != "" && info[i].url_diff != null) {
            if (info[i].name_diff != "" && info[i].name_diff != null) {
                str += "<td width='3%'><a href='" + info[i].url_diff + "'>" + info[i].name_diff + "</a></td>";
            } else {
                str += "<td width='3%'><a href='" + info[i].url_diff + "'>DL</a></td>";
            }
        } else {
            if (info[i].name_diff != "" && info[i].name_diff != null) {
                str += "<td width='3%'>" + info[i].name_diff + "</td>";
            } else {
                str += "<td width='3%'>同梱</td>";
            }
        }
        // Added Date
        if (info[i].date != "" && info[i].date != null) {
            var addDate = new Date(info[i].date);
            var year = addDate.getFullYear();
            var month = addDate.getMonth() + 1;
            var day = addDate.getDate();
            if (month < 10) {
                month = "0" + month;
            }
            if (day < 10) {
                day = "0" + day;
            }
            str += "<td width='3%'>" + year + "." + month + "." + day + "</td>";
        } else {
            str += "<td width='3%'></td>";
        }
        // コメント
        if (navigator.language === "ko-KR" || navigator.language === "ko-kr" || navigator.language === "ko") {
            str += "<td width='25%'>" + info[i].comment_kr + "</div></td>";
        } else {
            str += "<td width='25%'>" + info[i].comment + "</div></td>";
        }
        ele.innerHTML = str;
        obj.appendChild(ele);
        count++;
    }


    // 最後の区切り処理
    // マークが抜け落ちてたので追加
    if (obj_sep != null) {
        obj_sep.innerHTML = "<td colspan='8'>" + "<b>" + mark + x + " (" + count + " Charts)</b></td>";
    }
    document.querySelector("#total").textContent = (total + count);
}