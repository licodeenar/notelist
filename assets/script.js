function getNoteList() {
    const resultDispId = 'note_result';
    const api_key = 'AKfycbytT1NBiDEKEQYIyMNaC3qBo4ANuIfWxZUGWMS58mp4A9pzvbqEcRBHUbEqNU1wK-Ig';
    let req = new XMLHttpRequest();
    let form = document.getElementById('setting');
    let url = 'https://script.google.com/macros/s/' + api_key +
        '/exec?id=' + form.note_id.value +
        '&key=' + form.note_key.value;

    //テーブルをクリア＆フォームをロック
    document.getElementById(resultDispId).innerHTML = 'しばらく時間がかかります。。。';
    setFormDisabled(true);

    req.open("GET", url, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            //ロックを解除
            setFormDisabled(false);
            if (req.status == 200) {
                //結果を出力
                drawTable(req.responseText, resultDispId);
            } else {
                drawTable('', resultDispId);
            }
        }
    };
    req.send(null);
}

function setFormDisabled(lock) {
    document.getElementById('note_exe').disabled = lock;
    document.getElementById('note_id').disabled = lock;
}

function drawTable(jasons, elementId) {
    let obj;
    let html = '';

    if (jasons == '"error"' || jasons == '') {
        document.getElementById(elementId).innerHTML = '情報を取得できませんでした。';
    } else {
        obj = JSON.parse(jasons);
        html = '<table class="note_list"><tr><th>#</th><th>ID</th></tr>'
        for (let i = 0; i < obj.length; i++) {
            html += '<tr><td>' +
                (i + 1) + '</td><td>' +
                '<a href="' + obj[i].url + '" target="_blank">' +
                obj[i].id + '</a></td></tr>';
        }
        html += '</table>';

        document.getElementById(elementId).innerHTML = html;
    }
}