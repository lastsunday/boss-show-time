import { PLATFORM_51JOB, PLATFORM_BOSS } from './common';
import { Job } from './domain/Job';
import { JobApi } from './api';
import { infoLog } from './log';

export async function saveBrowseJob(list, platform) {
  infoLog(
    'saveBrowseJob start,record size = ' +
      list.length +
      ',platform = ' +
      platform
  );
  if (PLATFORM_51JOB == platform) {
    await handle51JobData(list);
  } else if (PLATFORM_BOSS == platform) {
    await handleBossData(list);
  } else {
    //skip
  }
  infoLog('saveBrowseJob success,record size = ' + list.length);
}

export function getJobIds(list, platform) {
  var result = [];
  if (PLATFORM_51JOB == platform) {
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      const { jobId } = item;
      result.push(jobId);
    }
  } else if (PLATFORM_BOSS == platform) {
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      const { encryptId } = item.value.zpData.jobInfo;
      result.push(encryptId);
    }
  } else {
    //skip
  }
  return result;
}

async function handleBossData(list) {
  for (var i = 0; i < list.length; i++) {
    var job = new Job();
    var item = list[i];
    let zpData = item.value.zpData;
    const { brandName } = zpData.brandComInfo;
    const { name, brandName: bossBranchName, title } = zpData.bossInfo;
    const {
      encryptId,
      jobName,
      locationName,
      address,
      longitude,
      latitude,
      postDescription,
      degreeName,
      experienceName,
      salaryDesc,
    } = zpData.jobInfo;
    job.jobId = encryptId;
    job.jobPlatform = PLATFORM_BOSS;
    job.jobUrl = '';
    job.jobName = jobName;
    job.jobCompanyName = brandName;
    job.jobLocationName = locationName;
    job.jobAddress = address;
    job.jobLongitude = longitude;
    job.jobLatitude = latitude;
    job.jobDescription = postDescription;
    job.jobDegreeName = degreeName;
    job.jobYear = experienceName;
    job.jobSalaryMin = salaryDesc;
    job.jobSalaryMax = salaryDesc;
    job.jobSalaryTotalMonth = '';
    job.bossName = name;
    job.bossCompanyName = bossBranchName;
    job.bossPosition = title;
    job.dataSource = JSON.stringify(item);
    await JobApi.addOrUpdateJobBrowse(job);
  }
}

async function handle51JobData(list) {
  for (var i = 0; i < list.length; i++) {
    var job = new Job();
    var item = list[i];
    const {
      jobId,
      jobHref,
      jobName,
      fullCompanyName,
      jobAreaString,
      lat,
      lon,
      jobDescribe,
      degreeString,
      workYear,
      jobSalaryMin,
      jobSalaryMax,
      hrName,
      hrPosition,
    } = item;
    job.jobId = jobId;
    job.jobPlatform = PLATFORM_51JOB;
    job.jobUrl = jobHref;
    job.jobName = jobName;
    job.jobCompanyName = fullCompanyName;
    job.jobLocationName = jobAreaString;
    job.jobAddress = jobAreaString;
    job.jobLongitude = lon;
    job.jobLatitude = lat;
    job.jobDescription = jobDescribe;
    job.jobDegreeName = degreeString;
    job.jobYear = workYear;
    job.jobSalaryMin = jobSalaryMin;
    job.jobSalaryMax = jobSalaryMax;
    job.jobSalaryTotalMonth = '';
    job.bossName = hrName;
    job.bossCompanyName = fullCompanyName;
    job.bossPosition = hrPosition;
    job.dataSource = JSON.stringify(item);
    await JobApi.addOrUpdateJobBrowse(job);
  }
}
