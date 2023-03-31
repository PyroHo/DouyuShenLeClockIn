// ==UserScript==
// @name         神乐直播间自动打卡
// @namespace    pyroho
// @version      0.3
// @description  只是一个简单的等待循环程序。初次安装的时候如果已经打卡，时间可能会对不上，下次就好了。
// @author       PyroHo
// @match        https://www.douyu.com/85894
// @match        https://www.douyu.com/122402
// @match        https://www.douyu.com/6566671
// @match        https://www.douyu.com/20415
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @license      MIT
// @grant        unsafeWindow
// ==/UserScript==
const clockInInterval = 30 * 60 * 1000 + 10000; // 打卡间隔30分钟，单位为毫秒
const roomId = /\d+$/i.exec(window.location.href)[0]; // 通过网页地址获取房间号
const timesave = new Proxy({}, {
  get(target, prop, receiver) {
    return localStorage.getItem(`lastClockInTime${prop}`);
  },
  set(target, prop, value, receiver) {
    localStorage.setItem(`lastClockInTime${prop}`, value);
  },
  deleteProperty(target, key) {
    localStorage.removeItem(`lastClockInTime${key}`);
  },
});
let timestop;

function dateToStr(ms) {
  const date = new Date(ms);
  return ['getMonth', 'getDate', 'getHours', 'getMinutes'].map((f, i) => {
    return date[f]() + (f==='getMonth' ? 1:0) + ['月','日','时','分'][i];
  }).join('');
}
function autoClockIn() {
  const textarea = document.querySelector('textarea.ChatSend-txt');
  const button = document.querySelector('div.ChatSend-button');

  const clockInTime = parseInt(timesave[roomId]) || 0; // 获取上次打卡时间
  const currentTime = new Date().getTime(); // 获取当前时间
  const timeGoes = currentTime - clockInTime;
  textarea.setAttribute('placeholder', `上次自动打卡：${ dateToStr(clockInTime) }`);

  clearTimeout(timestop);
  if (timeGoes >= clockInInterval) {
    let tempVal = textarea.value;
    // 如果上次打卡时间不存在或距离当前时间已经超过了30分钟，则进行打卡操作
    textarea.value = "#打卡";
    button.click();
    textarea.value = tempVal;
    textarea.setAttribute('placeholder', `上次自动打卡：${ dateToStr(currentTime) }`);
    timesave[roomId] = currentTime; // 将本次打卡时间存储在本地存储中
    timestop = setTimeout(autoClockIn, clockInInterval);
    console.log("#打卡");
  } else {
    timestop = setTimeout(autoClockIn, clockInInterval - timeGoes);
    console.log("没到打卡时间");
  }
}

document.addEventListener('readystatechange', function() {
  if(document.readyState !== 'complete'){
    console.log("document not ready!!", document.readyState);
    return;
  }
  console.log("document ready!!", document.readyState);
  timestop = setTimeout(autoClockIn, 5 * 1000);
}, false);

console.log("ClockIn script execing");




