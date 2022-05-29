var url,info = {},tab;
chrome.tabs.query({active: true,currentWindow: true},function(tabs) {
    url = tabs[0].url;
    info.pageUrl = url;
    tab = tabs[0];
})
$('#downOne').click(function(){
    downloadOne(info,tab);
    $(this).blur();
})
$('#downMul').click(function(){
    downloadMul(info,tab);
    $(this).blur();
})