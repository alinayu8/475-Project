$(document).ready(function() {
    // Redirect to Slack
    $('#slack_auth').click(function() {
        // Reset token for now
        var resetToken = '';
        chrome.storage.sync.set({'slackUserToken':resetToken}, function() { //saves the token to the cloud
            console.log('Settings saved: ' + resetToken);
         });

        var client_id = '347262053333.468176603908';
        var redirectUri = 'https://fbabmokcobpglljmaeemkelecckeabfe.chromiumapp.org/'; //chrome.identity.getRedirectURL("oauth2");
        var scopes = 'channels:history,groups:history,im:history,mpim:history';
        var auth_url = "https://slack.com/oauth/authorize?client_id=" + client_id + "&redirect_uri=" + redirectUri + "&scope="+scopes + "&response_type=token";
        
        chrome.identity.launchWebAuthFlow({'url':auth_url,'interactive':true}, function(redirectUri){
             console.log("end of auth: " + redirectUri); //remove console logging of authflow

             // Getting Verification code
             var codeurl = new URL(redirectUri);
             var verificationCode = codeurl.searchParams.get("code");   
             
             // Extracting token
            var client_secret = "0b0d0d2d5c3de16dab2ab80c869b657f";
            var something = "client_id=" + client_id + "&?client_secret=" + client_secret + "&?";
            //var something = "";
            var tokenurl = "https://slack.com/api/oauth.access?" + something + "code=" + verificationCode + "&redirect_uri=" + redirectUri;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", tokenurl, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var resp = JSON.parse(xhr.responseText);
                    console.log('response' + resp);
                }
                console.log('NOOOOO');
            }
            var extractedToken = "xoxp-347262053333-347262053381-468153837988-3e259b55e98e2c781d8ebe8f400861e5";

             console.log("extracted token from slack auth " + extractedToken);  //remove console logging of saved token
             if ((extractedToken == "") || (extractedToken == null)) {
                 console.log("no token granted");
             } else {
                 saveSlackToken(extractedToken);
                 $('#slack_auth').text("Slack authorized");
             }
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
        console.log('retrieving' + result.slackUserToken);
        var tokenforcalls = result.slackUserToken;
        var testChannel = "CA80JMH0E";
        //var url = "https://slack.com/api/channels.history?token="+tokenforcalls+"&channel="+testChannel+"&unreads=false&pretty=1&as_user=true";
        var url = "https://slack.com/api/channels.history?token="+tokenforcalls+"&channel="+testChannel+"&unreads=true&pretty=1&as_user=true";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var resp = JSON.parse(xhr.responseText);
                console.log(resp);
            }
        }
        xhr.send();
    });
}