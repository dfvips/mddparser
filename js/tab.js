let optIdOne = chrome.contextMenus.create({
    'title' : '单集下载',
    'contexts' : ['action', 'all', 'audio', 'browser_action', 'editable', 'frame', 'image', 'link', 'page', 'page_action', 'selection', 'video'],
    'onclick' : downloadOne
});
let optIdMul = chrome.contextMenus.create({
    'title' : '全集下载',
    'contexts' : ['action', 'all', 'audio', 'browser_action', 'editable', 'frame', 'image', 'link', 'page', 'page_action', 'selection', 'video'],
    'onclick' : downloadMul
});
let alterOne = chrome.contextMenus.create({
    'title' : '修改appToken',
    'contexts' : ['action', 'all', 'audio', 'browser_action', 'editable', 'frame', 'image', 'link', 'page', 'page_action', 'selection', 'video'],
    'onclick' : changeAppToken
});
let alterTwo = chrome.contextMenus.create({
    'title' : '修改deviceNum',
    'contexts' : ['action', 'all', 'audio', 'browser_action', 'editable', 'frame', 'image', 'link', 'page', 'page_action', 'selection', 'video'],
    'onclick' : changeDeviceNum
});
let alterThree = chrome.contextMenus.create({
    'title' : '修改appVersion',
    'contexts' : ['action', 'all', 'audio', 'browser_action', 'editable', 'frame', 'image', 'link', 'page', 'page_action', 'selection', 'video'],
    'onclick' : changeAppVersion
});