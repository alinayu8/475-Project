
 
$(document).ready(function() {
      //Specific Details for Gmail API and chrome
    var client_id = "17382193749-v4fjpqnac4g1h9k9vdd2oroa2mndek2u.apps.googleusercontent.com";
    var api_key = "AIzaSyDumxJ12BxSPmIZepjCFkx1Mg180TmpaIQ";
    var app_id = "aepflfaiednkkpgjclpjoelhggmadeel";
    var tokenNum;
    var user;

    $('#authorize_button').click(function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);
        var retrievedToken = token;
        tokenNum = token;
        chrome.storage.sync.set({'gmailUserToken':retrievedToken}, function() { //saves the token to the cloud
          console.log('Gmail settings saved: ' + retrievedToken);
        });

        chrome.identity.getProfileUserInfo(function(info) {
            user = info.id;
            var userId = info.id;
            console.log(userId)
            chrome.storage.sync.set({'gmailUserId':userId}, function() { //saves the token to the cloud
              console.log('Gmail userId saved: ' + userId);
            })
        });
      });
    });

    $('#signout_button').click(function() {
      chrome.identity.launchWebAuthFlow(
        { 'url': 'https://accounts.google.com/logout' },
        function(tokenUrl) {
            console.log("SIGNED_OUT");
        }
    )});

    $('#gmail_threads').click(function() {
        chrome.storage.sync.get('retrievedToken', async function(result){ 
          // let token = result.gmailUserToken

          console.log("token: " + tokenNum)
          const gmailThreads =  await retrieveUserEmailThreads(tokenNum);
          // console.log(gmailThreads[0]);

        // for (var i = 0; i < gmailThreads.length; i++) {
        //   var thread = gmailThreads[i];
        //   var threadInfo = getThreadInfoArray(thread);
        //   addThreads(threadInfo);
        // }
        });
    });

    // function retrieveUserEmailThreads(id) {
    //     return new Promise(function(resolve, reject) {
    //     // Retrieve channel name
    //     let testChannel = "CA6SB5GDA";
    //     // let url = "https://www.googleapis.com/gmail/v1/users/" + id + "/threads" ;
    //     let url = "https://www.googleapis.com/gmail/v1/users/me/threads" ;
    //     const xhr = new XMLHttpRequest();
    //     xhr.open("GET", url, true);
    //         xhr.onreadystatechange = function() {
    //             if (xhr.readyState == 4 && xhr.status == 200) {
    //                 let resp = JSON.parse(xhr.responseText);
    //                 var maxCount = 20;


    //                 var threads = [];
    //                 for (var i = 0; i < 20; i++) {
    //                     let thread = resp['threads'][i];
    //                     threads.push(thread);
    //                 }
    //                 resolve(threads);
    //             }
    //         }
    //     xhr.send();
    // })

    // }

    function retrieveUserEmailThreads(token) {
        get({
          'url': 'https://www.googleapis.com/gmail/v1/users/me/threads',
          'callback': resultingThreads,
          'token': token,
        });
    }

    function resultingThreads(list) {
      parseThreads(list.threads);
    }

    function parseThreads(threads) {
      for (var i = 0; i < 15; i++) {
          var thread = threads[i];
          retrieveMessagesFromThreads(tokenNum, thread.id)
          // console.log(thread.messages)
          // var threadInfo = getThreadInfoArray(thread);
          // addThreads(threadInfo);
        }
    }

    function retrieveMessagesFromThreads(token, threadId) {
      get({
          'url': 'https://www.googleapis.com/gmail/v1/users/me/threads/' + threadId,
          'callback': resultingMessages,
          'token': token,
        });
    }

    function resultingMessages(thread) {
        var snippets = thread.snippets;
        var messages = thread.message
        var caption = []

        for (var i = 0; i < 15; i++) {
          console.log(snippets[i])
          caption.push(snippets[i])
        }

        console.log(thread.messages);


    }




    function get(options) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
              // JSON response assumed. Other APIs may have different responses.
              options.callback(JSON.parse(xhr.responseText));
          } else {
              console.log('get', xhr.readyState, xhr.status, xhr.responseText);
          }
      };
      xhr.open("GET", options.url, true);
      // Set standard Google APIs authentication header.
      xhr.setRequestHeader('Authorization', 'Bearer ' + options.token);
      xhr.send();
  }







    function getThreadInfoArray(thread) {

    }

    // function addThreads(array) {
    //   var text = `<a class='message' href='(link to gmail thread)'>
    //             <div class='row pl-3 pt-3 ` + unread + ` pr-3 pb-3 d-flex align-items-center border-bottom border-dark'>
    //               <div class='col-1 messagePlatform'>
    //                 <i class='fa fa-grip-vertical fa-lg mr-2 messageGrip hidden' aria-hidden='true'></i>
    //                 <img class='messageIcon' src='./assets/icons/gmail.png'>
    //               </div>
    //               <div class='col-3 messageSender'>
    //                 <p>` + <WHO SENT> + `</p>
    //               </div>
    //               <div class='col-6 messageContent'>
    //                 <p>` <MESSAGE CONTENT>`</p>
    //               </div>
    //               <div class='col-2 messageTime'>
    //                 <p>` + <TIMESTAMP> + `</p>
    //               </div>
    //             </div>
    //           </a>`
    // $('#nav-unassigned .dragula-container').append(text);
    // }
});



    





