 
 window.onload = function() {
    document.getElementById('authorize_button').addEventListener('click', function() {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
        console.log(token);
      //    chrome.runtime.onMessage.addListener(
      //   function(request,sender,sendResponse){
      //     var gapiRequestUrlAndToken = "https://www.googleapis.com/gmail/v1/users/mail%40gmail.com/threads?key={" + thisToken + "}"

      //     var makeGetRequest = function (gapiRequestURL)
      //       {
      //           var xmlHttp = new XMLHttpRequest();
      //           xmlHttp.open( "GET", gapiRequestURL, false );
      //           xmlHttp.send( null );
      //           return xmlHttp.responseText;
      //       }

      //     makeGetRequest(gapiRequestUrlAndToken);
      //   }
      // );
      });
      
    });

    document.getElementById('signout_button').addEventListener('click', function() {
    	chrome.identity.launchWebAuthFlow(
		    { 'url': 'https://accounts.google.com/logout' },
		    function(tokenUrl) {
		        responseCallback();
		    }
		);
    })
  };

