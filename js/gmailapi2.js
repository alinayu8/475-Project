var CLIENT_ID = '17382193749-1n7c8kk2iqok3up519fu00710i21vpgq.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDumxJ12BxSPmIZepjCFkx1Mg180TmpaIQ';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');



document.getElementById("authorize_button").onclick = function() {
	// handleClientLoad();
  // console.log(gapiPromise);
  handleAuthClick()
}

// document.addEventListener("load", handleClientLoad);

document.addEventListener('DOMContentLoaded', function(){
    handleClientLoad();
    // console.log(gapiPromise);
});

 function handleClientLoad() {
        gapi.load('client:auth2', initClient);
        console.log("LOADDEDDDD");
      }

      /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
      function initClient() {
        gapi.client.init({
          apiKey: 'AIzaSyDumxJ12BxSPmIZepjCFkx1Mg180TmpaIQ',
          clientId: '17382193749-1n7c8kk2iqok3up519fu00710i21vpgq.apps.googleusercontent.com',
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(function () {
          // gapi.auth2.init();	
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
          co
          console.log("LISTENINININGING");
          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        });
      }

      /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
      function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
          authorizeButton.style.display = 'none';
          signoutButton.style.display = 'block';
          listLabels();
        } else {
          authorizeButton.style.display = 'block';
          signoutButton.style.display = 'none';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
        // gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }




