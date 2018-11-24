// Uncomment the below line to restart the signing up process
// Make sure to recomment it and reload the page before proceeding

//  localStorage.clear()
// chrome.storage.sync.clear()

// UPDATE FUNCTIONS

window.onload = update_page()

function update_page() {
  updateCover()
  if (window.location.pathname == "/start.html") {
    setUpStartPage()
    return
  }
  else if (first_time()) { setUp() }
  else if (window.location.pathname == "/newTab.html") {
    update_badges()
    update_copy()
  }
}

// SET UP FUNCTIONS

// Check if this is their first time using the app

function first_time() {
  let result = chrome.storage.sync.get(['name'], function(result) {
    console.log('Name is currently' + result.name)
  })
  var name = result.name
  if (name == null || name == "") { return true }
  return false
}

function setUp() {
  name = "";
  localStorage.setItem("name", name)
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

function setUpStartPage() {
  document.getElementsByClassName("nameInput")[0].focus()
  document.getElementsByClassName("nameSaveBtn")[0].addEventListener('click', saveName)
}

function saveName() {
  var name = document.getElementsByClassName("nameInput")[0].value
  // localStorage.setItem("name", name)
  chrome.storage.sync.set({'name':name}, function() { //saves the name to the cloud
    console.log('Name saved: ' + name);
  });
  if (inSetUp()) {
    window.location = "start_accounts.html"
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
  greetingMessage = document.getElementsByClassName('greeting')[0].getElementsByTagName('h3')[0]
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
  headerName = header.getElementsByClassName("name")[0]
  headerName.innerHTML = `${localStorage.getItem("name")}.`
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