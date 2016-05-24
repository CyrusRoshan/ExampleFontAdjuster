(function(){

  // We check for features which are not universally supported, and don't try to
  // show the app if it would error.
  if (!window.addEventListener || !window.localStorage)
    return;

  // The INSTALL_OPTIONS constant is inserted by the Eager bundler.  It's value is the
  // value of the options defined in the install.json file.
  var options = INSTALL_OPTIONS;

  // For converting the size of an element to a ratio to multiply the font size by.
  // It's probably best to restrict this to a simple small/medium/large so as not
  // to overload the user with options. A user constantly clicking the increase/decrease
  // font size button or dragging the slider to their exact value is a user that
  // wastes time that they should have been using on the website's actual content.
  // However, it's not that hard to modify to allow website owners to add additional sizes
  const sizeToRatio = {
    'medium': {
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
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'div',
    'nav',
    'section',
    'li',
    'ul',
    'ol',
    'td',
    'th',
    'button',
    'form',
    'input',
    'label',
    'textarea',
    'menu',
    'menuitem',
    'element',
    'span',
    'code',
  ];

  // We get our stored view size from the last time a visitor viewed the site.
  // If the visitor hasn't viewed the site before, we default to 'medium',
  // which does not change the font size for any elements
  var textContainingElements = [];
  var textResizer = null;
  var checkedTimes = 0;
  var resizingCSS = document.createElement('style');
  if (INSTALL_ID == 'preview') {
    localStorage.removeItem('EagerTextViewSize')
  }
  document.head.appendChild(resizingCSS);
  var updateElement = function(){
    // fix in order to fix compounding size multipliers while non-medium A selected and
    // user previewing the install is changing options
    resizingCSS.innerHTML = '';

    // To disable font boosting in order to get proper computed element sizes
    // thanks to http://stackoverflow.com/a/15261825
    var node = document.createElement('style');
    node.innerHTML = 'body, body * { max-height: 1000000px; }';
    document.body.appendChild(node);

    // We pass in the last element to allow us to restore the removed element
    // when we do live updating of the preview.  Details:
    // https://eager.io/developer/docs/install-json/preview#dealing-with-element-fields

    // We need to force options.element to body if options.position is 'fixed', because
    // not showing a selection via showIf doesn't make it change to its default value
    // Probably a bug, since it seems unintuitive

    // The text resizer itself
    textResizer = Eager.createElement({'selector': 'body','method': 'append'}, textResizer);
    textResizer.className = 'example-font-size-resizer';

    // Converting corner position, and vertical/horizontal s to CSS
    var verticalDirection, horizontalDirection;
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

    // Literally creates the A's in the font size selector
    function createA(name) {
      createdA = document.createElement('div');
      createdA.innerText = 'A';

      // Add onClick font modification here
      // default to medium if it hasn't been used before
      createdA.onclick = () => {resizeText(localStorage.EagerTextViewSize, name)};
      return createdA;
    }

    // Actually create the different sized A's
    Object.keys(sizeToRatio).forEach(size => {
      textResizer.appendChild(createA(size));
    })

    resizeText('medium', localStorage.EagerTextViewSize || 'medium'); // initially resize text to medium (original size) or the previous selection by user

    function resizeText(oldSize, newSize) {
      var newCss = '';

      // add css for all element tags that probably contain text
      if (newSize != 'medium') {
        console.log(oldSize, newSize)
        var sizeMultiplier = sizeToRatio[newSize].actualSize / sizeToRatio[oldSize].actualSize;
        htmlTags.forEach(tag => {
          var firstElement = document.querySelector(tag);
          if (firstElement) {
            var newFontSize = parseFloat(window.getComputedStyle(document.querySelector(tag), null).fontSize) * sizeMultiplier;
            newCss += `${tag} {
              font-size: ${newFontSize}px !important;
              line-height: 1.6 !important;
            }\n`
          }
        })
      }

      // add css for text resizer itself
      newCss += (`
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
          -webkit-transition-duration: 500ms !important;
          -moz-transition-duration: 500ms !important;
          -o-transition-duration: 500ms !important;
          transition-duration: 500ms !important;
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
          -webkit-transition-duration: 500ms !important;
          -moz-transition-duration: 500ms !important;
          -o-transition-duration: 500ms !important;
          transition-duration: 500ms !important;
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

      // make css for A sizes
      Object.keys(sizeToRatio).forEach(size => {
        newCss += `.${textResizer.className} div:nth-child(${Object.keys(sizeToRatio).indexOf(size) + 1}) {
          line-height: ${options.fontSize * sizeToRatio[Object.keys(sizeToRatio).slice(-1)[0]].shownSize}px !important;
          font-size: ${options.fontSize * sizeToRatio[size].shownSize}px !important;
        }\n`
      })

      // Find current scroll position
      var scrollRatio = window.scrollY / document.documentElement.scrollHeight;

      resizingCSS.innerHTML = newCss;
      localStorage.EagerTextViewSize = newSize;

      // Return user to approximate previous scroll position
      window.scroll(window.scrollX, scrollRatio * document.documentElement.scrollHeight);
    }
  }



  //*********************
  // Eager install code
  //*********************

  var update = function(){
    updateElement();
  }

  var setOptions = function(opts){
    options = opts;
    update();
  }

  // Since we're adding an element to the body, we need to wait until the DOM is
  // ready before inserting our widget.
  if (document.readyState == 'loading')
    document.addEventListener('DOMContentLoaded', update);
  else
    update();

  // This is used by the preview to enable live updating of the app while previewing.
  // See the preview.handlers section of the install.json file to see where it's used.
  INSTALL_SCOPE = {
    setOptions: setOptions
  };

})()
