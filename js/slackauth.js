$(document).ready(function() {  
    // Check Slack whenever refreshing
    checkSlack();

    // Slack Auth button
    $('#slack_auth').click(function() {
        authenticateSlack();
    });

    // Get Slack access token
    function authenticateSlack() {
        var redirectUri = "https://pobjdimebdonkghjachofmnflfjmmmgl.chromiumapp.org/"
        var client_id = '347262053333.468176603908';
        var enc_client_secret = 'MGIwZDBkMmQ1YzNkZTE2ZGFiMmFiODBjODY5YjY1N2Y='; //encoded
        var scopes = 'channels:history,groups:history,channels:read,im:read,im:history,users:read,team:read';
        var auth_url = "https://slack.com/oauth/authorize?client_id=" + client_id + "&scope=" + scopes + "&response_type=token";
        
        chrome.identity.launchWebAuthFlow({'url':auth_url,'interactive':true}, function(redirectUri){
            var redirectUri = "https://pobjdimebdonkghjachofmnflfjmmmgl.chromiumapp.org/"
             console.log("Authenticating through " + redirectUri);

             // Getting Verification code
             var codeurl = new URL(redirectUri);
             var verificationCode = codeurl.searchParams.get("code");

             // Getting Access token
            var xhr = new XMLHttpRequest();
            var url = 'https://slack.com/api/oauth.access?client_id=' + client_id + '&client_secret=' + window.atob(enc_client_secret) + '&code=' + verificationCode;
            
            // Saving access token
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
    }
    
    // Saves the token to the user's Chrome storage (well, first gets the existing slack token)
   function saveSlackToken(retrievedToken) { 
        chrome.storage.sync.get('slackUserToken', async function(result) { 
            if (typeof result.slackUserToken === 'undefined' || result.slackUserToken.length == 0) {
                var tokens = [retrievedToken]; // initializing token array
            } else {
                console.log('length: ' + result.slackUserToken.length)
                var tokens = result.slackUserToken; // adding token to token array
                tokens.push(retrievedToken);
            }
            await saveTokenToCloud(tokens)
        });
    }

    // Actually saves to storage
    function saveTokenToCloud(tokens) {
        chrome.storage.sync.set({'slackUserToken':tokens}, function() { // saves the token
            console.log('Tokens saved: ' + tokens);
        });
    }

    ////////////////////////////// FOLLOWING FUNCTIONS ARE USED FOR ADDING AND UPDATING MESSAGES //////////////////////////////

    // Continuously update messages every minute
    setInterval(checkSlack, 60000);

    // Updates Slack messages
    function checkSlack() {
        console.log("refreshing messages!");
        chrome.storage.sync.get('slackUserToken', async function(result){
            if (typeof result.slackUserToken !== 'undefined') { // if no tokens even exist yet
                let tokens = result.slackUserToken;
                for (var i = 0; i < tokens.length; i++) { // loop through all Slack accounts
                    var token = tokens[i];
                    // Retrieve and save list of users from API asynchronously
                    await retrieveSlackUsers(token);
                    // Retrieve and save list of channels from API asynchronously
                    const channelDictionary = await retrieveSlackChannels(token);

                    // Check whether or not to add new channel or merely update channel
                    for (var j = 0; j < Object.keys(channelDictionary).length; j++) {
                        let key = Object.keys(channelDictionary)[j];
                        let channelName = channelDictionary[key];
                        if ($('a[href*="'+ key +'"]').length == 0) {
                            await addSlackConversations(token, key, channelName);
                            console.log("new channel")
                        } else {
                            await updateSlackConversations(token, key, channelName);
                            console.log("existing channel")
                        }                        
                    }
                }
            }
            saveConvo();
        });
    }

    // Add the HTML for the Slack conversations 
    async function addSlackConversations(token,channelID,channelName) {
        const slackArray = await retrieveSlackMessages(channelID, token);
        if (slackArray[2] != "/" && typeof slackArray[1] !== 'undefined') { // if conversation is empty, do not add
            console.log("adding message...");
            let message = slackArray[0];
            let mssgUser = slackArray[1];
            const sender = await findUserName(mssgUser);
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
            console.log($('#nav-unassigned .dragula-container').html())
        }
    } 

    // Instead of adding new HTML, simply update it
    async function updateSlackConversations(token,channelID,channelName) {
        const slackArray = await retrieveSlackMessages(channelID, token);
        if (slackArray[2] != "/" && typeof slackArray[1] !== 'undefined') { // if conversation is empty, do not add
            console.log('existing channel ' + channelID + ' that is non-empty');
            const workspaceDetails = await retrieveURL(token);
            let workspaceName = workspaceDetails[0];
            let workspaceURL = workspaceDetails[1];

            let message = slackArray[0];
            let mssgUser = slackArray[1];
            let time = slackArray[2];
            let unreadCount = slackArray[3];
            const sender = await findUserName(mssgUser);

            if (unreadCount > 0) {
                var unread = 'unread';
                // Add unread attribute with this href
                $('a[href*="'+ channelID +'"] .align-items-center').addClass("unread");
            } else {
                var unread = '';
                // Remove unread attribute with this href
                $( 'a[href*="'+ channelID +'"] .align-items-center').removeClass("unread");
            }

            var og_time = $('a[href^="https://' + workspaceURL + '.slack.com/messages/' + channelID + '"] .messageTime').text().trim();
            var og_time_length = $('a[href^="https://' + workspaceURL + '.slack.com/messages/' + channelID + '"]').length;
            
            if (og_time_length == 0) { // Check if message didn't exist before, if not, then must populate
                console.log('channel is populated now');
        
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
            } else if (time != og_time) { // Check if message time is different
                console.log('updating channel');
                var mssg_sender = sender + ': ' + message

                // // Replace sender and message with this href
                $('a[href*="'+ channelID +'"] .messageContent').html('<p>' + mssg_sender + '</p>');
                // // Replace time with this href
                $('a[href*="'+ channelID +'"] .messageTime').html('<p>' + time + '</p>');
            }
        } else { // if conversations is empty, remove HTML from text thingy
            console.log('existing channel ' + channelID + ' that no longer has messages');
            $('a[href*="'+ channelID +'"]').remove();
        }
    }

    ////////////////////////////// FOLLOWING FUNCTIONS ARE USED FOR API CALLS //////////////////////////////

    // Retrieve and return Slack channel names and IDs
    function retrieveSlackUsers(token) {
        return new Promise(function(resolve, reject) {
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
                    
                    // Really sketch storage calling and setting
                    chrome.storage.local.get('slackUsers', function(result) {
                        // Combine currently saved Slack users with new users
                        var allUsers = Object.assign({}, usersDictionary, result.slackUsers);
                        chrome.storage.local.set({slackUsers: allUsers}, function() { 
                            console.log('All users saved');
                        }); 
                        resolve(allUsers);
                    }); 
                }
            }
            xhr.send();
        })
    }

    // Retrieve and return Slack channel names and IDs (also saves URL to cloud)
    function retrieveSlackChannels(token) {
        return new Promise(async function(resolve, reject) {
            const slackIMs = await retrieveSlackIMs(token);
            let url = "https://slack.com/api/channels.list?token="+token+"&exclude_members=true";
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
                xhr.onreadystatechange = async function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        let resp = JSON.parse(xhr.responseText);
                        var channelDictionary = {}
                        for (var i = 0; i < resp['channels'].length; i++) {
                            let name = resp['channels'][i]['name'];
                            let id = resp['channels'][i]['id'];
                            channelDictionary[id] = name;
                        }
                        // Combine channel convos with im convos
                        var allConvos = Object.assign({}, channelDictionary, slackIMs);
                        resolve(allConvos);
                    }
                }
            xhr.send();
        })
    }

    // Retrieve and return Slack IM receipients and IDs
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

    // Retrieve and return Slack channel message details (and return IM message details if not channel)
    function retrieveSlackMessages(channelID, token) {
        return new Promise(function(resolve, reject) {
            // Retrieve conversation history
            let url = "https://slack.com/api/channels.history?token="+token+"&channel="+channelID+"&unreads=true&count=1";
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = async function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    let resp = JSON.parse(xhr.responseText);
                    if (resp['ok'] == true) { // If CHANNEL message
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
                    } else { // If IM message
                        const mssg = await retrieveIMSlackMessages(channelID, token);
                        resolve(mssg)
                    }
                }
            }
            xhr.send();
        })
    }

    // Retrieve and return Slack IM message details (and return empty array if the message is empty)
    function retrieveIMSlackMessages(channelID, token) {
        return new Promise(function(resolve, reject) {
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
                        resolve(['/', '/', '/', '/']) // empty conversation
                    }
                }
            }
            xhr.send();
        })
    }

    // Retrieve and return Slack workspace name and domain
    function retrieveURL(token) {
        return new Promise(function(resolve, reject) {
            // Retrieve workspace info
            let url = "https://slack.com/api/team.info?token="+token+"&pretty=1";
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    let resp = JSON.parse(xhr.responseText);
                    let name = resp['team']['name'];
                    let domain = resp['team']['domain'];
                    resolve([name, domain]); // send team name and workspace domain
                }
            }
            xhr.send();
        })
    }

    ////////////////////////////// FOLLOWING FUNCTIONS ARE GENERAL //////////////////////////////

    // Reformat time
    function timestampToDate(timestamp) {
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

    // Find particular name using user ID from Chrome cloud storage
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
                resolve('undefined');
            }); 
        });
    }

    function saveConvo() {
        var tab_content = $("#nav-tabContent").html();
        if (typeof tab_content !== 'undefined') {
            chrome.storage.local.set({content: tab_content}, function() {
                console.log('Settings saved:');
            });
        }
    }
});

