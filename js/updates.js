// Uncomment the 2 lines below to restart the signing up process
// Make sure to recomment them and reload the page before proceeding

// localStorage.clear()
// chrome.storage.sync.clear()

// UPDATE FUNCTIONS
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

window.onload = update_page()

function update_page() {
  load_theme()
  if (inSetUp()) {
    console.log("in set up")
    setUpPages()
    return
  }
  else if (first_time()) {
    console.log("setting up")
    setUp()
  }
  else if (inSettings()) {
    updateSettingsInfo()
  }
  else if (window.location.pathname == "/newTab.html") {
    updateNewTab()
  }
}

// SET UP FUNCTIONS

// Check if this is their first time using the app

// Since getting variables from chrome storage is an asnc call
// we save "name" in chrome and local storage, and check if name 
// has been set in local storage to determine if set up has occured
function first_time() {
  var name = localStorage.getItem("name")
  if (name == null) { return true }
  return false
}

function setUp() {
  window.location = "start.html"
}

// If first time, then set up everything

function inSetUp() {
  setupPages = ["/start.html", "/start_accounts.html", "/start_groups.html", "/start_theme.html"]
  for (i = 0; i < setupPages.length; i++) {
    if (window.location.pathname == setupPages[i]) {
      return true
    }
  }
  return false
}

function setUpPages() {
  let path = window.location.pathname
  if (path == "/start.html") { setUpStartPage() }
  else if (path == "/start_accounts.html") { setUpAccountsPage() }
  else if (path == "/start_groups.html") {setUpGroupsPage()}
  else if (path == "/start_theme.html") {setUpThemePage()}

}

function setUpStartPage() {
  document.getElementsByClassName("nameInput")[0].focus()
  document.getElementsByClassName("nameSaveBtn")[0].addEventListener('click', saveName)
}

function setUpAccountsPage() {
  console.log("setting up accounts page")
  document.getElementsByClassName("nameBackBtn")[0].addEventListener('click', function () {
    window.location = "start.html"
  })
  document.getElementsByClassName("accountSaveBtn")[0].addEventListener('click', saveAccounts);
}

function setUpGroupsPage() {
  document.getElementsByClassName("accountBackBtn")[0].addEventListener('click', function () {
    window.location = "start_accounts.html"
  })
  document.getElementsByClassName("groupSaveBtn")[0].addEventListener('click', saveGroupInSetUp);
  updateIconBtns()
}

function setUpThemePage() {
  document.getElementsByClassName("groupBackBtn")[0].addEventListener('click', function () {
    window.location = "start_groups.html"
  })
  document.getElementsByClassName("themeSaveBtn")[0].addEventListener('click', saveThemeInSetUp);
  updateThemeBtns()
}

function saveName() {
  var name = document.getElementsByClassName("nameInput")[0].value
  chrome.storage.sync.set({ 'name': name }, function () { //saves the name to the cloud
    console.log('Name saved: ' + name);
  });
  localStorage.setItem("name", name)
  if (inSetUp()) {
    window.location = "start_accounts.html"
  }
}

function saveAccounts() {
  console.log("Saving accounts")
  if (inSetUp()) {
    window.location = "start_groups.html"
    loadGroups()
  }
}

function saveGroupInSetUp() {
  saveGroup()
  if (inSetUp()) {
    window.location = "start_theme.html"
  }
}

function saveThemeInSetUp() {
  saveTheme()
  if (inSetUp()) {
    window.location = "newTab.html"
  }
}

// NORMAL PAGE UPDATES (post set up)

function updateNewTab() {
  load_sections()
  load_theme()
  update_badges()
  update_copy()
  update_dnd()
}

// Load in things from the user's settings
function load_sections() {
  chrome.storage.sync.get(['group1Icon'], function (result) {
    console.log('group1Icon is currently' + result.group1Icon)
    group1Icon = document.getElementsByClassName('groupIcon')[1]
    group1Icon.className = result.group1Icon
    group1Icon.classList.add('groupIcon')
    group1Icon.classList.add('mr-1')
  })
  chrome.storage.sync.get(['group1Title'], function (result) {
    console.log('group1Title is currently' + result.group1Title)
    group1Title = document.getElementsByClassName('groupTitle')[1]
    group1Title.innerHTML = result.group1Title
  })
  chrome.storage.sync.get(['group2Icon'], function (result) {
    console.log('group2Icon is currently' + result.group2Icon)
    group2Icon = document.getElementsByClassName('groupIcon')[2]
    group2Icon.className = result.group2Icon
    group2Icon.classList.add('groupIcon')
    group2Icon.classList.add('mr-1')
  })
  chrome.storage.sync.get(['group2Title'], function (result) {
    console.log('group2Title is currently' + result.group2Title)
    group2Title = document.getElementsByClassName('groupTitle')[2]
    group2Title.innerHTML = result.group2Title
  })
}

