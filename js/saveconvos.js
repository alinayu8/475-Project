//reloading all convos before open window
$(window).on("load", function () {
    chrome.storage.local.get('content', function(result) {
        $("#nav-tabContent").html(result.content);
    });
});

// before close window
$(window).on("unload", function(e) {
    var tab_content = $("#nav-tabContent").html();
    //var tab_content = "";
    chrome.storage.local.set({content: tab_content}, function() {
        // Notify that we saved.
        console.log('Settings saved:');
    });    
});

//UNCOMMENT AND RELOAD SCREEN ONCE TO WIPE OUT ALL CHROME STORAGE DATA
// $(window).on("load", function () {
//     chrome.storage.local.clear();
//     chrome.storage.sync.clear();
// });