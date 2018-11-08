$(document).ready(function() {
    // Redirect to Slack -- STILL SPECIFIC TO ALINA'S WORKSPACE OF MT2018-2019
    $('#slack_auth').click(function() {
        // Reset token for now
        var resetToken = '';
        chrome.storage.sync.set({'slackUserToken':resetToken}, function() { //saves the token to the cloud
            console.log('Settings saved: ' + resetToken);
        });

        var client_id = '347262053333.468176603908';
        var enc_client_secret = 'MGIwZDBkMmQ1YzNkZTE2ZGFiMmFiODBjODY5YjY1N2Y='; //encoded
        var scopes = 'channels:history,groups:history,im:history,mpim:history';
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
        addSlackMessages();
    });
});

//Saves the token to the user's Chrome storage
function saveSlackToken(retrievedToken) {//retrieved token is the token passed to to this function upon auth completion
    chrome.storage.sync.set({'slackUserToken':retrievedToken}, function() { //saves the token to the cloud
      console.log('Settings saved: ' + retrievedToken);
    });
  }


function addSlackMessages() {
    chrome.storage.sync.get('slackUserToken', function(result){ // retrieves token from user's Chrome options
        var tokenforcalls = result.slackUserToken;

        // Retrieve conversation history
        var testChannel = "CA6SB5GDA";
        var url = "https://slack.com/api/channels.history?token="+tokenforcalls+"&channel="+testChannel+"&unreads=true&pretty=1&as_user=true&count=1";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var resp = JSON.parse(xhr.responseText);
                console.log(resp);
            }
        }
        xhr.send();

        // Retrieve users in conversation
        // Retrieve channel name
    });
}
