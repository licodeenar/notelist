function getNoteList() {
    const resultDispId = 'note_result';
    const api_key = 'AKfycbzD9GY5JET1LchxzltNMPbxr5BvVqUW_8pesu7KLnhCF5WMDqvFwrT19v3lglE1Yk0';
    let req = new XMLHttpRequest();
    let form = document.getElementById('setting');
    let url = 'https://script.google.com/macros/s/' + api_key + '/exec';
    let param = '' +
        'id=' + form.note_id.value +
        '&pass=' + form.note_pass.value +
        '&session=' + form.note_session.value +
        '&key=' + form.note_key.value;
    let isJson = form.note_json.checked;

    //テーブルをクリア＆フォームをロック
    document.getElementById(resultDispId).innerHTML = 'しばらく時間がかかります。。。';
    setFormDisabled(true);

    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            //ロックを解除
            setFormDisabled(false);
            if (req.status == 200) {
                //結果を出力
                drawTable(req.responseText, resultDispId, isJson);
            } else {
                drawTable('', resultDispId, isJson);
            }
        }
    };
    req.send(param);
}

function setFormDisabled(lock) {
    document.getElementById('note_exe').disabled = lock;
    document.getElementById('note_id').disabled = lock;
    document.getElementById('note_pass').disabled = lock;
    document.getElementById('note_session').disabled = lock;
}

function drawTable(jasons, elementId, isJson) {
    let obj;
    let html = '';

    if (jasons === '') {
        document.getElementById(elementId).innerHTML = '情報を取得できませんでした。';
        // 終了
        return;
    } else {
        obj = JSON.parse(jasons);

        //エラーチェック
        if (obj.code === 'error') {
            if (obj.message === 'login_error') {
                document.getElementById(elementId).innerHTML = 'ログインに失敗しました。';
            } else if (obj.message === 'parameter_error') {
                document.getElementById(elementId).innerHTML = '入力が正しくありません。';
            } else {
                document.getElementById(elementId).innerHTML = 'エラーが発生しました。しばらくしてからやり直してみてください。';
            }
            // 終了
            return;
        }

        // JSONの中身を表示
        if (isJson) {
            // JSONのまま表示
            document.getElementById(elementId).innerHTML = '<span class="note_data_json">' + jasons + '</span>';
        } else {
            //obj = JSON.parse(jasons);
            html = '<table class="note_list"><tr><th>#</th><th>ID / なまえ</th><th>*</th></tr>'
            for (let i = 0; i < obj.length; i++) {
                html += '<tr><td class="note_data_id">' +
                    (i + 1) + '</td><td>' +
                    '<a href="' + obj[i].url + '" target="_blank">' +
                    obj[i].urlname + '</a><br><div class="note_data_name">' +
                    obj[i].nickname + '</div></td><td class="note_follow">' +
                    getImageTag(obj[i].isFollowed) + '</td></tr>';
            }
            html += '</table>';

            document.getElementById(elementId).innerHTML = html;
        }
    }
}

function getImageTag(isFollowed) {
    let result = '';
    if (isFollowed) {
        result = '<img src="img/followed_s.png" width="32px" title="フォローされています">';
    } else {
        result = '<img src="img/not_followed_s.png" width="32px" title="フォローされていません">';
    }
    return result;
}