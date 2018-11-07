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
        var auth_url = "https://slack.com/oauth/authorize?client_id=" + client_id + "&scope="+scopes + "&response_type=token";
        
        chrome.identity.launchWebAuthFlow({'url':auth_url,'interactive':true}, function(redirectUri){
            var codeurl = new URL(redirectUri);
            console.log(codeurl);
            var extractedCode = codeurl.searchParams.get("code");
            console.log("extracted code from slack auth" + extractedCode);
             $('#slack_auth').text("Slack authorized");
        });
    });
});
