'use strict';

(function () {
  if (!window.addEventListener || !window.localStorage) return;

  var options = INSTALL_OPTIONS;

  var sizeToRatio = {
    'original': {
      shownSize: 0.7,
      actualSize: 1
    },
    'large': {
      shownSize: 1,
      actualSize: 1.5
    },
    'extraLarge': {
      shownSize: 1.5,
      actualSize: 2
    }
  };

  var htmlTags = ['p', 'i'];

  var viewSize = localStorage.EagerTextViewSize;
  if (INSTALL_ID == 'preview') {
    viewSize = 'original';
  }

  var resizingCSS = null;
  var textResizer = null;

  function onLoad() {
    var tagCount = 0;
    htmlTags.forEach(function (tag) {
      tagCount += document.querySelectorAll(tag).length;
    });

    console.log(tagCount);
    if (tagCount < 2 && document.body.innerText.length > 1000) {
      return;
    }

    resizingCSS = document.createElement('style');
    document.head.appendChild(resizingCSS);
    resizingCSS.className = 'eager-apps-text-enlarger-css';

    textResizer = document.createElement('div');
    document.body.appendChild(textResizer);
    textResizer.className = 'eager-apps-text-enlarger-app';

    function createA(name) {
      createdA = document.createElement('div');
      createdA.innerText = 'A';
      createdA.onclick = function () {
        resizeText(viewSize, name);
      };
      return createdA;
    }

    Object.keys(sizeToRatio).forEach(function (size) {
      textResizer.appendChild(createA(size));
    });

    update();
  }

  function resizeText(oldSize, newSize) {
    var verticalDirection = void 0,
        horizontalDirection = void 0;
    switch (options.corner) {
      case 'topLeft':
        verticalDirection = 'top';
        horizontalDirection = 'left';
        break;
      case 'topRight':
        verticalDirection = 'top';
        horizontalDirection = 'right';
        break;
      case 'bottomLeft':
        verticalDirection = 'bottom';
        horizontalDirection = 'left';
        break;
      case 'bottomRight':
        verticalDirection = 'bottom';
        horizontalDirection = 'right';
      default:
        break;
    };

    var textResizerCSS = '\n      .' + textResizer.className + ' {\n        ' + verticalDirection + ': 10px !important;\n        ' + horizontalDirection + ': 10px !important;\n        display: inline-block !important;\n        padding: 5px !important;\n        z-index: 2147483647 !important;\n        -moz-user-select: none !important;\n        -khtml-user-select: none !important;\n        -webkit-user-select: none !important;\n        -o-user-select: none !important;\n        border-radius: ' + options.borderRadius + 'px !important;\n        background-color: ' + options.backgroundColor + ' !important;\n        opacity: ' + (options.seeThrough ? 0.5 : 1) + ' !important;\n        position: fixed !important;\n        -webkit-transition: opacity 500ms !important;\n        -moz-transition: opacity 500ms !important;\n        -o-transition: opacity 500ms !important;\n        transition: opacity 500ms !important;\n      }\n\n      .' + textResizer.className + ':hover {\n        opacity: ' + (options.seeThrough ? 0.8 : 1) + ' !important;\n      }\n\n      .' + textResizer.className + ' div {\n        float: left !important;\n        display: block !important;\n        margin: 0 !important;\n        font-weight: 200 !important;\n        font-family: arial, helvetica, verdana !important;\n        background-color: transparent !important;\n        cursor: pointer !important;\n        padding: ' + options.fontSize / 5 + 'px !important;\n        color: ' + options.textColor + ' !important;\n        opacity: 0.5 !important;\n        -webkit-transition: opacity 500ms !important;\n        -moz-transition: opacity 500ms !important;\n        -o-transition: opacity 500ms !important;\n        transition: opacity 500ms !important;\n      }\n      .' + textResizer.className + ' div:hover {\n        opacity: 0.8!important;\n      }\n      .' + textResizer.className + ' div:nth-child(' + (Object.keys(sizeToRatio).indexOf(newSize) + 1) + ') {\n        opacity: 0.9 !important;\n      }\n      .' + textResizer.className + ' div:nth-child(' + (Object.keys(sizeToRatio).indexOf(newSize) + 1) + '):hover {\n        opacity: 1 !important;\n      }\n    ';

    var aCSS = '';
    Object.keys(sizeToRatio).forEach(function (size) {
      aCSS += '.' + textResizer.className + ' div:nth-child(' + (Object.keys(sizeToRatio).indexOf(size) + 1) + ') {\n        line-height: ' + options.fontSize * sizeToRatio[Object.keys(sizeToRatio).slice(-1)[0]].shownSize + 'px !important;\n        font-size: ' + options.fontSize * sizeToRatio[size].shownSize + 'px !important;\n      }\n';
    });

    resizingCSS.innerHTML = textResizerCSS + aCSS;

    // Save scroll ratio to be able to return user to the same position on the page after we've finished resizing the text
    var scrollRatio = window.scrollY / document.documentElement.scrollHeight;

    if (!(newSize == 'original' && oldSize == 'original')) {
      (function () {
        var sizeMultiplier = sizeToRatio[newSize].actualSize / sizeToRatio[oldSize].actualSize;
        htmlTags.forEach(function (tag) {
          var tagElements = document.querySelectorAll(tag);
          for (var i = 0; i < tagElements.length; i++) {
            tagElements[i].style.fontSize = parseFloat(window.getComputedStyle(tagElements[i]).fontSize) * sizeMultiplier + "px";
          }
        });
      })();
    }

    viewSize = newSize; // For browsers that can't set localStorage variables
    try {
      localStorage.EagerTextViewSize = newSize;
    } catch (e) {}

    // Return user to approximate previous scroll position
    window.scroll(window.scrollX, scrollRatio * document.documentElement.scrollHeight);
  }

  //*********************
  // Eager install code
  //*********************

  var update = function update() {
    resizeText('original', viewSize || 'original');
  };

  var setOptions = function setOptions(opts) {
    options = opts;
    update();
  };

  // Since we're adding an element to the body, we need to wait until the DOM is
  // ready before inserting our widget.
  if (document.readyState == 'loading') document.addEventListener('DOMContentLoaded', onLoad);else onLoad();

  // This is used by the preview to enable live updating of the app while previewing.
  // See the preview.handlers section of the install.json file to see where it's used.
  INSTALL_SCOPE = {
    setOptions: setOptions
  };
})();