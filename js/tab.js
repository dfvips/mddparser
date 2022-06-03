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
