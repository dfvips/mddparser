let optIdOne = chrome.contextMenus.create({
		'title' : '单集下载',
		'contexts' : ['page'],
		'onclick' : downloadOne
});
let optIdMul = chrome.contextMenus.create({
		'title' : '全集下载',
		'contexts' : ['page'],
		'onclick' : downloadMul
});

let listsize=0;
let title='Default';
let arr = [];

function downloadOne(info, tab) {
	arr=[];
	listsize = 1;
	let pageid = info.pageUrl.match(/([a-f\d]{32}|[A-F\d]{32})/)[0],
	num = info.pageUrl.match(/(?<=.*?num=).*/)[0];
	title = tab.title.replace(/-.*/,'') + ' 第' + num + '集';
	if(num != undefined && typeof num != 'undefined'){
		num -= 1;
	}else{
		num = 0;
	}
	getlist(pageid,num);
}

function downloadMul(info, tab) {
	arr=[];
	let pageid = info.pageUrl.match(/([a-f\d]{32}|[A-F\d]{32})/)[0];
	title = tab.title.replace(/-.*/,'');
	getlist(pageid,null);
}

// new Date().getTime())
function getlist(pageid,num){
	let tm = new Date().getTime();
	let sign = MD5('os:Android|version:4.3.20|action:/api/vod/listVodSactions.action|time:'+tm+'|appToken:74c41b995be349dea7091d34e278110887bdd636d1f79693879296eaad6ccf8a|privateKey:e1be6b4cf4021b3d181170d1879a530a9e4130b69032144d5568abfd6cd6c1c2|data:hasIntroduction=0&vodUuid='+pageid+'&vod_type=0&');
	let data = '{"time":'+tm+',"data":{"vodUuid":"'+pageid+'","hasIntroduction":0,"vod_type":0},"appToken":"74c41b995be349dea7091d34e278110887bdd636d1f79693879296eaad6ccf8a","os":"Android","version":"4.3.20","channel":"AppStore","sign":"'+sign+'"}';
    let xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://mob.mddcloud.com.cn/api/vod/listVodSactions.action', true);
	xhr.setRequestHeader('Accept-Language', 'en-CN;q=1, zh-Hans-CN;q=0.9');
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.onload = function (e) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let d = JSON.parse(xhr.response);
			if(d.msgType==0){
				let data = d.data;
				if(num == null){
					listsize = data.length;
					for (let i = 0; i < data.length; i++) {
						getVod(data[i].uuid);
					}
				}else{
					listsize = 1;
					getVod(data[num].uuid);
				}

			}else{
				console.log('签名错误');
			}
		} else if (xhr.readyState === 4 && xhr.status !== 200) {
			console.log('未知错误');
		}
	};
	xhr.timeout = 5000; // s seconds timeout, is too long?
    xhr.ontimeout = function () { console.log('请求超时'); }
	xhr.send(data);
}


function getVod(vodId){
	let tm = new Date().getTime();
	let sign = MD5('os:Android|version:4.3.20|action:/api/vod/getSaction.action|time:'+tm+'|appToken:74c41b995be349dea7091d34e278110887bdd636d1f79693879296eaad6ccf8a|privateKey:e1be6b4cf4021b3d181170d1879a530a9e4130b69032144d5568abfd6cd6c1c2|data:action=playUrl&checkVodTicket=1&sactionUuid='+vodId+'&');
	let data = '{"time":'+tm+',"data":{"checkVodTicket":1,"action":"playUrl","sactionUuid":"'+vodId+'"},"appToken":"74c41b995be349dea7091d34e278110887bdd636d1f79693879296eaad6ccf8a","os":"Android","version":"4.3.20","channel":"AppStore","deviceNum":"FB19A023256469AABD308993243358DA","deviceType":1,"sign":"'+sign+'"}';
    let xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://mob.mddcloud.com.cn/api/vod/getSaction.action', true);
	xhr.setRequestHeader('Accept-Language', 'en-CN;q=1, zh-Hans-CN;q=0.9');
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.onload = function (e) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let d = JSON.parse(xhr.response);
			if(d.msgType==0){
				let data = d.data,
				master = replaceHost(data.masterPlaylistUrl),url,ua,name = data.name;
				console.log(data.masterPlaylistUrl,master);
				if(typeof master !== 'undefined' && master !== '') {
					url = master;
					ua = calc(master);
					index = data.num;
					callback(url,index,ua,name);
				}
			}else if(d.msgType==410){
				console.log('请升级VIP');
			}else{
				console.log('签名错误');
			}
		} else if (xhr.readyState === 4 && xhr.status !== 200) {
			console.log('未知错误');
		}
	};
	xhr.timeout = 5000; // s seconds timeout, is too long?
    xhr.ontimeout = function () { console.log('请求超时'); }
	xhr.send(data);
}

function getUrl(data){
	let arr = ['fluHls','fourHls','fhdHls','hdHls','sdHls','oriUrl','tryUrl'],
	res = '';
	for (let hls of arr) {
		let url = data[hls];
		if(typeof url != 'undefined'){
			res = replaceHost(url)
			console.log(url,res);
			break;
		}
	}
	return res;
}

function callback(url,index,ua,name){
	if(listsize!=0){
		arr[index-1] = {'url':url,'ua':ua,'name':name};
		listsize--;
		if(listsize == 0){
			let content = '';
			for (let j = 0; j < arr.length; j++) {
				let o = arr[j];
				if(typeof o != 'undefined'){
					content += `N_m3u8DL-CLI "${o.url}" --saveName "${o.name}" --headers "User-Agent:${o.ua}" --enableDelAfterDone --enableBinaryMerge ` + '\r\n';
				}
			}
			content = content.replace(/^\r\n+|\r\n+$/g,'');
			let i = new Blob([content], {
			    type: 'text/plain'
			});
			let a = URL.createObjectURL(i);
			let o = title+'.txt';
			let r = document.createElement('a');
			r.href = a;
			r.download = o;
			r.style.display = 'none';
			let d;
			if (window.MouseEvent) {
			    d = new MouseEvent('click')
			} else {
			    d = document.createEvent('MouseEvents');
			    d.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
			}
			r.dispatchEvent(d);
		}
	}
}

function replaceHost(s) {
	var regex = /(https?:\/\/)[^\/]+/g;
	return s.replace(regex, 'http://wxpcdn.mddcloud.com.cn:80');
}

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    details.requestHeaders.push({
        name:"Referer",
        value:"mdd"
    });
    details.requestHeaders.push({
        name:"Origin",
        value:"mdd"
    });
    details.requestHeaders.push({
        name:"User-Agent",
        value:"Mdd/4.3.20 (ios 15.4)"
    });
    return {
        requestHeaders: details.requestHeaders
    };
},
    {
        urls: ["http://mob.mddcloud.com.cn/*","https://mob.mddcloud.com.cn/*"]
    },
    ["blocking", "requestHeaders", "extraHeaders"]
);