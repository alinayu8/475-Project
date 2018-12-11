// Uncomment the 2 lines below to restart the signing up process
// Make sure to recomment them and reload the page before proceeding

// localStorage.clear()
// chrome.storage.sync.clear()

// UPDATE FUNCTIONS

window.onload = update_page()

function update_page() {
  updateCover()
  // var firstTime = first_time(function(result) {
  //   return result
  // });
  // console.log(firstTime)
  if (inSetUp()) {
    console.log("in set up")
    setUpPages()
    return
  }
  else if (first_time()) { 
    console.log("setting up")
    setUp() 
  }
  else if (window.location.pathname == "/newTab.html") {
    update_badges()
    update_copy()
    update_dnd()
  }
}

// SET UP FUNCTIONS

// Check if this is their first time using the app

// Since getting variables from chrome storage is an asnc call
// we save "name" in chrome and local storage, and check if name 
// has been set in local storage to determine if set up has occured
function first_time() {
  // chrome.storage.sync.get(['name'], function(result) {
  //   console.log('Name is currently' + result.name)
  //   console.log(result.name == null)
  //   if (result.name == null) { 
  //     console.log("first time")
  //     var firstTime = true 
  //   } else {
  //     console.log("not first time")
  //     var firstTime = false
  //   }
  //   console.log(firstTime)
  //   callback(firstTime)
  // })
  var name = localStorage.getItem("name")
  if (name == null) {return true}
  return false
}

function setUp() {
  window.location = "start.html"
}

// If first time, then set up everything

function inSetUp() {
  setupPages = ["/start.html", "/start_accounts.html"]
  for (i=0; i < setupPages.length; i++) {
    if (window.location.pathname == setupPages[i]) {
      return true
    }
  }
  return false
}

function setUpPages() {
  let path = window.location.pathname
  if (path == "/start.html") {setUpStartPage()}
  else if (path == "/start_accounts.html") {setUpAccountsPage()}
}

function setUpStartPage() {
  document.getElementsByClassName("nameInput")[0].focus()
  document.getElementsByClassName("nameSaveBtn")[0].addEventListener('click', saveName)
}

function setUpAccountsPage() {
  document.getElementsByClassName("nameBackBtn")[0].addEventListener('click', function() {
    window.location = "start.html"
  })
  document.getElementsByClassName("accountSaveBtn")[0].addEventListener('click', saveAccounts);
}

function saveName() {
  var name = document.getElementsByClassName("nameInput")[0].value
  chrome.storage.sync.set({'name':name}, function() { //saves the name to the cloud
    console.log('Name saved: ' + name);
  }); 
  localStorage.setItem("name", name)
  if (inSetUp()) {
    window.location = "start_accounts.html"
  }
}

function saveAccounts() {
  if (inSetUp()) {
    window.location = "newTab.html"
  }
}

function updateCover() {
  if (inSetUp()) {
    document.body.setAttribute("style", `
      background: url(https://source.unsplash.com/bF2vsubyHcQ) no-repeat center center fixed;
      -webkit-background-size: cover;
      -moz-background-size: cover;
      -o-background-size: cover;
      background-size: cover;
    `)
  }
}

// NORMAL PAGE UPDATES (post set up)

// Update number of unread messages

function update_badges() {
  update_tab_badges()
  update_badges_copy()
}

function update_tab_badges() {
  tabs = document.getElementsByClassName('nav-link')
  for (i = 0; i < tabs.length; i++) {
    update_tab_badge(tabs[i])
  }
}

function update_tab_badge(tab) {
  messages_id = tab.getAttribute('href').substring(1)
  messages = document.getElementById(messages_id)
  badge = tab.getElementsByClassName('badge')[0]
  num_unread = messages.getElementsByClassName('unread').length
  if (num_unread > 0) {
    badge.innerHTML = `${num_unread} unread`
  }
}

function update_badges_copy() {
  total_unread = document.getElementsByClassName('unread').length
  document.title = `(${total_unread}) Cluster`
  greetingMessage = document.getElementsByClassName('messagesCountHeader')[0]
  if (total_unread > 1) {
    greetingMessage.innerHTML = `You have ${total_unread} unread messages.`
  } else if (total_unread == 1) {
    greetingMessage.innerHTML = `You have ${total_unread} unread message.`
  } else {
    greetingMessage.innerHTML = 'You have no unread messages.'
  }
}

// Update copy such as greeting message
function update_copy() {
  update_greeting()
}

function update_greeting() {
  header = document.getElementsByClassName("greeting")[0].getElementsByTagName("h1")[0]
  headerTimeOfDay = header.getElementsByClassName("timeOfDay")[0]
  greeting = getGreeting()
  headerTimeOfDay.innerHTML = `Good ${greeting},`
  chrome.storage.sync.get(['name'], function(result) {
    console.log('Name is currently' + result.name)
    headerName = header.getElementsByClassName("name")[0]
    headerName.innerHTML = `${result.name}.`
  })
}

function getGreeting() {
  date = new Date()
  hour = date.getHours()
  if (hour >= 5 && hour < 12) {
    greeting = "Morning"
  } else if (hour >= 12 && hour < 17) {
    greeting = "Afternoon"
  } else {
    greeting = "Evening"
  }
  return greeting
}

// Add event listeners for do not disturb

function update_dnd() {
  let dndButton = document.getElementsByClassName('dndIcon')[0]
  dndButton.addEventListener('click', updateDndButton)
  chrome.storage.sync.get(['dnd'], function(result) {
    console.log('dnd is currently ' + result.dnd)
    if (result.dnd == "true") {hideMessages()}
    else {showMessages()}
  })
}

function updateDndButton() {
  let dndButton = document.getElementsByClassName('dndIcon')[0]
  if (dndButton.classList.contains('dndMode')) {
    chrome.storage.sync.set({'dnd': "false"}, function() { //saves the name to the cloud
      console.log('dnd saved: ' + "false");
    }); 
    showMessages()
  } else {
    chrome.storage.sync.set({'dnd': "true"}, function() { //saves the name to the cloud
      console.log('dnd saved: ' + "true");
    });
    hideMessages()
  }
}

function showMessages() {
  dndButton = document.getElementsByClassName('dndIcon')[0]
  dndButton.classList.remove('dndMode')
  document.getElementsByClassName('messagesCountHeader')[0].style.display = 'block';
  document.getElementsByClassName('messageTabs')[0].style.display = 'block';
  document.getElementsByClassName('messageBox')[0].style.display = 'block';
}

function hideMessages() {
  dndButton = document.getElementsByClassName('dndIcon')[0]
  dndButton.classList.add('dndMode')
  document.getElementsByClassName('messagesCountHeader')[0].style.display = 'none';
  document.getElementsByClassName('messageTabs')[0].style.display = 'none';
  document.getElementsByClassName('messageBox')[0].style.display = 'none';
}