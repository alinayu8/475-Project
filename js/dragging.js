var buffy = dragula({
  isContainer: function (el) {
    return el.classList.contains('dragula-container');
  }
});