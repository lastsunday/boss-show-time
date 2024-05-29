import dayjs from "dayjs";
import { isOutsource } from "./data/outsource";
import { isTraining } from "./data/training";
import {
  convertTimeToHumanReadable,
  convertTimeOffsetToHumanReadable,
} from "./utils";
import { JOB_STATUS_DESC_NEWEST } from "./common";
import EchoButton from "@0xecho/button";

export function renderTimeTag(
  divElement,
  lastModifyTime,
  brandName,
  { jobStatusDesc, jobDesc, firstPublishTime, jobDTO }
) {
  var statusTag = null;
  //jobStatusDesc
  if (jobStatusDesc) {
    statusTag = document.createElement("span");
    var statusToTimeText = "";
    if (jobStatusDesc == JOB_STATUS_DESC_NEWEST) {
      statusToTimeText = "一周内";
      statusTag.innerHTML = "【 " + statusToTimeText + "发布❔】";
      statusTag.title =
        "当前招聘状态【" +
        jobStatusDesc.label +
        "】，招聘状态：最新：代表一周内发布；招聘中：代表发布时间超过一周";
      statusTag.classList.add("__time_tag_base_text_font");
      divElement.appendChild(statusTag);
    }
  }
  //firstPublishTime
  if (firstPublishTime) {
    var firstPublishTimeTag = document.createElement("span");
    var firstPublishTimeHumanReadable = convertTimeToHumanReadable(
      firstPublishTime
    );
    firstPublishTimeTag.innerHTML +=
      "【" + firstPublishTimeHumanReadable + "发布】";
    firstPublishTimeTag.classList.add("__time_tag_base_text_font");
    divElement.appendChild(firstPublishTimeTag);
  }
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
  divElement.style = getRenderTimeStyle(
    firstPublishTime ?? null,
    jobStatusDesc
  );
  if (jobDTO) {
    var firstBrowseTimeTag = document.createElement("div");
    var firstBrowseTimeHumanReadable = convertTimeOffsetToHumanReadable(
      jobDTO.createDatetime
    );
    firstBrowseTimeTag.innerHTML +=
      "【" +
      firstBrowseTimeHumanReadable +
      "看过(共" +
      jobDTO.browseCount +
      "次)】";
    firstBrowseTimeTag.classList.add("__time_tag_base_text_font");
    divElement.appendChild(firstBrowseTimeTag);
  }
  divElement.classList.add("__time_tag_base_text_font");
  let jobId = jobDTO.jobId;
  let commentWrapperDiv = document.createElement("div");
  commentWrapperDiv.id = "wrapper" + jobId;
  let commentDiv = document.createElement("div");
  commentDiv.id = jobId;
  commentWrapperDiv.appendChild(commentDiv);
  divElement.appendChild(commentWrapperDiv);
}

