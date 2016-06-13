(function(){
  if (!window.addEventListener || !window.localStorage)
    return;

  let options = INSTALL_OPTIONS;

  const sizeToRatio = {
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
  }

  const htmlTags = [
    'p',
  ];

  let viewSize = localStorage.EagerTextViewSize
  if (INSTALL_ID == 'preview') {
    viewSize = 'original'
  }


  let resizingCSS = null;
  let textResizer = null;

  function onLoad() {
    let tagCount = 0;
    htmlTags.forEach(tag => {
      tagCount += document.querySelectorAll(tag).length;
    })

    console.log(tagCount)
    if (tagCount < 2 && document.body.innerText.length > 1000) {
      return;
    }

    resizingCSS = document.createElement('style');
    document.head.appendChild(resizingCSS);
    resizingCSS.className = 'eager-apps-text-enlarger-css'

    textResizer = document.createElement('div');
    document.body.appendChild(textResizer)
    textResizer.className = 'eager-apps-text-enlarger-app';

    function createA(name) {
      createdA = document.createElement('div');
      createdA.innerText = 'A';
      createdA.onclick = () => {resizeText(viewSize, name)};
      return createdA;
    }

    Object.keys(sizeToRatio).forEach(size => {
      textResizer.appendChild(createA(size));
    })

    update();
  }

  function resizeText(oldSize, newSize) {
    let verticalDirection, horizontalDirection;
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

    let textResizerCSS = (`
      .${textResizer.className} {
        ${verticalDirection}: 10px !important;
        ${horizontalDirection}: 10px !important;
        display: inline-block !important;
        padding: 5px !important;
        z-index: 2147483647 !important;
        -moz-user-select: none !important;
        -khtml-user-select: none !important;
        -webkit-user-select: none !important;
        -o-user-select: none !important;
        border-radius: ${options.borderRadius}px !important;
        background-color: ${options.backgroundColor} !important;
        opacity: ${options.seeThrough ? 0.5 : 1} !important;
        position: fixed !important;
        -webkit-transition: opacity 500ms !important;
        -moz-transition: opacity 500ms !important;
        -o-transition: opacity 500ms !important;
        transition: opacity 500ms !important;
      }

      .${textResizer.className}:hover {
        opacity: ${options.seeThrough ? 0.8 : 1} !important;
      }

      .${textResizer.className} div {
        float: left !important;
        display: block !important;
        margin: 0 !important;
        font-weight: 200 !important;
        font-family: arial, helvetica, verdana !important;
        background-color: transparent !important;
        cursor: pointer !important;
        padding: ${options.fontSize / 5}px !important;
        color: ${options.textColor} !important;
        opacity: 0.5 !important;
        -webkit-transition: opacity 500ms !important;
        -moz-transition: opacity 500ms !important;
        -o-transition: opacity 500ms !important;
        transition: opacity 500ms !important;
      }
      .${textResizer.className} div:hover {
        opacity: 0.8!important;
      }
      .${textResizer.className} div:nth-child(${Object.keys(sizeToRatio).indexOf(newSize) + 1}) {
        opacity: 0.9 !important;
      }
      .${textResizer.className} div:nth-child(${Object.keys(sizeToRatio).indexOf(newSize) + 1}):hover {
        opacity: 1 !important;
      }
    `);

    let aCSS = ''
    Object.keys(sizeToRatio).forEach(size => {
      aCSS += `.${textResizer.className} div:nth-child(${Object.keys(sizeToRatio).indexOf(size) + 1}) {
        line-height: ${options.fontSize * sizeToRatio[Object.keys(sizeToRatio).slice(-1)[0]].shownSize}px !important;
        font-size: ${options.fontSize * sizeToRatio[size].shownSize}px !important;
      }\n`
    })

    resizingCSS.innerHTML = textResizerCSS + aCSS;

    // Save scroll ratio to be able to return user to the same position on the page after we've finished resizing the text
    let scrollRatio = window.scrollY / document.documentElement.scrollHeight;

    if (!(newSize == 'original' && oldSize == 'original')) {
      let sizeMultiplier = sizeToRatio[newSize].actualSize / sizeToRatio[oldSize].actualSize;
      htmlTags.forEach(tag => {
        let tagElements = document.querySelectorAll(tag);
        for (let i = 0; i < tagElements.length; i++) {
          tagElements[i].style.fontSize = parseFloat(window.getComputedStyle(tagElements[i]).fontSize) * sizeMultiplier + "px";
        }
      })
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

  let update = function(){
    resizeText('original', viewSize || 'original');
  }

  let setOptions = function(opts){
    options = opts;
    update();
  }

  // Since we're adding an element to the body, we need to wait until the DOM is
  // ready before inserting our widget.
  if (document.readyState == 'loading')
    document.addEventListener('DOMContentLoaded', onLoad);
  else
    onLoad();

  // This is used by the preview to enable live updating of the app while previewing.
  // See the preview.handlers section of the install.json file to see where it's used.
  INSTALL_SCOPE = {
    setOptions: setOptions
  };

})()
