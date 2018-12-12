
 
$(document).ready(function() {
    
      //Specific Details for Gmail API and chrome
    var client_id = "17382193749-v4fjpqnac4g1h9k9vdd2oroa2mndek2u.apps.googleusercontent.com";
    var api_key = "AIzaSyDumxJ12BxSPmIZepjCFkx1Mg180TmpaIQ";
    // var app_id = "aepflfaiednkkpgjclpjoelhggmadeel";
    var app_id = chrome.runtime.id;
    var tokenNum;
    var user;
    var mainMessages = new Set()

    $('#gmail_auth').click(function() {
        authorizeGmail()
    });

    
    checkGmail()
    // reset()


    function reset() {
      console.log("HAPPENED")
        $('.message').remove()
        mainMessages.clear()
    }

    function authorizeGmail() {

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
      })
      checkGmail();
    };



    $('#signout_button').click(function() {
      chrome.identity.launchWebAuthFlow(
        { 'url': 'https://accounts.google.com/logout' },
        function(tokenUrl) {
            console.log("SIGNED_OUT");
        }
    )});



    setInterval(authorizeGmail, 60000);

    function checkGmail() {
      // reset() 
      // return;

      console.log(mainMessages.size)
      // if (mainMessages.size > 15) {
      //   mainMessages.clear()
      //   return;
      // }
    
      if (typeof tokenNum !== 'undefined') {
          const gmailThreads =  retrieveUserEmailThreads(tokenNum);
      }
      chrome.storage.sync.get('gmailUserToken', async function(result){ 
        console.log("RUNNING...");
        console.log(result.gmailUserToken)
          // let token = result.gmailUserToken
        console.log("token: " + tokenNum)

          if (typeof tokenNum === 'undefined') {
            console.log("token: " + tokenNum)
            if (typeof result.gmailUserToken !== 'undefined') {
              console.log("tokenGmail: " + result.gmailUserToken)
              const gmailThreads =  await retrieveUserEmailThreads(result.gmailUserToken);    
            }
            
          } else {
            const gmailThreads =  await retrieveUserEmailThreads(tokenNum);
          }

          // console.log(gmailThreads[0]);

        // for (var i = 0; i < gmailThreads.length; i++) {
        //   var thread = gmailThreads[i];
        //   var threadInfo = getThreadInfoArray(thread);
        //   addThreads(threadInfo);
        // }
        })
    }


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
        var snippets = [];
        // console.log(snippets);
        var parsed = thread;
        // var parsed = JSON.parse(thread);
        // var threads = parsed[0];
        console.log(parsed.messages[0].snippet);
        // var messages = thread.messages

        mainMessages.add(parsed.messages[0])


        console.log("mainMessages: " + mainMessages.size);
        if (mainMessages.size == 15) {
          populateThread()
        }
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
      xhr.setRequestHeader('Authorization', 'Bearer ' + options.token, 'Date');
      xhr.send();
      // return 
  }



  function populateThread() {
    var unread;
    var message;
    var time;
    var link;

    console.log("POPULATING!!")

    // for (let m of mainMessages) {
    //   console.log(m.snippet)
    // } 
    let arrayOfMain = Array.from(mainMessages)
    for (var i = 0; i < arrayOfMain.length; i++) {
      var messageContent = arrayOfMain[i];
      message = parseMessage(messageContent.snippet)
      unread = confirmUnread(messageContent.labelIds)
      time = convertTime(messageContent.internalDate)
      link = getLink(messageContent)
      values = messageContent.payload.headers[10].value
      sender = getSender(values.split(" "));
      populatePage(message, unread, time, link, sender);
    }
  };

  function getSender(values) {
    var want = "header.from="
    var sender = "Loading"
    for (var i = 0; i < values.length; i++) {
      if (values[i].includes(want)) {
        var sending = values[i].split("=")
        sender = sending[1]
        console.log("I AM THE SENDER:" + sender)
      }
    }
    return sender
  }


  function parseMessage(snippet) {
      // s.matches("[a-zA-Z]+")
      var array = snippet.split(" ");
      var string = ""
      for (var i = 0; i < 10; i++ ) {
        string += array[i] + " "
      }

      return string
  }

  function confirmUnread(labels) {
      for (var i = 0; i < labels.length; i++) {
        if(labels[i] === "UNREAD") {
            return true;
        }
      }
      return false
  }

  function convertTime(internalDate) {
    var secs = internalDate
    var d = new Date(0)
    d.setUTCMilliseconds(secs)
    // var result = formatTime(d)
    // var result = tConvert(d.toTimeString())
    var result = formatTime(d);
    return result

  }

  function getLink(content) {
      var link = "https://mail.google.com/mail?authuser=me@gmail.com#all/" + content.id;
      return link
  }

  function formatTime(date) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var month = months[date.getMonth()];
    var day = date.getDate();
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in MONTH DAY 10:30:23 format
    var formattedTime = month + " " + day + " " + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

      return formattedTime
      // var d = new Date(date)
      // var hh = d.getHours();
      // var m = d.getMinutes();
      // var s = d.getSeconds();
      // var dd = "AM";
      // var h = hh;
      // if (h >= 12) {
      //   h = hh - 12;
      //   dd = "PM";
      // }
      // if (h == 0) {
      //   h = 12;
      // }
      // m = m < 10 ? "0" + m : m;

      // s = s < 10 ? "0" + s : s;

      // /* if you want 2 digit hours:
      // h = h<10?"0"+h:h; */

      // var pattern = new RegExp("0?" + hh + ":" + m + ":" + s);

      // var replacement = h + ":" + m;
      // /* if you want to add seconds
      // replacement += ":"+s;  */
      // replacement += " " + dd;

      // return date.replace(pattern, replacement);
    // return formattedTime
  }


  function tConvert (time) {
      // Check correct time format and split into components
      console.log(time)
      time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if (time.length > 1) { // If time format correct
        time = time.slice (1);  // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      var t = time.join('')
      return t; // return adjusted time or original string
    }

  function populatePage(message, unread, time, link, sender) {
    console.log("TIMEEEEE" + time)
    var sent = sender
    var read = "";
    if (unread == true) {
      read = "unread"
    }
       var text = `<a class='message' href='` + link + `'>
             <div class='row pl-3 pt-3 ` + read + ` pr-3 pb-3 d-flex align-items-center border-bottom border-dark'>
                   <div class='col-1 messagePlatform'>
                     <i class='fa fa-grip-vertical fa-lg mr-2 messageGrip hidden' aria-hidden='true'></i>
                     <img class='messageIcon' src='./assets/icons/gmail.png'>
                   </div>
                   <div class='col-3 messageSender'>
                     <p>` + sent + `</p>
                   </div>
                   <div class='col-6 messageContent'>
                     <p>` + message + `</p>
                   </div>
                   <div class='col-2 messageTime'>
                     <p>` + time + `</p>
                   </div>
                 </div>
               </a>`
    $('#nav-unassigned .dragula-container').append(text);
    
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



    





