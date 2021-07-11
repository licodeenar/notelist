// --------------------------------------------------
// グローバル定数の定義
const CONF = function (){
  return {
    MAX_REPEAT: 10,//fetchAll()を繰り返すMAX数
    FETCH_MAX: 10,  // fetchAll() で一度にフェッチするページ数
    API_URL: 'https://note.com/api/v2/creators/#__userid__#/#__key__#?per=20&page='
  }
}();