export function finalRender(jobDTOList) {
  for (let i = 0; i < jobDTOList.length; i++) {
    let item = jobDTOList[i];
    let jobId = item.jobId;
    let commentWrapperDiv = document.getElementById("wrapper" + jobId);
    commentWrapperDiv.style = "display: flex;justify-content: end;color:white;";
    const likeTitleDiv = document.createElement("div");
    likeTitleDiv.innerHTML = "点赞数"
    likeTitleDiv.style = "color:white;";
    let commentJobDiv = document.getElementById(jobId);

    commentWrapperDiv.insertBefore(likeTitleDiv,commentJobDiv);

    const echo = new EchoButton({
      targetUri: jobId, // commenting target, required
      alwaysShowPopover: false, // whether always show popover, default: false
      partnerName: "boss-show-time", // if specified, partner name will be shown on popover
      numberType: "count", // button display number type, power(default) or count,
      theme: "light", // dark or light(default)
    }).mount(commentJobDiv);
    const dialogDiv = document.createElement("div");
    dialogDiv.style =
      "position: absolute;background-color: white;z-index: 9999;color: black;padding: 6px;border-radius: 10px;box-shadow: 0 2px 10px rgba(0, 0, 0, .08);";

    const menuDiv = document.createElement("div");
    menuDiv.style = "display: flex;justify-content: end;}";

    const maximizeDiv = document.createElement("div");
    maximizeDiv.style = "font-size: 20px;padding: 5px;";
    maximizeDiv.innerHTML = "⬜";
    menuDiv.appendChild(maximizeDiv);

    const closeDiv = document.createElement("div");
    closeDiv.style = "font-size: 20px;padding: 5px;";
    closeDiv.innerHTML = "✖️";
    closeDiv.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      commentWrapperDiv.removeChild(dialogDiv);
    });
    menuDiv.appendChild(closeDiv);

    dialogDiv.append(menuDiv);
    const titleDiv = document.createElement("div");
    titleDiv.style = "font-size: 15px;text-align: left;padding: 5px;";
    titleDiv.innerHTML = item.jobName + "-" + item.jobCompanyName;
    dialogDiv.appendChild(titleDiv);

    const commentIframe = document.createElement("iframe");
    commentIframe.src =
      "https://widget.0xecho.com/?color-theme=light&desc=&has-h-padding=true&has-v-padding=true&modules=comment%2Clike%2Cdislike&receiver=&target_uri=" +
      jobId +
      "&height=800&display=iframe";
    commentIframe.width = 400;
    commentIframe.height = 400;
    commentIframe.style = "border: none;";
    dialogDiv.appendChild(commentIframe);

    let maximize = false;
    const maximizeFunction = (event) => {
      event.preventDefault();
      event.stopPropagation();
      maximize = !maximize;
      if (maximize) {
        commentIframe.width = 800;
        commentIframe.height = 800;
      } else {
        commentIframe.width = 400;
        commentIframe.height = 400;
      }
    };
    maximizeDiv.addEventListener("click", maximizeFunction);
    menuDiv.addEventListener("dblclick", maximizeFunction);

    const copmmentButtonDiv = document.createElement("div");
    copmmentButtonDiv.innerHTML = "查看评论💬";
    copmmentButtonDiv.style = "cursor: pointer;margin-left: 5px;text-decoration: underline;color:white; ";
    commentWrapperDiv.appendChild(copmmentButtonDiv);

    copmmentButtonDiv.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      commentWrapperDiv.appendChild(dialogDiv);
    });
  }
}

export function createLoadingDOM(brandName, styleClass) {
  const div = document.createElement("div");
  div.classList.add(styleClass);
  div.classList.add("__loading_tag");
  renderTimeLoadingTag(div, brandName);
  return div;
}

export function hiddenLoadingDOM() {
  var loadingTagList = document.querySelectorAll(".__loading_tag");
  if (loadingTagList) {
    loadingTagList.forEach((item) => {
      item.style = "visibility: hidden;";
    });
  }
}

export function renderTimeLoadingTag(divElement, brandName) {
  var timeText = "【正查找发布时间⌛︎】";
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

function getRenderTimeStyle(lastModifyTime, jobStatusDesc) {
  if (jobStatusDesc) {
    var offsetTimeDay;
    if (JOB_STATUS_DESC_NEWEST == jobStatusDesc) {
      offsetTimeDay = 7; // actual <7
    } else {
      offsetTimeDay = -1;
    }
  } else {
    if (lastModifyTime) {
      offsetTimeDay = dayjs().diff(dayjs(lastModifyTime), "day");
    } else {
      lastModifyTime = -1;
    }
  }
  return (
    "background-color: " + getTimeColorByOffsetTimeDay(offsetTimeDay) + ";"
  );
}

function getTimeColorByOffsetTimeDay(offsetTimeDay) {
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
  //sort updatetime
  const sortList = JSON.parse(JSON.stringify(list)).sort((o1, o2) => {
    return (
      dayjs(
        o2.lastModifyTime ??
          o2.lastModifyTime ??
          o2.updateDateTime ??
          o2.publishTime ??
          null
      ).valueOf() -
      dayjs(
        o1.lastModifyTime ??
          o1.lastModifyTime ??
          o1.updateDateTime ??
          o1.publishTime ??
          null
      ).valueOf()
    );
  });
  //sort firstBrowseDatetime
  sortList.sort((o1, o2) => {
    return (
      dayjs(o2.firstBrowseDatetime ?? null).valueOf() -
      dayjs(o1.firstBrowseDatetime ?? null).valueOf()
    );
  });
  //sort firstPublishTime
  sortList.sort((o1, o2) => {
    return (
      dayjs(
        o2.confirmDateString ?? o2.firstPublishTime ?? o2.createTime ?? null
      ).valueOf() -
      dayjs(
        o1.confirmDateString ?? o1.firstPublishTime ?? o1.createTime ?? null
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
