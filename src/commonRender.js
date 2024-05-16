import dayjs from "dayjs";
import { isOutsource } from "./data/outsource";
import { isTraining } from "./data/training";
import { convertTimeToHumanReadable } from "./utils";
import { JOB_STATUS_DESC_NEWEST, JOB_STATUS_DESC_RECRUITING } from "./common";

export function renderTimeTag(
  divElement,
  lastModifyTime,
  brandName,
  { jobStatusDesc, jobDesc }
) {
  if (jobDesc) {
    divElement.title = jobDesc;
  }
  var timeHumanReadable;
  var statusTag = null;
  //jobStatusDesc
  if (jobStatusDesc) {
    statusTag = document.createElement("span");
    var statusToTimeText = "";
    if (jobStatusDesc == JOB_STATUS_DESC_NEWEST) {
      statusToTimeText = "一周内";
    } else if (jobStatusDesc == JOB_STATUS_DESC_RECRUITING) {
      statusToTimeText = "超出一周";
    } else {
      statusToTimeText = "未知时间";
    }
    statusTag.innerHTML = "【 " + statusToTimeText + "发布❔】";
    statusTag.title =
      "当前招聘状态【" +
      jobStatusDesc.label +
      "】，招聘状态：最新：代表一周内发布；招聘中：代表发布时间超过一周";
    statusTag.classList.add("__time_tag_base_text_font");
    divElement.appendChild(statusTag);
  }
  //lastModifyTime
  var lastModifyTimeTag = document.createElement("span");
  if (jobStatusDesc) {
    //for boss
    if (lastModifyTime) {
      timeHumanReadable = convertTimeToHumanReadable(lastModifyTime);
      lastModifyTimeTag.innerHTML += "【" + timeHumanReadable + "更新详情❔】";
      lastModifyTimeTag.title =
        "招聘方登录后系统会自动修改岗位详情页的更新时间";
    } else {
      lastModifyTimeTag.innerHTML = "【" + "未找到更新时间" + "】";
    }
  } else {
    if (lastModifyTime) {
      timeHumanReadable = convertTimeToHumanReadable(lastModifyTime);
      lastModifyTimeTag.innerHTML += "【" + timeHumanReadable + "更新】";
    } else {
      lastModifyTimeTag.innerHTML = "【" + "未找到更新时间" + "】";
    }
  }
  lastModifyTimeTag.classList.add("__time_tag_base_text_font");
  divElement.appendChild(lastModifyTimeTag);
  //companyInfo
  var companyInfoTag = null;
  var companyInfoText = getCompanyInfoText(brandName);
  if (companyInfoText !== "") {
    companyInfoTag = document.createElement("span");
    companyInfoTag.innerHTML = companyInfoText;
    companyInfoTag.classList.add("__time_tag_base_text_font");
    divElement.appendChild(companyInfoTag);
  }
  //other
  divElement.style = getRenderTimeStyle(lastModifyTime);
  divElement.classList.add("__time_tag_base_text_font");
}

export function renderTimeLoadingTag(divElement, brandName) {
  var timeText = "【正查找更新时间⌛︎】";
  var text = timeText;
  text += getCompanyInfoText(brandName);
  divElement.style = getRenderTimeStyle();
  divElement.classList.add("__time_tag_base_text_font");
  divElement.innerHTML = text;
}

function getCompanyInfoText(brandName) {
  var text = "";
  const isOutsourceBrand = isOutsource(brandName);
  const isTrainingBrand = isTraining(brandName);
  if (isOutsourceBrand) {
    text += "【疑似外包公司】";
  }
  if (isTrainingBrand) {
    text += "【疑似培训机构】";
  }
  if (isOutsourceBrand || isTrainingBrand) {
    text += "⛅";
  } else {
    text += "☀";
  }
  return text;
}

function getRenderTimeStyle(lastModifyTime) {
  var offsetTimeDay;
  if (lastModifyTime) {
    offsetTimeDay = dayjs().diff(dayjs(lastModifyTime), "day");
  } else {
    lastModifyTime = -1;
  }
  return (
    "background-color: " + getTimeColorByoffsetTimeDay(offsetTimeDay) + ";"
  );
}

function getTimeColorByoffsetTimeDay(offsetTimeDay) {
  if (offsetTimeDay >= 0) {
    if (offsetTimeDay <= 7) {
      return "yellowgreen";
    } else if (offsetTimeDay <= 14) {
      return "green";
    } else if (offsetTimeDay <= 28) {
      return "orange";
    } else if (offsetTimeDay <= 56) {
      return "red";
    } else {
      return "gray";
    }
  } else {
    return "black";
  }
}

export function setupSortJobItem(node) {
  if (!node) return;
  node.style = "display:flex;flex-direction: column;";
  //for zhilian
  const paginationNode = node.querySelector(".pagination");
  if (paginationNode) {
    paginationNode.style = "order:99999;";
  }
}

export function renderSortJobItem(list, getListItem) {
  const idAndSortIndexMap = new Map();
  const sortList = JSON.parse(JSON.stringify(list)).sort((o1, o2) => {
    return (
      dayjs(
        o2.lastModifyTime
          ? o2.lastModifyTime
          : o2.updateDateTime
          ? o2.updateDateTime
          : o2.firstPublishTime
          ? o2.firstPublishTime
          : o2.createTime
      ).valueOf() -
      dayjs(
        o1.lastModifyTime
          ? o1.lastModifyTime
          : o1.updateDateTime
          ? o1.updateDateTime
          : o1.firstPublishTime
          ? o1.firstPublishTime
          : o1.createTime
      ).valueOf()
    );
  });
  sortList.sort((o1, o2) => {
    if (o2.jobStatusDesc && o1.jobStatusDesc) {
      return o1.jobStatusDesc.order - o2.jobStatusDesc.order;
    } else {
      return 0;
    }
  });
  sortList.forEach((item, index) => {
    idAndSortIndexMap.set(JSON.stringify(item), index);
  });
  list.forEach((item, index) => {
    const { itemId } = item;
    const dom = getListItem(itemId ? itemId : index);
    dom.style = "order:" + idAndSortIndexMap.get(JSON.stringify(item));
  });
}
