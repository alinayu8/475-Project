// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';


chrome.runtime.onInstalled.addListener(function() {

    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });


chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
	console.log("Background JS responding");
	console.log(response);
	saveToken(response);
});

//copied save function from popup js
function saveToken(retrievedToken) {
        // Get a value saved in a form.
        var token = retrievedToken;
        // Check that there's some code there.
                // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({userToken: token}, function() {
          // Notify that we saved.
          console.log('Settings saved:');
		  console.log(token);
		  tokenforcalls = token; //updates global token with new value from authing.
        });
      }


// chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
// 	console.log("Background JS responding");
// 	console.log(response);
//         saveToken(response);
// });

// //copied save function from popup js
// function saveToken(retrievedToken) {
//     // Get a value saved in a form.
//     var token = retrievedToken;
//     // Check that there's some code there.
//             // Save it using the Chrome extension storage API.
//     chrome.storage.sync.set({userToken: token}, function() {
//         // Notify that we saved.
//         console.log('Settings saved:');
//         console.log(token);
//         tokenforcalls = token; //updates global token with new value from authing.
//     });
// }

// chrome.browserAction.setBadgeBackgroundColor({color: '#FF7A78'})
// chrome.browserAction.setBadgeText({text: `5`})

