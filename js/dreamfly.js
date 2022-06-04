
let listsize=0,arr = [],dl,isbreak = false,title,
privateKey = 'e1be6b4cf4021b3d181170d1879a530a9e4130b69032144d5568abfd6cd6c1c2',
headers = {'Accept-Language': 'en-CN;q=1, zh-Hans-CN;q=0.9','Content-Type': 'application/json;charset=UTF-8'},
appToken = '',//
deviceNum = '',
isdownTry = false;//;
// 下载单个
function downloadOne(info, tab,flag) {
	if (typeof flag === 'undefined'){
		dl = false;
	}else{
		dl = flag;
	}
	title = info.title;
	checkUrl(info.pageUrl,0);
}
// 下载多个
function downloadMul(info, tab) {
	dl = false;
	title = info.title;
	checkUrl(info.pageUrl,1);
}
// 检测网站
function checkUrl(url,mode){
	if(url.indexOf('mddcloud.com.cn/video/') !== -1){
		appToken = localStorage.getItem('appToken',),
		deviceNum = localStorage.getItem('deviceNum');
		if(appToken === null || deviceNum === null) {
			function checkUserMsg(msg,name) {
				if(msg === null || msg === '') {
					msg =	window.prompt(`请输入${name}：`);
					if (msg === null || msg === '') {
						var r=confirm("无登录信息，将无法解析无水印M3u8或完整视频，点击确定，表示不填写信息，点击取消，表示重新填写");
						if (r == true){
							return false;
						}else{
							checkUserMsg(msg,name);
						}
					}else {
						if (msg !== null && msg !== '') {
							localStorage.setItem(`${name}`,msg);
							return true;
						}else {
							checkUserMsg(msg,name);
						}
					}
				}
			}
			let checkOne =  checkUserMsg(appToken,'appToken');
			if(checkOne) {
				checkUserMsg(deviceNum,'deviceNum');
				begin();
			}else {
				begin();
			}	
		} else {
			begin();
		}
		
		function begin () {
			arr=[];
			let pageid = url.match(/([a-f\d]{32}|[A-F\d]{32})/)[0],
			num = url.match(/(?<=.*?num=).*/)[0];
			startTask(pageid,num,mode);
		}
	}else{
		alert('请在埋堆堆播放页面使用本插件！')
	}
}
//开始判断
async function startTask (pageid,num,mode){
	isbreak = false;
	if(appToken === '' || appToken === 'null' || appToken === null) {
		appToken = getRandomid(64);
	}
	if(deviceNum === '' || appToken === 'null' || appToken === null) {
		deviceNum = getRandomid(32);
	}
	let tm = new Date().getTime(),
	sign = MD5(`os:Android|version:4.3.20|action:/api/vod/listVodSactions.action|time:${tm}|appToken:${appToken}|privateKey:${privateKey}|data:hasIntroduction=0&vodUuid=${pageid}&vod_type=0&`),
	reqBody = `{"time":${tm},"data":{"vodUuid":"${pageid}","hasIntroduction":0,"vod_type":0},"appToken":"${appToken}","os":"Android","version":"4.3.20","channel":"AppStore","sign":"${sign}"}`,
	listArr = await sendAxio('https://mob.mddcloud.com.cn/api/vod/listVodSactions.action',headers,'POST',JSON.parse(reqBody)),
	epList = JSON.parse(listArr).data,
	epCurrent = epList.filter(ep => ep.num == num);
	//判断下载模式
	if(mode === 0) {
		down(epCurrent);
	}else {
		down(epList);
	}
	//解析下载
	async function down(epList){ 
		isdownTry = false;
		let epFrees = epList.filter(ep => ep.isFreeLimit === 1 || ep.isVipSaction === 0),
		epVips = epList.filter(ep => ep.isFreeLimit === 0 && ep.isVipSaction === 1),
		epVipFirst = epVips.filter((ep,index) => index === 0),
		epVipNext = epVips.filter((ep,index) => index > 0),
		frees = await sortList(epFrees);
		vipFirst = await sortList(epVipFirst);
		vips = vipFirst;
		if (vips.length > 0 && Object.keys(vipFirst[0]).length !== 0 && vipFirst[0].url.indexOf('exper=360')=== -1){
			let vipNext = await sortList(epVipNext);
			vips = vips.concat(vipNext);
		}else {
			if(!dl){
				if(vips.length > 0 && vipFirst[0].url.indexOf('exper=360')!== -1) {
					var r = confirm("是否需要下载试看？");
					if (r == true){
						let vipNext = await sortList(epVipNext);
						vips = vips.concat(vipNext);
						isdownTry = true;
					}
				}else {
					let vipNext = await sortList(epVipNext);
					vips = vips.concat(vipNext);
				}
			}
		}
		let result = frees.concat(vips);
		startDown(result);
	}
	//遍历
	async function sortList(eps){
		let result = eps.map(async episode => {
			let uuid = episode.uuid,
			res = await parse(uuid),
			data = JSON.parse(res).data,
			obj = {};
			if(typeof data.masterPlaylistUrl != 'undefined' ||typeof data.oriUrl != 'undefined') {
				if(typeof data.masterPlaylistUrl != 'undefined' ){
					let master = replaceHost(data.masterPlaylistUrl);
					if(typeof master !== 'undefined' && master !== '') {
						obj.url = master;
						obj.ua = calc(master);
						obj.name = data.name;
						obj.duration = data.duration;
					}
				}else {
					obj.url = data.oriUrl;
					obj.ua = calc(obj.url);
					obj.name = data.name;
					obj.duration = data.duration;
					obj.size = data.size;
				}
			}else {
				console.log(null);
			}
			if (Object.keys(obj).length === 0) {
				isbreak = true;
			}
			return obj;
		});
		return await Promise.all(result);
	}
	//接口请求	
	async function parse(vodId) { 
		if (!isbreak) {
			let tm = new Date().getTime(),
			sign = MD5(`os:Android|version:4.3.20|action:/api/vod/getSaction.action|time:${tm}|appToken:${appToken}|privateKey:${privateKey}|data:action=playUrl&checkVodTicket=1&sactionUuid=${vodId}&`),
			reqBody = `{"time":${tm},"data":{"checkVodTicket":1,"action":"playUrl","sactionUuid":"${vodId}"},"appToken":"${appToken}","os":"Android","version":"4.3.20","channel":"AppStore","deviceNum":"${deviceNum}","deviceType":0,"sign":"${sign}"}`,
			res = await sendAxio('https://mob.mddcloud.com.cn/api/vod/getSaction.action',headers,'POST',JSON.parse(reqBody));
			return res;
		} else {
			return {};
		}
	}
}
//获取清晰度
// function getUrl(data){
// 	let arr = ['fluHls','fourHls','fhdHls','hdHls','sdHls','oriUrl','tryUrl'],
// 	res = '';
// 	for (let hls of arr) {
// 		let url = data[hls];
// 		if(typeof url != 'undefined'){
// 			res = replaceHost(url)
// 			console.log(url,res);
// 			break;
// 		}
// 	}
// 	return res;
// }
//开始下载任务
function startDown(arr){
	if(dl){
		let o = arr[0];
		if(o.url != undefined && o.ua != undefined && o.url.indexOf('m3u8') != -1) {
			content = btoa(unescape(encodeURIComponent(getConent(o))));
			window.open(`m3u8dl://${content}`);
		}else {
			alert('请填写appToken和deviceNum，如果已经填写，请升级VIP');
		}
	}else {
		let batContent = 'chcp 65001',
		zip = new JSZip(),
		batName = '',
		zipName = '';

		for (let o of arr) {
			if(o.url != undefined) {
				if(o.url.indexOf('m3u8') != -1) {
					batContent += '\r\n' + `N_m3u8DL-CLI ${getConent(o)}`;
				} else {
					let arr = [],
					m3 = `#EXTM3U\r\n#EXT-X-TARGETDURATION:15\r\n#EXT-X-DISCONTINUITY\r\n`;
					//非试看文件
					if(o.url.indexOf('exper=360')===-1){
						arr = spiltVideo(o.size,arr);
						for (let i = 0;i < arr.length;i++) {
							m3 += `#EXTINF:10,\r\n`;
							if (i === 0) {
								m3 += `#EXT-X-BYTERANGE:${arr[i]}@0\r\n`;
							}else if (i < arr.length-1) {
								m3 += `#EXT-X-BYTERANGE:10485760@${arr[i-1]}\r\n`;
							}else {
								m3 += `#EXT-X-BYTERANGE:${o.size - arr[i-1]}@${arr[i-1]}\r\n`;
							}
							m3 += `${o.url}\r\n`;
						}
						m3 += `#EXT-X-ENDLIST`;
						zip.file(`${o.name}.m3u8`, m3);
						o.url = `${o.name}.m3u8`;
						batContent += '\r\n' + `N_m3u8DL-CLI ${getConent(o)}`;
					}else {
						if(isdownTry) {
							m3 += `#EXTINF:${o.duration}\r\n`;
							m3 += `${o.url}\r\n`;
							m3 += `#EXT-X-ENDLIST`;
							zip.file(`${o.name}（试看）.m3u8`, m3);
							o.url = `${o.name}（试看）.m3u8`;
							batContent += '\r\n' + `N_m3u8DL-CLI ${getConent(o)}`;
						}
					}
				}
			}
		}
		
		if (batContent !== 'chcp 65001' || textContent != '') {
			if(arr.length === 1) {
				title = arr[0].name;
			}
			if(title === undefined) {
				title = arr[0].name.replace(/\d+$/g,'');
			}
			if(batContent !== 'chcp 65001') {
				batName = `${title}.bat`;
				zip.file(batName, batContent);
			}
			zipName = `${title}.zip`;
			zip.generateAsync({type:'blob'}).then(function(content) {
				// see FileSaver.js
				saveAs(content, zipName);
			});
		} else {
			alert('请填写appToken和deviceNum，如果已经填写，请升级VIP');
		}
	}
}
//下载
// function downloadFile (content,title){
// 	let i = new Blob([content], {
// 		type: 'text/plain'
// 	});
// 	let a = URL.createObjectURL(i);
// 	let o = title+'.bat';
// 	let r = document.createElement('a');
// 	r.href = a;
// 	r.download = o;
// 	r.style.display = 'none';
// 	let d;
// 	if (window.MouseEvent) {
// 		d = new MouseEvent('click')
// 	} else {
// 		d = document.createEvent('MouseEvents');
// 		d.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
// 	}
// 	r.dispatchEvent(d);
// }
//生成命令
function getConent(o){
	let downPath = localStorage.getItem('savePath');
	if(downPath != null) {
		downPath = `--workDir "${path}"`;
	}else {
		downPath = '';
	}
	let content = `"${o.url}" --saveName "${o.name}" ${downPath} --headers "User-Agent:${o.ua}" --enableDelAfterDone --enableBinaryMerge `;
	return content;
}
//替换域名
function replaceHost(s) {
	let regex = /(https?:\/\/)[^\/]+/g;
	return s.replace(regex, 'http://wxpcdn.mddcloud.com.cn:80');
}
//生成随机数
function getRandomid(n){
	let chars = ['0','1','2','3','4','5','6','7','8','9'],
	ids ="";
	if(n === 32) {
		chars = chars.concat(['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']);
	} else {
		chars = chars.concat(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']);
	}
	for(var i = 0; i < n; i++){
		var id = parseInt(Math.random()*61);
		ids += chars[id];
	}
	return ids;
}
//切片
function spiltVideo(n,arr){
    for (let i = 1;(i*10485760) < n;i++) {
        arr.push(i*10485760);
    }
    arr.push(n);
	return arr;
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