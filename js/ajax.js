//发送请求
async function sendAxio(api,myheaders,method,reqBody){
    var headers = new Headers(),
    keys = Object.keys(myheaders);
    for (key of keys) {
        let val = myheaders[key];
        headers.append(key, val);
    }

    var raw = JSON.stringify(reqBody);

    var requestOptions = {
        method: method,
        headers: headers,
        body: raw,
        redirect: 'follow'
    };
    let res = await fetch(api, requestOptions),
    txt = await res.text();
    return txt;
}
