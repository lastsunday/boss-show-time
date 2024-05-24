import { infoLog, debugLog } from '../log';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { Job } from '../domain/Job';
import { Message } from '../api/bridge';
import dayjs from 'dayjs';
import { JobDTO } from '../dto/jobDTO';
import { toHump } from '../utils';
debugLog('worker ready');

var db;

export const WorkerBridge = {
  /**
   *
   * @param {*} message
   * @param {*} param
   */
  init: function (message, param) {
    debugLog('Loading and initializing sqlite3 module...');
    sqlite3InitModule({
      print: debugLog,
      printErr: infoLog,
    }).then(function (sqlite3) {
      debugLog('Done initializing. Running demo...');
      try {
        initDb(sqlite3);
        postSuccessMessage(message);
      } catch (e) {
        postErrorMessage(message, 'init sqlite3 error : ' + e.message);
      }
    });
  },
  ping: function (message, param) {
    postSuccessMessage(message, 'pong');
  },
  /**
   *
   * @param {Message} message
   * @param {Job} param
   */
  addOrUpdateJobBrowse: function (message, param) {
    try {
      const now = new Date();
      const SQL_JOB_BY_ID = `SELECT job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,boss_name,boss_company_name,boss_position,data_source,create_datetime,update_datetime FROM job WHERE job_id = ?`;
      var rows = [];
      db.exec({
        sql: 'BEGIN TRANSACTION',
      });
      db.exec({
        sql: SQL_JOB_BY_ID,
        rowMode: 'object', // 'array' (default), 'object', or 'stmt'
        bind: [param.jobId],
        resultRows: rows,
      });
      if (rows.length > 0) {
        //skip
      } else {
        const SQL_INSERT_JOB = `
      INSERT INTO job (job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,boss_name,boss_company_name,boss_position,data_source,create_datetime,update_datetime) VALUES ($job_id,$job_platform,$job_url,$job_name,$job_company_name,$job_location_name,$job_address,$job_longitude,$job_latitude,$job_description,$job_degree_name,$job_year,$job_salary_min,$job_salary_max,$job_salary_total_month,$boss_name,$boss_company_name,$boss_position,$data_source,$create_datetime,$update_datetime)
    `;
        db.exec({
          sql: SQL_INSERT_JOB,
          bind: {
            $job_id: param.jobId,
            $job_platform: param.jobPlatform,
            $job_url: param.jobUrl,
            $job_name: param.jobName,
            $job_company_name: param.jobCompanyName,
            $job_location_name: param.jobLocationName,
            $job_address: param.jobAddress,
            $job_longitude: param.jobLongitude,
            $job_latitude: param.jobLatitude,
            $job_description: param.jobDescription,
            $job_degree_name: param.jobDegreeName,
            $job_year: param.jobYear,
            $job_salary_min: param.jobSalaryMin,
            $job_salary_max: param.jobSalaryMax,
            $job_salary_total_month: param.jobSalaryTotal,
            $boss_name: param.bossName,
            $boss_company_name: param.bossCompanyName,
            $boss_position: param.bossPosition,
            $data_source: param.dataSource,
            $create_datetime: dayjs(now).format('YYYY-MM-DD HH:mm:ss'),
            $update_datetime: dayjs(now).format('YYYY-MM-DD HH:mm:ss'),
          },
        });
      }
      const SQL_INSERT_JOB_BROWSE_HISTORY = `
    INSERT INTO job_browse_history (job_id,job_visit_datetime,job_visit_type) VALUES ($job_id,$job_visit_datetime,$job_visit_type)
  `;
      db.exec({
        sql: SQL_INSERT_JOB_BROWSE_HISTORY,
        bind: {
          $job_id: param.jobId,
          $job_visit_datetime: dayjs(now).format('YYYY-MM-DD HH:mm:ss'),
          $job_visit_type: 'SEARCH',
        },
      });
      db.exec({
        sql: 'COMMIT',
      });
      postSuccessMessage(message, {});
    } catch (e) {
      postErrorMessage(
        message,
        '[worker] addOrUpdateJobBrowse error : ' + e.message
      );
    }
  },

  /**
   *
   * @param {*} message
   * @param {string[]} param
   *
   * @returns JobDTO[]
   */
  getJobBrowseInfoByIds: function (message, param) {
    try {
      var countMap = new Map();
      var ids = "'" + param.join("','") + "'";
      const SQL_QUERY_JOB_BOWSE_HISTORY_GROUP_COUNT =
        'SELECT job_id AS jobId ,count(*) AS total FROM job_browse_history WHERE job_id IN (' +
        ids +
        ') GROUP BY job_id;';
      var countRows = [];
      db.exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_GROUP_COUNT,
        rowMode: 'object', // 'array' (default), 'object', or 'stmt'
        resultRows: countRows,
      });
      for (let i = 0; i < countRows.length; i++) {
        let item = countRows[i];
        countMap.set(item.jobId, item.total);
      }
      var tempResultMap = new Map();
      const SQL_QUERY_JOB =
        'SELECT job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,boss_name,boss_company_name,boss_position,data_source,create_datetime,update_datetime FROM job WHERE job_id in (' +
        ids +
        ')';
      var rows = [];
      db.exec({
        sql: SQL_QUERY_JOB,
        rowMode: 'object', // 'array' (default), 'object', or 'stmt'
        resultRows: rows,
      });
      for (var i = 0; i < rows.length; i++) {
        var item = rows[i];
        var resultItem = new JobDTO();
        var keys = Object.keys(item);
        for (let n = 0; n < keys.length; n++) {
          var key = keys[n];
          resultItem[toHump(key)] = item[key];
        }
        tempResultMap.set(resultItem.jobId, resultItem);
      }
      let result = [];
      for (let j = 0; j < param.length; j++) {
        let jobId = param[j];
        let target = tempResultMap.get(jobId);
        target.browseCount = countMap.get(jobId);
        result.push(target);
      }
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        '[worker] getJobBrowseInfoByIds error : ' + e.message
      );
    }
  },
};

