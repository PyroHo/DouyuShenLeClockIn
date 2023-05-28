// ==UserScript==
// @name         神乐直播间自动打卡
// @namespace    pyroho
// @version      1.3
// @description  一个简单的等待循环程序。有任何问题，欢迎反馈
// @author       PyroHo
// @match        https://www.douyu.com/*85894
// @match        https://www.douyu.com/*122402
// @match        https://www.douyu.com/*6566671
// @match        https://www.douyu.com/*20415
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @license      MIT
// ==/UserScript==
const CLOCK_IN_INTERVAL = 30 * 60 * 1000 + 10000; // 打卡间隔30分钟，单位为毫秒
const ROOM_ID = /\d+$/i.exec(window.location.href)[0]; // 通过网页地址获取房间号
const TimeSave = new Proxy({}, {
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
let timestop = ()=>{};

// 创建一个链接
function nodeLink(text, link) {
  let node = document.createElement("a");
  node.innerText = text;
  node.setAttribute('href', link);
  node.setAttribute('style', `
      display: inline-block;
      padding: 0 3px;
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
    btnNode.classList.add('btn-clock-in');
    btnNode.setAttribute('style', `
      display: inline-block;
      padding: 0 3px;
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
// 插入按钮
function insertDom() {
  const wrap = document.querySelector('div.ChatToolBar');
  const domInfo = [ ['星', '85894']
    , ['华', '122402']
    , ['粤', '6566671']
    , ['欧', '20415']
  ];
  wrap.appendChild(nodeButton('打卡', () => autoClockIn(true)));
  domInfo.map(([name, id]) => {
    if(ROOM_ID === id) return;
    wrap.appendChild(nodeLink(name, `/${id}`));
  });
}
// 可读时间
function timeStr(ms) {
  const date = new Date(ms);
  return ['getMinutes', 'getSeconds'].map(f => date[f]()).join(':');
}
// 一秒钟刷新一次时间
// 返回一个函数：调用即可停止
function loopShowTimeInElement({ele, prop, delay=0, onclose=()=>{}}) {
  const targetTime = new Date(Date.now() + delay);
  let stop;
  (function updateTime() {
    const timeobj = timeStr(targetTime - Date.now());
    ele.setAttribute(prop, `下次打卡：${timeobj}`)
    if(Date.now() > targetTime) {
      clearTimeout(stop);
      onclose();
    } else {
      stop = setTimeout(updateTime, 1000);
    }
  })();
  return () => clearTimeout(stop);
}
// 创建打卡，自带循环
function autoClockIn(force = false) {
  const textarea = document.querySelector('textarea.ChatSend-txt');
  const button = document.querySelector('div.ChatSend-button');

  const lastClockIn = parseInt(TimeSave[ROOM_ID]) || 0; // 获取上次打卡时间
  const now = Date.now(); // 获取当前时间
  const timeGoes = now - lastClockIn;
  let nextClockInDelay = CLOCK_IN_INTERVAL-timeGoes;

  timestop();
  if (force || timeGoes >= CLOCK_IN_INTERVAL) {
    const temp = textarea.value;
    // 如果上次打卡时间不存在或距离当前时间已经超过了30分钟，则进行打卡操作
    textarea.value = "#打卡";
    button.click();
    textarea.value = temp;
    TimeSave[ROOM_ID] = now; // 将本次打卡时间存储在本地存储中
    nextClockInDelay = CLOCK_IN_INTERVAL;
  }

  timestop = loopShowTimeInElement({
    ele: textarea,
    prop: 'placeholder',
    delay: nextClockInDelay,
    onclose: autoClockIn,
  });
}

setTimeout(() => {
  let beatTotal = 20; // 心跳检查次数
  while(--beatTotal) {
    setTimeout(() => {
      const winLoaded = document.readyState === 'complete';
      const eleNotLoaded = document.querySelector('.btn-clock-in') === null;
      if(winLoaded && eleNotLoaded) {
        autoClockIn();
        insertDom();
      }
    }, beatTotal*1000)
  }
}, 5000);
