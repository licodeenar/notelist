'use strict';
// --------------------------------------------------
// fetchALLで非同期で処理を行う
// フォローしているユーザのリストを取得する
function main(userId, key) {
  let users = [];

  fetch_repeat:
  for(let repeat = 0; repeat < CONF.MAX_REPEAT; repeat++){
    let requests = [];

    // リクエストを生成
    const start = repeat * CONF.FETCH_MAX + 1;
    const end = start + CONF.FETCH_MAX;
    for(let i = start; i <= end; i++){
      requests.push(CONF.API_URL
        .replace('#__userid__#', userId)
        .replace('#__key__#', key) + i);
    }

    // 非同期でまとめて取得
    const responses = UrlFetchApp.fetchAll(requests);

    for(let i = 0; i < CONF.FETCH_MAX; i++){
      const json_data = JSON.parse(responses[i].getContentText('UTF-8'))['data'];

      // ユーザ情報を抽出
      users = users.concat(getFollowList(json_data));

      // 最後のページだったら終了
      if(json_data.isLastPage === true){
        break fetch_repeat;
      }
    }
  }

  // 実行ログにユーザ名を表示 Debug
  // printLog(users);

  return users;
}

// --------------------------------------------------
// フォローリストAPIの結果からユーザー情報を抽出
function getFollowList(json){
  const list = json['follows'];
  let result = [];

  for(let i = 0; i < list.length; i++){
    
    let userURL = '';
    let userName = '';
    if(list[i].urlname === null){
      // ゲストユーザ
      userURL = 'https://note.com/_nourlname/?user_id=' + list[i].id;
      userName = 'GUEST';
    }
    else if(list[i].customDomain === null){
      // 通常ユーザ
      userURL = 'https://note.com/' + list[i].urlname;
      userName = list[i].urlname;

    }
    else{
      // カスタムドメインユーザ
      userURL = 'https://' + list[i].customDomain.host;
      userName = list[i].urlname;
    }

    // JSONに変換
    result.push({
      urlname: userName,
      nickname: list[i].nickname,
      url: userURL,
      id: list[i].id
    });
  }
  return result;
}

// --------------------------------------------------
// 実行ログにユーザ名を出力する Debug用
function printLog(users){
  for(let i = 0; i < users.length; i++){
    console.log('ユーザ名（' + (i + 1) + '）： ' + 
      users[i].nickname + ' ' +
      users[i].urlname + ' ' + 
      users[i].url);
  }
}
