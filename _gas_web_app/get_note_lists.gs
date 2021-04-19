// Parser ライブラリ追加 スクリプトID
// 1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw

const MAX_FWING = 100; //読み込むMAXページ数
const MAX_FWER = 20; //読み込むMAXページ数
const FETCH_MAX = 10; // fetchAll() で一度にフェッチするページ数
const KEY_FOLLOWER = 'followers';
const KEY_FOLLOWING = 'followings';

function debug2(){
  try{
    getIDs_json_fetchAll('xxxxxxxx', 'followers');
  }catch(e){
    console.log(e);
  }
}

// --------------------------------------------------
// fetchALLで非同期で処理を行う版
// フォロー・フォロワーのユーザIDを取得する （Parser ライブラリを使用）
function getIDs_json_fetchAll(userId, key) {
  let noteURL = 'https://note.com/' + userId + '/' + key + '?page=';
  let max;
  let jasons = [];

  // フォロワーとフォローでMAX値を変える
  if(key === KEY_FOLLOWING){
    max = MAX_FWING / FETCH_MAX;
  }else{
    max = MAX_FWER / FETCH_MAX;
  }

  // Nページ毎にまとめてフェッチ
  for(let repeat = 0; repeat < max; repeat++){
    let start = repeat * FETCH_MAX;
    let end = start + FETCH_MAX;
    let requests;
    let parser;
    let parserName;
    let htmls;

    requests = [];
    for(let i = start + 1; i <= end; i++){
      requests.push(noteURL + i);
    }

    // 非同期でN数のページを取得
    htmls = UrlFetchApp.fetchAll(requests);

    htmlAll = '';
    for(let i = 0; i < FETCH_MAX; i++){
      htmlAll += htmls[i].getContentText('UTF-8');
    }

    parser = Parser.data(htmlAll)
      .from('<div class="m-userListItem" data-v-7b393662 data-v-7cfdcb31><a href="')
      .to('" ')
      .iterate();

    parserName = Parser.data(htmlAll)
      .from('data-v-7b393662>\n        ')
      .to('\n')
      .iterate();
    
    if(parser.length <= 1 && parser[0].length > 100){
      // 要素がない場合は終了
      // ※ Parserの不具合？取得要素がない場合に
      //　　htmlがそのまま返ってくることがある
      //　　length > 100 で回避；
      break;
    }

    // 取得した行からUserIDのみを抽出する
    for (let i = 0; i < parser.length; i++) {
      let tmp = parser[i]
        .replace(/^\//, '')
        .replace(/https:\/\/note.com\//,''); //ゲストユーザ用

      let tmpURL;
      if(tmp.substr(0, 4) === 'http'){
        // 個別ドメインの場合そのまま
        tmpURL = tmp;
      }else{
        // noteユーザの場合 https://note.com を追加
        tmpURL = 'https://note.com/' + tmp;
      }
      // JSONに書き出し
      jasons.push({id: tmp, url: tmpURL, name: parserName[i]});
      // console.log({id: tmp, url: tmpURL, name: parserName[i]});
      
    }

    if(jasons.length < ((repeat + 1) * FETCH_MAX * 20)){
      // 要素がなくなったら次のループに行かずに終了
      break;
    }
  }

  console.log(JSON.stringify(jasons));
  return jasons;
}




// 旧バージョン --------------------------------------------------
// fetchで1ページ毎に処理を行う版
// フォロー・フォロワーのユーザIDを取得する（Parser ライブラリを使用）
function getIDs_json(userId, key, sheetName) {
  let noteURL = 'https://note.com/' + userId + '/' + key + '?page=';
  let html;
  let parser;
  let max;
  let jasons = [];

  // フォロワーとフォローでMAX値を変える
  if(sheetName === SHEET_NAME_FOLLOWING){
    max = MAX_FWING;
  }else{
    max = MAX_FWER;
  }

  // ページ毎に行をフェッチ
  for(let page = 1; page <= max; page++){
    // 以下のキーワードを含む行を全て取得する
    html = UrlFetchApp.fetch(noteURL + page).getContentText('UTF-8');
    parser = Parser.data(html)
      .from('<div class="m-userListItem" data-v-7b393662 data-v-7cfdcb31><a href="')
      .to('" ')
      .iterate();
    
    if(parser.length <= 1 && parser[0].length > 100){
      // ページに要素がなくなったら終了
      break;
    }

    // 取得した行からUserIDのみを抽出する
    for (let i = 0; i < parser.length; i++) {
      let tmp = parser[i]
        .replace(/https:\/\/note.com/,''); //ゲストユーザ用

      let tmpURL;
      if(tmp.substr(0, 4) === 'http'){
        // 個別ドメインの場合そのまま
        tmpURL = tmp;
      }else{
        // noteユーザの場合 https://note.com を追加
        tmpURL = 'https://note.com' + tmp;
      }
      
      // JSONに書き出し
      jasons.push({id: tmp, url: tmpURL});
      
    }
    // アクセス集中を防ぐためウェイト
    Utilities.sleep(WAIT_SEC * 1000);
  }

  return jasons;
}
