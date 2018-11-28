//UNCOMMENT AND RELOAD SCREEN ONCE TO WIPE OUT ALL CHROME STORAGE DATA
$(window).on("load", function () {
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
    localStorage.clear();
});