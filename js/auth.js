//////////////////////////// SLACK AUTHENTICATION ////////////////////////////

var userTokenPresent; //this will be used to check if user is auth'd by checking undefined/empty
var localUserToken;
document.addEventListener('DOMContentLoaded', function() {	
	var authbutton = document.getElementById('auth'); //auth button which will kick off auth flow from options page
	var deauthbutton = document.getElementById('deauth'); //auth button which will kick off auth flow from options page
// 	authbutton.addEventListener('click', auth);
	retrieveToken();
	checkIfTokenPresent();
    authbutton.addEventListener('click', (function(e){
	    auth();
	 	e.preventDefault();
	 	var l = Ladda.create(this);
	 	l.start();
	 	setTimeout(l.stop, 3000); //simple spinner while waiting for auth flow to launch
	}));
	// deauthbutton.addEventListener('click', (function(e){
	//     deauth();
	//  	e.preventDefault();
	//  	var l = Ladda.create(this);
	//  	l.start();
	//  	setTimeout(l.stop, 3000); //simple spinner while waiting for auth flow to launch
	// }));
	injectToasty(); 
    injectStyle();
});

function auth() {
    var client_id = '276779340567.281527898741';
    var redirectUri = 'http://senecaonline.co/apps/sharetoslack/stsauth.php'//chrome.identity.getRedirectURL("oauth2");
    var scopes = 'chat:write:user, channels:read, groups:read, users:read';
    //var scopes = 'chat:write:user, channels:read, im:read, im:write, users:read, groups:read';    
    var auth_url = "https://slack.com/oauth/authorize?client_id=" + client_id + "&redirect_uri=" + redirectUri +"&scope="+scopes + "&response_type=token";
    chrome.identity.launchWebAuthFlow({'url':auth_url,'interactive':true}, function(redirectUri){
       // console.log("end of auth: " + redirectUri); remove console logging of authflow
        var tokenurl = new URL(redirectUri);
        var extractedToken = tokenurl.searchParams.get("access_token");
		//console.log("extracted token from slack auth" + extractedToken);  //remove console logging of saved token
		if (extractedToken == ""){
			console.log("no token granted");
			userTokenPresent = false;
		}
		else {
        	saveToken(extractedToken);
			var authbutton = document.getElementById('auth');
			authbutton.style = "display:none";
			var deauthbutton = document.getElementById('deauth');
			deauthbutton.style="";
			var result = document.getElementById('toast');
			result.innerHTML = "Authed Succesfully!";
			toastySuccess();
        }
        //chrome.runtime.sendMessage(extractedToken); previously using background js, no longer needed
    });}
    
function deauth() {
chrome.storage.sync.get('userToken', function(result){ // retrieves token from user's Chrome options
var tokenforcalls = result.userToken; 
var deauth_url = "https://slack.com/api/auth.revoke?token=" + tokenforcalls;
var xhr = new XMLHttpRequest();
xhr.open("POST", deauth_url, true);
xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
xhr.onreadystatechange = function(){
	if (xhr.readyState == XMLHttpRequest.DONE){
	var resp = (JSON.parse(xhr.responseText));
	if (resp.ok == false){
		console.log("unsuccesful deauth"); // checks to see if deauth to Slack was successful or not
	}
	if (resp.ok == true){
		console.log("successful deauth");
		chrome.storage.sync.remove("userToken", function() { //saves the token to the cloud
          // Notify that we saved.
          console.log('token removed');
		  userTokenPresent = false;
		 // console.log(token); remove console logging of token
        });

		var deauthbutton = document.getElementById("deauth");
		deauthbutton.style="display: none;";
		var authbutton = document.getElementById("auth");
		authbutton.style = "";
		var result = document.getElementById('toast');
		result.innerHTML = "Revoked Token Succesfully!";
		toastySuccess();
	}
	console.log(resp);
	}
}

xhr.send();
        //chrome.runtime.sendMessage(extractedToken); previously using background js, no longer needed
    });}
    
//Saves the token to the user's Chrome storage
function saveToken(retrievedToken) {//retrieved token is the token passed to to this function upon auth completion
        var token = retrievedToken;
        chrome.storage.sync.set({userToken: token}, function() { //saves the token to the cloud
          // Notify that we saved.
          console.log('Settings saved:');
		  userTokenPresent = true;
		 // console.log(token); remove console logging of token
        });
      }
      
function checkIfTokenPresent(){
	var authbutton = document.getElementById('auth');
	var deauthbutton = document.getElementById('deauth');
	chrome.storage.sync.get('userToken', function(result){ 
		localUserToken =  result.userToken;
		if (localUserToken == null || undefined){
		authbutton.innerHTML = "Auth";
		deauthbutton.style="display:none";
	}
	else {
			authbutton.style = "display:none";
			deauthbutton.style = "";
		}
		});
}


function retrieveToken(){
	userTokenPresent = false;
}
      
function injectStyle(){
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.rel = 'stylesheet';
	script.type = 'text/javascript';
	script.src = 'jquery-3.2.1.min.js';
	

	var script1 = document.createElement('script');
	script1.rel = 'stylesheet';
	script1.type = 'text/javascript';
	script1.src = 'spin.min.js';
	
	var script2 = document.createElement('script');
	script2.rel = 'stylesheet';
	script2.type = 'text/javascript';
	script2.src = 'ladda.min.js';
	
	var style1 = document.createElement('link');
	style1.rel = 'stylesheet';
	style1.type = 'text/css';
	style1.href = 'ladda-themeless.min.css';
	
	var style2 = document.createElement('link');
	style2.rel = 'stylesheet';
	style2.type = 'text/css';
	style2.href = 'bootstrap.min.css';
	
	head.appendChild(script);
	head.appendChild(style2);
	head.appendChild(style1);
	head.appendChild(script1);
	head.appendChild(script2);
	
	console.log('loading button css');
}

//inject toast CSS file
function injectToasty(){
	var head = document.getElementsByTagName('head')[0];
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = 'toast.css';
	head.appendChild(style);
	console.log('loading toasty css');
}


function toastySuccess() {
    // Get the snackbar DIV
    var x = document.getElementById("toast");

    // Add the "show" class to DIV
    x.className = "showSuccess";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("showSuccess", ""); }, 3000);
}