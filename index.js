// ==UserScript==
// @name         神乐直播间自动打卡
// @namespace    pyroho
// @version      0.4
// @description  一个简单的等待循环程序。
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

// 创建一个链接
function nodeLink(text, link) {
  let node = document.createElement("a");
  node.innerText = text;
  node.setAttribute('href', link);
  node.setAttribute('style', `
      display: inline-block;
      padding: 3px;
      margin-right: 8px;
      vertical-align: middle;
      color: #fff;
      border-radius: 3px;
      background-color: #888;
      line-height: 1.5;
      font-size: 12px;
      cursor: pointer;
    `);
  return node;
}
// 创建一个按钮节点
function nodeButton(text, onclick) {
    let btnNode = document.createElement("button");
    btnNode.addEventListener('click', onclick, false);
    btnNode.innerText = text;
    btnNode.setAttribute('style', `
      display: inline-block;
      padding: 3px;
      border-radius: 3px;
      margin-right: 8px;
      vertical-align: middle;
      color: #fff;
      background-color: #4caf50;
      line-height: 1.5;
      font-size: 12px;
      cursor: pointer;
    `);
    return btnNode;
}
// 转化时间戳为可读时间
function dateToStr(ms) {
  const date = new Date(ms);
  return ['getMonth', 'getDate', 'getHours', 'getMinutes'].map((f, i) => {
    return date[f]() + (f==='getMonth' ? 1:0) + ['月','日','时','分'][i];
  }).join('');
}
// 创建打卡循环
function autoClockIn(force = false) {
  const textarea = document.querySelector('textarea.ChatSend-txt');
  const button = document.querySelector('div.ChatSend-button');

  const clockInTime = parseInt(timesave[roomId]) || 0; // 获取上次打卡时间
  const currentTime = new Date().getTime(); // 获取当前时间
  const timeGoes = currentTime - clockInTime;
  textarea.setAttribute('placeholder', `上次自动打卡：${ dateToStr(clockInTime) }`);

  clearTimeout(timestop);
  if (force || timeGoes >= clockInInterval) {
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
  if(document.readyState !== 'complete'){ return; }
  console.log("document ready!!", document.readyState);
  timestop = setTimeout(() => {
    autoClockIn();
    const wrap = document.querySelector('div.ChatToolBar');
    wrap.appendChild(nodeButton('打卡', () => {
      autoClockIn(true); // true 强制打卡
    }));
    [['星','85894']
    ,['华','122402']
    ,['粤','6566671']
    ,['欧','20415']
    ].map(([text, link]) => {
      if(roomId === link) return;
      wrap.appendChild(nodeLink(text, link));
    });
  }, 5000);
}, false);



console.log("ClockIn script execing");