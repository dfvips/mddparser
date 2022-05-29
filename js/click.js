let url,info = {},tab,path = localStorage.getItem('savePath');
chrome.tabs.query({active: true,currentWindow: true},function(tabs) {
    url = tabs[0].url;
    info.pageUrl = url;
    tab = tabs[0];
});

if(path != null){
    $('#changePath').html('修改存储路径');
}else{
    $('#changePath').html('添加存储路径');
};

$('#downOne').click(function(){
    downloadOne(info,tab,false);
    $(this).blur();
});

$('#downMul').click(function(){
    downloadMul(info,tab);
    $(this).blur();
});

$('.ndl').click(function(){
    window.open($(this).data('href'));
});

$('#nDl').click(function(){
    if(path == null) {
        $('.inp-box').removeClass('d-none');
    }else {
        downloadOne(info,tab,true);
    };
    $(this).blur();
});

$('#savePath').click(function(){
    let p = $('#path').val();
    if(p !== '' && matchRegx(p,/^([a-zA-Z]:)(\\[^/\\:*?"<>|]+\\?)*$/g)){
        localStorage.setItem('savePath',p);
        path = p;
        $('.inp-box').addClass('d-none');
        $('#changePath').html('修改存储路径');
    }else{
        alert('请输入正确的存储路径，如：“C:\\Users\\dreamfly\\Downloads”');
    };
    $(this).blur();
});

$('#changePath').click(function(){
    $('.inp-box').removeClass('d-none');
    if(path != null) {
        $('#path').val(path);
    }
    $(this).blur();
});

function matchRegx(val,prop){
    let r = val.match(prop)
    if(r == null){
        return false;
    } else {
        return true;
    }
}