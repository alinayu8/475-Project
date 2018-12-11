var buffy = dragula({
  reventOnSpill: true,
  isContainer: function (el) {
    return (el.classList.contains('dragula-container') || el.classList.contains('nav-item'));
  },
  accepts: function (el, target, source, sibling) {
    return target.classList.contains('nav-item');
  },
  moves: function (el, source, handle, sibling) {
    return !source.classList.contains('nav-item');
  }, 
})

function updateMessages() {
  chrome.storage.local.get('content', function(result) {
    $("#nav-tabContent").html(result.content);
    updateMessageEvents()
  });
}

function updateMessageEvents() {
  console.log("updating message events")
  Array.from(document.getElementsByClassName("message")).forEach(el => {
    console.log(el)
    el.addEventListener("mouseover", function() {
      console.log("adding event listener mouseover")
      this.getElementsByClassName("messageGrip")[0].classList.remove("hidden")
      this.childNodes[1].classList.remove("pl-3");
      this.childNodes[1].classList.add("pl-0")
    })
    el.addEventListener("mouseout", function() {
      this.getElementsByClassName("messageGrip")[0].classList.add("hidden")
      this.childNodes[1].classList.remove("pl-0")
      this.childNodes[1].classList.add("pl-3")
    })
  });
}

updateMessages()


// function messageHover(el) {
//   el.getElementsByClassName("messageGrip")[0].classList.remove("hidden")
//   el.childNodes[1].classList.remove("pl-3");
//   el.childNodes[1].classList.add("pl-0")
// }

function messageHoverOff(el) {
  el.getElementsByClassName("messageGrip")[0].classList.add("hidden")
  el.childNodes[1].classList.remove("pl-0")
  el.childNodes[1].classList.add("pl-3")
}

var draggedMessage;

buffy.on('drag', function (el, source) {
  draggedMessage = el.cloneNode(deep = true);
  setNewDraggedElement(el)
})

function setNewDraggedElement(el) {
  // <a class="message">
  //   <div class="container hoverBox p-2">
  //     <img class="messageIcon" src="./assets/icons/gmail.png">
  //     <p>Fourfax Block</p>
  //   </div>
  // </a>
  let newDraggedElement = document.createElement("div")
  newDraggedElement.setAttribute("class", "container hoverBox p-2 m-0")

  let image = document.createElement("img")
  image.setAttribute("class", "messageIcon");
  let imgSrc = el.getElementsByClassName("messageIcon")[0].getAttribute("src")
  image.setAttribute("src", imgSrc)
  let text = document.createElement("p")
  text.innerHTML = el.getElementsByClassName("messageSender")[0].innerHTML
  newDraggedElement.appendChild(image)
  newDraggedElement.appendChild(text)

  el.innerHTML = ''
  el.append(newDraggedElement)
}


buffy.on('shadow', function(el, container, source) {
  console.log(container)
  if (container.classList.contains('nav-item')) {
    el.setAttribute("style", "display: none;");
    if (document.getElementsByClassName("nav-dragOver").length > 0) {
      document.getElementsByClassName("nav-dragOver")[0].classList.remove("nav-dragOver")
    }
    container.classList.add("nav-dragOver");
  }
})

// when dropped into a section
buffy.on('drop', function (el, target, source, sibling) {
  if (target.classList.contains('nav-item')) {
    moveToSection(el, target)
    target.classList.remove("nav-dragOver")
  }
})

function moveToSection(el, target) {
  el = draggedMessage;
  let targetID = target.getAttribute("href").substring(1);
  let targetSection = document.getElementById(targetID).childNodes[1];
  targetSection.append(el)
  updateMessageEvents()
  messageHoverOff(el)
  // sortTimes(targetSection)
}

// will need after integration with back end
function sortTimes(targetSection) {
  for (i =0; i < length(targetSection.childNodes); i++) {
    message = targetSection.childNodes[i]
    messageTime = targetSection.getElementsByClassName("messageTime")[0]
  }
}