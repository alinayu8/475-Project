// var gapiPromise = (function(){
//   var deferred = $.Deferred();
//   window.onLoadCallback = function(){
//     deferred.resolve(gapi);
//   };
//   return deferred.promise()
// }());


//  function handleClientLoad() {
//         // Loads the client library and the auth2 library together for efficiency.
//         // Loading the auth2 library is optional here since `gapi.client.init` function will load
//         // it if not already loaded. Loading it upfront can save one network request.
//         gapiPromise.then(function(){ 
//           gapi.load('client:auth2', initClient);
//         });
        
//       }

//       function initClient() {
//         // Initialize the client with API key and People API, and initialize OAuth with an
//         // OAuth 2.0 client ID and scopes (space delimited string) to request access.
//         gapiPromise.then(function(){ 
//           gapi.client.init({
//             apiKey: 'AIzaSyDumxJ12BxSPmIZepjCFkx1Mg180TmpaIQ',
//             discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
//             clientId: '17382193749-ohr12l4hpuefgsm0nqevnpugdoje5i7u.apps.googleusercontent.com',
//             scope: 'https://www.googleapis.com/auth/gmail.readonly'
//         }).then(function () {
//           // Listen for sign-in state changes.
//           gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

//           // Handle the initial sign-in state.
//           updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
//         });
//         });
       
//       }

//       function updateSigninStatus(isSignedIn) {
//         // When signin status changes, this function is called.
//         // If the signin status is changed to signedIn, we make an API call.
//         if (isSignedIn) {
//           makeApiCall();
//         }
//       }

//      function handleSignInClick(event) {
//         // Ideally the button should only show up after gapi.client.init finishes, so that this
//         // handler won't be called before OAuth is initialized.

//         gapiPromise.then(function(){ 
//             gapi.auth2.getAuthInstance().signIn();
//         });
        
//       }

//       function handleSignOutClick(event) {
//         gapi.auth2.getAuthInstance().signOut();
//       }

//       function makeApiCall() {
//         // Make an API call to the People API, and print the user's given name.
//         // gapi.client.people.people.get({
//         //   // 'resourceName': 'people/me',
//         //   // 'requestMask.includeField': 'person.names'
//         // }).then(function(response) {
//         //   console.log('Hello, ' + response.result.names[0].givenName);
//         // }, function(reason) {
//         //   console.log('Error: ' + reason.result.error.message);
//         // });
//       }



window.onLoadCallback = function() {
   console.log("HELLO")
   initClient()
   handleClientLoad()
 }

document.getElementById("authorize_button").onclick = function() {
  console.log(gapi.client)
  handleAuthClick()

}

// Client ID and API key from the Developer Console

      
      // var head = document.getElementsByTagName('head')[0];
      // var script = document.createElement('script');
      // script.type = 'text/javascript';
      // script.src = "https://apis.google.com/js/client.js?onload=callbackFunction";
      // head.appendChild(script);



      var CLIENT_ID = '17382193749-ohr12l4hpuefgsm0nqevnpugdoje5i7u.apps.googleusercontent.com';
      var API_KEY = 'AIzaSyDumxJ12BxSPmIZepjCFkx1Mg180TmpaIQ';

      // Array of API discovery doc URLs for APIs used by the quickstart
      var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

      var authorizeButton = document.getElementById('authorize_button');
      var signoutButton = document.getElementById('signout_button');

      /**
       *  On load, called to load the auth2 library and API client library.
       */
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
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);


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

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }

      /**
       * Print all Labels in the authorized user's inbox. If no labels
       * are found an appropriate message is printed.
       */
      function listLabels() {
        gapi.client.gmail.users.labels.list({
          'userId': 'me'
        }).then(function(response) {
          var labels = response.result.labels;
          appendPre('Labels:');

          if (labels && labels.length > 0) {
            for (i = 0; i < labels.length; i++) {
              var label = labels[i];
              appendPre(label.name)
            }
          } else {
            appendPre('No Labels found.');
          }
        });
      }


 
