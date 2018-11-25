$(document).ready(function() {
    
    $('#slack_auth').click(function() {
        // Reset token for now
        // var resetToken = '';
        // chrome.storage.sync.set({'slackUserToken':resetToken}, function() { //saves the token to the cloud
        //     console.log('Settings saved: ' + resetToken);
        // });
        
        var redirectUri = "https://gifolagmeampojmmieheifnieomimglm.chromiumapp.org/"

        var client_id = '347262053333.468176603908';
        var enc_client_secret = 'MGIwZDBkMmQ1YzNkZTE2ZGFiMmFiODBjODY5YjY1N2Y='; //encoded
        var scopes = 'channels:history,groups:history,channels:read,im:read,im:history,users:read,team:read';
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
                    saveSlackToken(resp.access_token);
                }
            }
            xhr.send();
        });
    });

    //Saves the token to the user's Chrome storage
    function saveSlackToken(retrievedToken) { //retrieved token is the token passed to to this function upon auth completion
        chrome.storage.sync.get('slackUserToken', function(result) { //saves the token to the cloud 
            if (typeof result.slackUserToken === 'undefined' || result.slackUserToken.length == 0) {
                var tokens = [retrievedToken];
            } else {
                var tokens = result.slackUserToken;
                tokens.push(retrievedToken);
            }
            //var tokens = undefined;
            chrome.storage.sync.set({'slackUserToken':tokens}, function() { //saves the token to the cloud
                console.log('Settings saved: ' + tokens);
            });
            console.log('Settings saved: ' + tokens);
        });
    }

//Continuously update messages
setInterval(checkSlack, 20000);

function checkSlack() {
    chrome.storage.sync.get('slackUserToken', async function(result){ // retrieves token from user's Chrome options
        if (typeof result.slackUserToken !== 'undefined') {
            let tokens = result.slackUserToken;
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                console.log(token);
                //Retrieve list of users
                const userDictionary = await retrieveSlackUsers(token);
                //Retrieve dictionary of channels
                const channelDictionary = await retrieveSlackChannels(token);

                // Loop through all channel names
                for (var j = 0; j < Object.keys(channelDictionary).length; j++) {
                    let key = Object.keys(channelDictionary)[j];
                    let channelName = channelDictionary[key];
                    await updateSlackConversations(token, key, channelName);
                }
            }
        }
    });
}
    
//Initially adding slack messages
$('#slack_mssgs').click(function() {
    chrome.storage.sync.get('slackUserToken', async function(result){ // retrieves token from user's Chrome options
        let tokens = result.slackUserToken;
        //for (var i = 0; i < tokens.length; i++) {
        var size = tokens.length;
        var token = tokens[size-1];
        console.log(token);
        //Retrieve list of users
        const userDictionary = await retrieveSlackUsers(token);
        //Retrieve dictionary of channels
        const channelDictionary = await retrieveSlackChannels(token);
        // Loop through all channel names
        for (var i = 0; i < Object.keys(channelDictionary).length; i++) {
            let key = Object.keys(channelDictionary)[i];
            let channelName = channelDictionary[key];
            await addSlackConversations(token, key, channelName);
        }
    });
});


