$(document).ready(function() {
    // Redirect to Slack -- STILL SPECIFIC TO ALINA'S WORKSPACE OF MT2018-2019
    $('#slack_auth').click(function() {
        // Reset token for now
        // var resetToken = '';
        // chrome.storage.sync.set({'slackUserToken':resetToken}, function() { //saves the token to the cloud
        //     console.log('Settings saved: ' + resetToken);
        // });

        var redirectUri = "https://gifolagmeampojmmieheifnieomimglm.chromiumapp.org/"

        var client_id = '347262053333.468176603908';
        var enc_client_secret = 'MGIwZDBkMmQ1YzNkZTE2ZGFiMmFiODBjODY5YjY1N2Y='; //encoded
        var scopes = 'channels:history,groups:history,channels:read,im:history,mpim:history,users:read';
        var auth_url = "https://slack.com/oauth/authorize?client_id=" + client_id + "&scope=" + scopes + "&response_type=token";
        
        chrome.identity.launchWebAuthFlow({'url':auth_url,'interactive':true}, function(redirectUri){
             console.log("end of auth: " + redirectUri); //remove console logging of authflow

             // Getting Verification code
             var codeurl = new URL(redirectUri);
             var verificationCode = codeurl.searchParams.get("code");

             // Getting Access token
            var xhr = new XMLHttpRequest();
            var url = 'https://slack.com/api/oauth.access?client_id=' + client_id + '&client_secret=' + window.atob(enc_client_secret) + '&code=' + verificationCode;
            
            xhr.open('GET', url, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4 && xhr.status == 200) {
                    var resp = JSON.parse(xhr.responseText);
                    $('#slack_auth').text("Slack authorized");
                    saveSlackToken(resp.access_token);
                }
            }
            xhr.send();
        });
    });

$('#slack_mssgs').click(function() {
    chrome.storage.sync.get('slackUserToken', async function(result){ // retrieves token from user's Chrome options
        let token = result.slackUserToken;

        //Retrieve dictionary of channels
        const channelDictionary = await retrieveSlackChannels(token);
        //Retrieve list of users
        const userDictionary = await retrieveSlackUsers(token);

        // Loop through all channel names
        for (var i = 0; i < Object.keys(channelDictionary).length; i++) {
            let key = Object.keys(channelDictionary)[i];
            let channelName = channelDictionary[key];
            await addSlackConversations(token, key, channelName, userDictionary);
        }
    });
});

async function addSlackConversations(token,channelID,channelName,userDictionary) {
    const slackArray = await retrieveSlackMessages(channelID, token);
    let message = slackArray[0];
    let mssgUser = slackArray[1];
    let time = slackArray[2];
    let unreadCount = slackArray[3];
    if (unreadCount > 0) {
        var unread = 'unread';
    } else {
        var unread = '';
    }
    let sender = retrieveSingleSlackUser(userDictionary, mssgUser);
    var text = `<a class='message' href='https://my.slack.com/messages/` + channelID + `'>
                <div class='row pl-3 pt-3 ` + unread + ` pr-3 pb-3 d-flex align-items-center border-bottom border-dark'>
                  <div class='col-1 messagePlatform'>
                    <i class='fa fa-grip-vertical fa-lg mr-2 messageGrip hidden' aria-hidden='true'></i>
                    <img class='messageIcon' src='./assets/icons/slack.png'>
                  </div>
                  <div class='col-3 messageSender'>
                    <p>` + channelName + `</p>
                  </div>
                  <div class='col-6 messageContent'>
                    <p>` + sender + ': ' + message + `</p>
                  </div>
                  <div class='col-2 messageTime'>
                    <p>` + time + `</p>
                  </div>
                </div>
              </a>`
    $('#nav-unassigned .dragula-container').append(text);
}


//Saves the token to the user's Chrome storage
function saveSlackToken(retrievedToken) {//retrieved token is the token passed to to this function upon auth completion
    chrome.storage.sync.set({'slackUserToken':retrievedToken}, function() { //saves the token to the cloud
      console.log('Settings saved: ' + retrievedToken);
    });
  }

function timestampToDate(timestamp) {  // reformat time
    var date = new Date(timestamp*1000);
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
}

function retrieveSingleSlackUser(userDictionary, userID) {
    var length = Object.keys(userDictionary).length
    for (var i = 0; i < length; i++) {
        let key = Object.keys(userDictionary)[i];
        if (key == userID) {
            return userDictionary[key];
        }
    }
}

function retrieveSlackMessages(channelID, token) {
    return new Promise(function(resolve, reject) {
        // Retrieve conversation history
        let url = "https://slack.com/api/channels.history?token="+token+"&channel="+channelID+"&unreads=true&count=1";
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let resp = JSON.parse(xhr.responseText);
                //console.log(resp);
                let text = resp['messages'][0]['text'];
                let user = resp['messages'][0]['user'];
                let ts = resp['messages'][0]['ts'];
                let unread = resp['unread_count_display'];
                let time = timestampToDate(ts);
                resolve([text, user, time, unread])
            }
        }
        xhr.send();
    })
}


function retrieveSlackUsers(token, user) {
    return new Promise(function(resolve, reject) {
        // Retrieve users in conversation
        let url = "https://slack.com/api/users.list?token="+token;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let resp = JSON.parse(xhr.responseText);
                var usersDictionary = {};
                for (var i = 0; i < resp['members'].length; i++) { 
                    let id = resp['members'][i]['id'];
                    let name = resp['members'][i]['real_name'];
                    usersDictionary[id] = name;
                }
                resolve(usersDictionary);
            }
        }
        xhr.send();
    })
}

function retrieveSlackChannels(token) {
    return new Promise(function(resolve, reject) {
        // Retrieve channel name
        let testChannel = "CA6SB5GDA";
        let url = "https://slack.com/api/channels.list?token="+token+"&exclude_members=true";
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    let resp = JSON.parse(xhr.responseText);
                    var channelDictionary = {}
                    for (var i = 0; i < resp['channels'].length; i++) {
                        let name = resp['channels'][i]['name'];
                        let id = resp['channels'][i]['id'];
                        channelDictionary[id] = name;
                    }
                    resolve(channelDictionary);
                }
            }
        xhr.send();
    })
}

    // var sum = 0;
    // $(".unread").each(function() {
    //     sum += 1;
    //     console.log(sum);
    // });
});