const ACTION_FUNCTION = new Map();
var keys = Object.keys(WorkerBridge);
for (var i = 0; i < keys.length; i++) {
  var key = keys[i];
  ACTION_FUNCTION.set(key, WorkerBridge[key]);
}

const SQL_CREATE_TABLE_JOB = `
  CREATE TABLE IF NOT EXISTS job(
    job_id TEXT PRIMARY KEY,
    job_platform TEXT,
    job_url TEXT, 
    job_name TEXT,
    job_company_name TEXT,
    job_location_name TEXT,
    job_address TEXT,
    job_longitude NUMERIC,
    job_latitude NUMERIC,
    job_description TEXT,
    job_degree_name TEXT,
    job_year TEXT,
    job_salary_min TEXT,
    job_salary_max TEXT,
    job_salary_total_month TEXT,
    boss_name TEXT,
    boss_company_name  TEXT,
    boss_position TEXT,
    data_source TEXT,
    create_datetime DATETIME,
    update_datetime DATETIME
  )
  `;

const SQL_CREATE_TABLE_JOB_BROWSE_HISTORY = `
  CREATE TABLE IF NOT EXISTS job_browse_history(
    job_id TEXT,
    job_visit_datetime DATETIME,
    job_visit_type TEXT
  )
  `;

const initDb = function (sqlite3) {
  const capi = sqlite3.capi; // C-style API
  const oo = sqlite3.oo1; // High-level OO API
  debugLog(
    'SQLite3 version',
    capi.sqlite3_libversion(),
    capi.sqlite3_sourceid()
  );

  if ('OpfsDb' in oo) {
    db = new oo.OpfsDb('/job.sqlite3');
    debugLog('The OPFS is available.');
    debugLog('Persisted db =', db.filename);
  } else {
    db = new oo.DB('/job.sqlite3', 'ct');
    debugLog('The OPFS is not available.');
    debugLog('transient db =', db.filename);
  }

  //TODO add sql version auto update
  db.exec({
    sql: 'BEGIN TRANSACTION',
  });
  db.exec(SQL_CREATE_TABLE_JOB);
  db.exec(SQL_CREATE_TABLE_JOB_BROWSE_HISTORY);
  db.exec({
    sql: 'COMMIT',
  });
};

onmessage = function (e) {
  var message = e.data;
  debugLog(
    '[worker][receive][offscreen -> worker] message = ' +
      JSON.stringify(message)
  );
  var action = message.action;
  debugLog('[worker] invoke action = ' + action);
  ACTION_FUNCTION.get(action)(message, message.param);
};

function postSuccessMessage(message, data) {
  var resultMessage = JSON.parse(JSON.stringify(message));
  resultMessage.data = data;
  postMessage({
    type: 'db',
    data: resultMessage,
  });
  debugLog(
    '[worker][send][worker -> offscreen] message = ' +
      JSON.stringify(resultMessage)
  );
}

function postErrorMessage(message, error) {
  infoLog(error);
  var resultMessage = JSON.parse(JSON.stringify(message));
  debugLog(resultMessage);
  resultMessage.error = error;
  postMessage({
    type: 'db',
    data: resultMessage,
  });
  debugLog(
    '[worker][send][worker -> offscreen] message = ' +
      JSON.stringify(resultMessage)
  );
}