async function addSlackConversations(token,channelID,channelName) {
    const slackArray = await retrieveSlackMessages(channelID, token);
    if (slackArray[2] != "/" && typeof slackArray[1] !== 'undefined') {
        let message = slackArray[0];
        let mssgUser = slackArray[1];
        let time = slackArray[2];
        let unreadCount = slackArray[3];
        if (unreadCount > 0) {
            var unread = 'unread';
        } else {
            var unread = '';
        }
        const workspaceDetails = await retrieveURL(token);
        let workspaceName = workspaceDetails[0];
        let workspaceURL = workspaceDetails[1];
        const sender = await findUserName(mssgUser);
        var text = `<a class='message' href='https://` + workspaceURL + `.slack.com/messages/` + channelID + `'>
        <div class='row pl-3 pt-3 ` + unread + `pr-3 pb-3 d-flex align-items-center border-bottom border-dark'>
        <div class='col-1 messagePlatform'>
            <i class='fa fa-grip-vertical fa-lg mr-2 messageGrip hidden' aria-hidden='true'></i>
            <img class='messageIcon' src='./assets/icons/slack.png'>
        </div>
        <div class='col-3 messageSender'>
            <p>` + workspaceName + ` > ` + channelName + `</p>
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
}

function retrieveURL(token) {
    return new Promise(function(resolve, reject) {
        // Retrieve users in conversation
        let url = "https://slack.com/api/team.info?token="+token+"&pretty=1";
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let resp = JSON.parse(xhr.responseText);
                let name = resp['team']['name'];
                let domain = resp['team']['domain'];
                resolve([name, domain]);
            }
        }
        xhr.send();
    })
}

async function updateSlackConversations(token,channelID,channelName) {
    const slackArray = await retrieveSlackMessages(channelID, token);
    if (slackArray[2] != "/" && typeof slackArray[1] !== 'undefined') {
        const workspaceDetails = await retrieveURL(token);
        //let workspaceName = workspaceDetails[0];
        let workspaceURL = workspaceDetails[1];

        let message = slackArray[0];
        let mssgUser = slackArray[1];
        let time = slackArray[2];
        let unreadCount = slackArray[3];
        if (unreadCount == 0) {
            $( 'a[href^="https://' + workspaceURL + '.slack.com/messages/' + channelID + '"] .align-items-center').removeClass("unread");
        }

        var og_time = $('a[href^="https://' + workspaceURL + '.slack.com/messages/' + channelID + '"] .messageTime').text().trim();
        console.log(time);
        console.log(og_time);
        console.log(time != og_time);
        if (time != og_time) {
            console.log(typeof time);
            console.log(typeof og_time);
            const sender = await findUserName(mssgUser);
            var mssg_sender = sender + ': ' + message

            // Replace sender and message with this href
            $('a[href^="https://' + workspaceURL + '.slack.com/messages/' + channelID + '"] .messageContent').html('<p>' + mssg_sender + '</p>');
            // Replace time with this href
            $('a[href^="https://' + workspaceURL + '.slack.com/messages/' + channelID + '"] .messageTime').html('<p>' + time + '</p>');
            $( 'a[href^="https://' + workspaceURL + '.slack.com/messages/' + channelID + '"] .align-items-center').addClass("unread");
        }
    }
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

function retrieveSlackMessages(channelID, token) {
    return new Promise(function(resolve, reject) {
        // Retrieve conversation history
        let url = "https://slack.com/api/channels.history?token="+token+"&channel="+channelID+"&unreads=true&count=1";
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = async function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let resp = JSON.parse(xhr.responseText);
                if (resp['ok'] == true) {
                    var text = resp['messages'][0]['text'];
                    var user = resp['messages'][0]['user'];
                    var ts = resp['messages'][0]['ts'];
                    var unread = resp['unread_count_display'];
                    var time = timestampToDate(ts);
                    chrome.storage.local.get('slackUsers', function(result) {
                        var users = result.slackUsers;
                        var length = Object.keys(users).length
                        for (var i = 0; i < length; i++) {
                            let key = Object.keys(users)[i];
                            var sender = users[key];
                            text = text.replace(key, sender);
                        }
                        resolve([text, user, time, unread])
                    })
                } else {
                    const mssg = await retrieveIMSlackMessages(channelID, token);
                    resolve(mssg)
                }
            }
        }
        xhr.send();
    })
}

function retrieveIMSlackMessages(channelID, token) {
    return new Promise(function(resolve, reject) {
        // Retrieve conversation history
        let url = "https://slack.com/api/im.history?token="+token+"&channel="+channelID+"&unreads=true&count=1";
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let resp = JSON.parse(xhr.responseText);
                if (resp['messages'].length > 0) {
                    var text = resp['messages'][0]['text'];
                    var user = resp['messages'][0]['user'];
                    var ts = resp['messages'][0]['ts'];
                    var unread = resp['unread_count_display'];
                    var time = timestampToDate(ts);
                    chrome.storage.local.get('slackUsers', function(result) {
                        var users = result.slackUsers;
                        var length = Object.keys(users).length
                        for (var i = 0; i < length; i++) {
                            let key = Object.keys(users)[i];
                            var sender = users[key];
                            text = text.replace(key, sender);
                        }
                        resolve([text, user, time, unread])
                    })
                } else {
                    resolve(['/', '/', '/', '/'])
                }
            }
        }
        xhr.send();
    })
}

function retrieveSlackUsers(token) {
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
                //is this even legal
                chrome.storage.local.get('slackUsers', function(result) {
                    // Notify that we saved.
                    var allUsers = Object.assign({}, usersDictionary, result.slackUsers);
                    chrome.storage.local.set({slackUsers: allUsers}, function() { 
                        // Notify that we saved.
                        console.log('All users saved:');
                    }); 
                    resolve(allUsers);
                }); 
                // save slack users to storage
            }
        }
        xhr.send();
    })
}

function retrieveSlackChannels(token) {
    return new Promise(async function(resolve, reject) {
        const slackIMs = await retrieveSlackIMs(token);
        // Retrieve channel name
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
                    var allConvos = Object.assign({}, channelDictionary, slackIMs);
                    resolve(allConvos);
                }
            }
        xhr.send();
    })
}

    function retrieveSlackIMs(token) {
        return new Promise(function(resolve, reject) {
            // Retrieve channel name
            let url = "https://slack.com/api/im.list?token="+token;
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
                xhr.onreadystatechange = async function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        let resp = JSON.parse(xhr.responseText);
                        var imDictionary = {}
                        for (var i = 0; i < resp['ims'].length; i++) {
                            const user = await findUserName(resp['ims'][i]['user']);
                            let id = resp['ims'][i]['id'];
                            imDictionary[id] = user;
                        }
                        resolve(imDictionary);
                    }
                }
            xhr.send();
        })
    }

    function findUserName(userID) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get('slackUsers', function(result) {
                var users = result.slackUsers;
                var length = Object.keys(users).length
                for (var i = 0; i < length; i++) {
                    let key = Object.keys(users)[i];
                    var sender = users[key];
                    if (key == userID) {
                        resolve(sender);
                    }
                }
            }); 
        });
    }
});