function load_theme() {
  chrome.storage.sync.get({'themeLink': 'https://source.unsplash.com/bF2vsubyHcQ'}, function (result) {
    console.log('themeLink is currently' + result.themeLink)
    document.body.setAttribute("style", `
    color: #fff;
    background: url(${result.themeLink}) no-repeat center center fixed;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    `)
  })
}

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
  chrome.storage.sync.get(['name'], function (result) {
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
  chrome.storage.sync.get(['dnd'], function (result) {
    console.log('dnd is currently ' + result.dnd)
    if (result.dnd == "true") { hideMessages() }
    else { showMessages() }
  })
}

function updateDndButton() {
  let dndButton = document.getElementsByClassName('dndIcon')[0]
  if (dndButton.classList.contains('dndMode')) {
    chrome.storage.sync.set({ 'dnd': "false" }, function () { //saves the name to the cloud
      console.log('dnd saved: ' + "false");
    });
    showMessages()
  } else {
    chrome.storage.sync.set({ 'dnd': "true" }, function () { //saves the name to the cloud
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

// CHANGING USER SETTINGS

function inSettings() {
  return window.location.pathname == "/user_settings.html"
}

function updateSettingsInfo() {
  loadSettings()
  updateSaveBtn()
  updateIconBtns()
  updateAccountsBtns()
  updateThemeBtns()
}

// Load in previous user settings

function loadSettings() {
  loadGroups()
  // loadAccounts()
  load_theme()
}

function loadGroups() {
  chrome.storage.sync.get({'group1Icon': 'fa fa-users'}, function (result) {
    group1Icon = document.getElementsByClassName('iconSelect')[0].childNodes[1].childNodes[1].childNodes[1]
    group1Icon.className = result.group1Icon
  })
  chrome.storage.sync.get({'group1Title': 'Social'}, function (result) {
    group1Title = document.getElementsByClassName('groupTitleInput')[0]
    group1Title.value = result.group1Title
  })
  chrome.storage.sync.get({'group1Time': '0'}, function (result) {
    group1TimeSelect = document.getElementsByClassName("groupTimeSelect")[0]
    group1Title.selectedIndex = getSelectedIndexFromTime(result.group1Time)
  })
  chrome.storage.sync.get({'group2Icon': 'fa fa-graduation-cap'}, function (result) {
    group2Icon = document.getElementsByClassName('iconSelect')[1].childNodes[1].childNodes[1].childNodes[1]
    group2Icon.className = result.group2Icon
  })
  chrome.storage.sync.get({'group2Title': 'School'}, function (result) {
    group2Title = document.getElementsByClassName('groupTitleInput')[1]
    group2Title.value = result.group2Title
  })
  chrome.storage.sync.get({'group2Time': '0'}, function (result) {
    group2TimeSelect = document.getElementsByClassName("groupTimeSelect")[1]
    group2Title.selectedIndex = getSelectedIndexFromTime(result.group2Time)
  })
}

function getSelectedIndexFromTime(timeVal) {
  timeVal = parseInt(timeVal)
  if (timeVal <= 2) {
    return String(timeVal)
  } else if (timeVal == 6) {
    return String(3)
  } else if (timeVal == 8) {
    return String(4)
  } else if (timeVal == 12) {
    return String(5)
  } else if (timeVal == 24) {
    return String(6)
  }
  return 0
}

// Save Functions

function updateSaveBtn() {
  saveBtn = document.getElementsByClassName("saveIcon")[0]
  saveBtn.addEventListener('click', saveInfo)
}

function saveInfo() {
  saveGroup()
  saveTheme()
}

function saveGroup() {
  saveIcon()
  saveTitle()
  saveTime()
}

function saveIcon() {
  group1Icon = document.getElementsByClassName('iconSelect')[0].childNodes[1].childNodes[1].childNodes[1]
  classList1 = String(group1Icon.classList)
  group2Icon = document.getElementsByClassName('iconSelect')[1].childNodes[1].childNodes[1].childNodes[1]
  classList2 = String(group2Icon.classList)

  chrome.storage.sync.set({ 'group1Icon': classList1 }, function () { //saves the name to the cloud
    console.log('group1Icon saved: ' + classList1);
  });
  chrome.storage.sync.set({ 'group2Icon': classList2 }, function () { //saves the name to the cloud
    console.log('group2Icon saved: ' + classList2);
  });
}

function saveTitle() {
  group1Title = document.getElementsByClassName('groupTitleInput')[0].value
  group2Title = document.getElementsByClassName('groupTitleInput')[1].value

  chrome.storage.sync.set({ 'group1Title': group1Title }, function () { //saves the name to the cloud
    console.log('group1Title saved: ' + group1Title);
  });
  chrome.storage.sync.set({ 'group2Title': group2Title }, function () { //saves the name to the cloud
    console.log('group2Title saved: ' + group2Title);
  });
}

function saveTime() {
  group1TimeSelect = document.getElementsByClassName("groupTimeSelect")[0]
  group1Time = group1TimeSelect.options[group1TimeSelect.selectedIndex].value
  group2TimeSelect = document.getElementsByClassName("groupTimeSelect")[1]
  group2Time = group2TimeSelect.options[group2TimeSelect.selectedIndex].value
  chrome.storage.sync.set({ 'group1Time': group1Time }, function () { //saves the name to the cloud
    console.log('group1Time saved: ' + group1Time);
  });
  chrome.storage.sync.set({ 'group2Time': group2Time }, function () { //saves the name to the cloud
    console.log('group2Time saved: ' + group2Time);
  });
}

function saveTheme() {
  chrome.storage.sync.get(['newThemeLink'], function (result) {
    chrome.storage.sync.set({ 'themeLink': result.newThemeLink }, function () { //saves the name to the cloud
      console.log('themeLink saved: ' + result.newThemeLink);
    });
    chrome.storage.sync.set({ 'newThemeLink': result.newThemeLink }, function () { //saves the name to the cloud
      console.log('newThemeLink saved: ' + result.newThemeLink);
    });
  })
}

// Icon Functions
function updateIconBtns() {
  iconBtns = document.getElementsByClassName('dropdown-item-icon')
  for (i = 0; i < iconBtns.length; i++) {
    iconBtn = iconBtns[i]
    iconBtn.addEventListener('click', chooseIcon)
  }
}

function chooseIcon() {
  btn = this
  iconClass = btn.childNodes[1].classList[1]
  groupButton = btn.parentElement.parentElement.childNodes[1]
  icon = groupButton.childNodes[1]
  icon.classList = `fa ${iconClass}`
}

// Accounts Functions

function updateAccountsBtns() {
  chrome.storage.sync.get(['slackUserToken'], function (result) {
    slackToken = result.slackUserToken
    if (slackToken != "") {
      loginSlackBtn()
    }
  })
}

function loginSlackBtn() {
  slackBtn = document.getElementById('slack_auth')
  slackBtn.style.bacgroundColor = "#cdcdcd"
  slackBtn.innerHTML = "Log Out"
  slackBtn.addEventListener('click', loginSlackBtn())
}

function loginSlackBtn() {

}

// Theme Functions

function updateThemeBtns() {
  themeBtns = document.getElementsByClassName("themeBtn")
  for (i = 0; i < themeBtns.length; i++) {
    themeBtn = themeBtns[i]
    themeBtn.addEventListener('click', chooseTheme)
  }
}

function chooseTheme() {
  btn = this
  link = ""
  if (btn.classList.contains('searchThemeBtn')) {
    link = chooseSearchTheme(btn.parentElement.parentElement)
  } else {
    btnCard = btn.parentElement.parentElement
    image = btnCard.childNodes[1]
    link = image.src
    console.log(image)
  }
  chrome.storage.sync.set({ 'newThemeLink': link }, function () { //saves the name to the cloud
    console.log('newThemeLink saved: ' + link);
  });
  document.body.setAttribute("style", `
  color: #fff;
  background: url(${link}) no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
`)
}

function chooseSearchTheme(btnCard) {
  term = btnCard.childNodes[1].childNodes[1].value
  link = convertTermToLink(term)
  console.log(link)
  return link
}

function convertTermToLink(term) {
  term = term.replace(/ +/g, "")
  linkHeader = "https://source.unsplash.com/featured/?"
  return linkHeader + term
}

