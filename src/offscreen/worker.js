import {infoLog,debugLog} from "../log";
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import {WORKER_ACTION_INIT,WORKER_ACTION_QUERY} from "../common";
debugLog("worker ready");

var db;

const ACTION_FUNCTION = new Map();
ACTION_FUNCTION.set(WORKER_ACTION_INIT,function(message){
  debugLog('Loading and initializing sqlite3 module...');
  sqlite3InitModule({
    print: debugLog,
    printErr: infoLog,
  }).then(function (sqlite3) {
    debugLog('Done initializing. Running demo...');
    try {
      init(sqlite3);
      postSuccessMessage(message);
    } catch (e) {
      postErrorMessage(message,"init sqlite3 error : "+e.message);
    }
  });
});
ACTION_FUNCTION.set(WORKER_ACTION_QUERY,function(message){
  query(message);
});

onmessage = function(e) {
  var message = e.data;
  debugLog("[worker][receive][offscreen -> worker] message = "+JSON.stringify(message));
  var action = message.action;
  debugLog("[worker] invoke action = "+action);
  ACTION_FUNCTION.get(action)(message);
};

function postSuccessMessage(message,data){
  var resultMessage = JSON.parse(JSON.stringify(message));
  resultMessage.data = data;
  postMessage({
      type: "db",
      data: resultMessage
  });
  debugLog("[worker][send][worker -> offscreen] message = "+JSON.stringify(resultMessage));
}

function postErrorMessage(message,error){
  infoLog(error);
  var resultMessage = JSON.parse(JSON.stringify(message));
  debugLog(resultMessage);
  resultMessage.error = error;
  postMessage({
      type: "db",
      data: resultMessage
  });
  debugLog("[worker][send][worker -> offscreen] message = "+JSON.stringify(resultMessage));
}

const init = function (sqlite3) {
  const capi = sqlite3.capi; // C-style API
  const oo = sqlite3.oo1; // High-level OO API
  debugLog('SQLite3 version', capi.sqlite3_libversion(), capi.sqlite3_sourceid());
  
  if ('OpfsDb' in oo) {
    db = new oo.OpfsDb('/mydb.sqlite3');
    debugLog('The OPFS is available.');
    debugLog('Persisted db =', db.filename);
  } else {
    db = new oo.DB('/mydb.sqlite3', 'ct');
    debugLog('The OPFS is not available.');
    debugLog('transient db =', db.filename);
  }

  try {
    debugLog('Create a table...');
    db.exec('CREATE TABLE IF NOT EXISTS t(a,b)');
    debugLog('Insert some data using exec()...');
    let i;
    for (i = 20; i <= 25; ++i) {
      db.exec({
        sql: 'INSERT INTO t(a,b) VALUES (?,?)',
        bind: [i, i * 2],
      });
    }
    
  } finally {
    // db.close();
  }
};

const query = function(message){
  try{
    var rows = [];
    db.exec({
      sql: 'SELECT a FROM t ORDER BY a',
      rowMode: 'object', // 'array' (default), 'object', or 'stmt'
      resultRows: rows,
    });
    postSuccessMessage(message,rows);
  }catch(e){
    postErrorMessage(message,"init sqlite3 error : "+e.message);
  }
}