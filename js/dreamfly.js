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

let listsize=0,title='Default',arr = [],dl,isbreak = false,mode = 0;

function downloadOne(info, tab,flag) {
dl = flag;
mode = 0;
checkUrl(info.pageUrl,function(b){
	if(b){
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
	}else {
		alert('请在埋堆堆播放页面使用本插件！')
	}
})
}

function downloadMul(info, tab) {
dl = false;
mode = 1;
checkUrl(info.pageUrl,function(b){
	if(b){
		arr=[];
		let pageid = info.pageUrl.match(/([a-f\d]{32}|[A-F\d]{32})/)[0];
		title = tab.title.replace(/-.*/,'');
		getlist(pageid,null);
	}else {
		alert('请在埋堆堆播放页面使用本插件！')
	}
})
}

function checkUrl(url,callback){
if(url.indexOf('mddcloud.com.cn/video/') !== -1){
	callback(true);
}else{
	callback(false);
}
}

// new Date().getTime())
function getlist(pageid,num){
let tm = new Date().getTime();
let sign = MD5('os:Android|version:4.3.20|action:/api/vod/listVodSactions.action|time:'+tm+'|appToken:ee2467a3c3224108876617ca6a5a074d44719ed31e78994d1a7f37f0520da1c3|privateKey:e1be6b4cf4021b3d181170d1879a530a9e4130b69032144d5568abfd6cd6c1c2|data:hasIntroduction=0&vodUuid='+pageid+'&vod_type=0&');
let data = '{"time":'+tm+',"data":{"vodUuid":"'+pageid+'","hasIntroduction":0,"vod_type":0},"appToken":"ee2467a3c3224108876617ca6a5a074d44719ed31e78994d1a7f37f0520da1c3","os":"Android","version":"4.3.20","channel":"AppStore","sign":"'+sign+'"}';
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
				async function fn() { 
					for (let i = 0; i < data.length; i++) {
						await getVod(data[i].uuid).catch((e)=>{
							console.log(e)
						});
					}
				};
				fn();
			}else{
				listsize = 1;
				getVod(data[num].uuid).catch((e)=>{
					console.log(e)
				});
			}

		}else{
			console.log('签名错误');
		}
	} else if (xhr.readyState === 4 && xhr.status !== 200) {
		console.log('未知错误');
	}
};
xhr.timeout = 5000; // s seconds timeout, is too long?
xhr.ontimeout = function () { alert('请求超时'); }
xhr.send(data);
}


function getVod(vodId){
return new Promise(function(resolve,reject){
	let tm = new Date().getTime();
	let sign = MD5('os:Android|version:4.3.20|action:/api/vod/getSaction.action|time:'+tm+'|appToken:ee2467a3c3224108876617ca6a5a074d44719ed31e78994d1a7f37f0520da1c3|privateKey:e1be6b4cf4021b3d181170d1879a530a9e4130b69032144d5568abfd6cd6c1c2|data:action=playUrl&checkVodTicket=1&sactionUuid='+vodId+'&');
	let data = '{"time":'+tm+',"data":{"checkVodTicket":1,"action":"playUrl","sactionUuid":"'+vodId+'"},"appToken":"ee2467a3c3224108876617ca6a5a074d44719ed31e78994d1a7f37f0520da1c3","os":"Android","version":"4.3.20","channel":"AppStore","deviceNum":"6d5f00ea8ab642d4901ff3ebe14aba39","deviceType":1,"sign":"'+sign+'"}';
	let xhr = new XMLHttpRequest();
	if(!isbreak){
		xhr.open('POST', 'https://mob.mddcloud.com.cn/api/vod/getSaction.action', true);
		xhr.setRequestHeader('Accept-Language', 'en-CN;q=1, zh-Hans-CN;q=0.9');
		xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		xhr.onload = function (e) {
			if (xhr.readyState === 4 && xhr.status === 200) {
				let d = JSON.parse(xhr.response);
				if(d.msgType==0){
					let data = d.data;
					if(typeof data.masterPlaylistUrl != 'undefined') {
						let master = replaceHost(data.masterPlaylistUrl),url,ua,name = data.name;
						console.log(JSON.stringify(data));
						console.log(data.masterPlaylistUrl,master);
						if(typeof master !== 'undefined' && master !== '') {
							url = master;
							ua = calc(master);
							index = data.num;
							callback(url,index,ua,name);
							resolve();
						}
					}else {
						callback(null,d.data.num,null,null);
						isbreak = true;
						reject('请升级VIP');
					}
				}else if(d.msgType==410){
					alert('请升级VIP');
					reject('请升级VIP');
				}else{
					console.log('签名错误');
					reject('请升级VIP');
				}
			} else if (xhr.readyState === 4 && xhr.status !== 200) {
				console.log('未知错误');
				reject('请求错误');
			}
		};
		xhr.timeout = 5000; // s seconds timeout, is too long?
		xhr.ontimeout = function () { console.log('请求超时'); }
		xhr.send(data);
	}
});
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
if(dl || mode === 0){
	if(url != null){
		let o = {'url':url,'ua':ua,'name':name};
		if(dl){
			content = btoa(unescape(encodeURIComponent(getConent(o))));
			window.open(`m3u8dl://${content}`);
		}else{
			let content = 'chcp 65001' + '\r\n';
			content += getConent(o);
			downloadFile(content,title)
		}
	}else {
		alert('请升级VIP');
	}
}else {
	if(listsize !== 0 && url != null){
		arr[index-1] = {'url':url,'ua':ua,'name':name};
		listsize--;
	}else {
		let content = 'chcp 65001' + '\r\n';
		for (let j = 0; j < arr.length; j++) {
			let o = arr[j];
			content += `N_m3u8DL-CLI ${getConent(o)}` + '\r\n';
		}
		content = content.replace(/^\r\n+|\r\n+$/g,'');
		downloadFile (content,title);
	}
}
}

function downloadFile (content,title){
let i = new Blob([content], {
	type: 'text/plain'
});
let a = URL.createObjectURL(i);
let o = title+'.bat';
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

function getConent(o){
if(path != null) {
	path = `--workDir "${path}"`;
}else {
	path = '';
}
let content = `"${o.url}" --saveName "${o.name}" ${path} --headers "User-Agent:${o.ua}" --enableDelAfterDone --enableBinaryMerge `;
return content;
}

function replaceHost(s) {
let regex = /(https?:\/\/)[^\/]+/g;
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