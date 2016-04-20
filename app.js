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
    'small': {
      shownSize: 0.7,
      actualSize: 0.7
    },
    'medium': {
      shownSize: 1,
      actualSize: 1
    },
    'large': {
      shownSize: 1.5,
      actualSize: 1.5
    }
  }


  // We get our stored view size from the last time a visitor viewed the site.
  // If the visitor hasn't viewed the site before, we default to 'medium',
  // which does not change the font size for any elements
  var textContainingElements = [];
  var textResizer = null;
  var updateElement = function(){
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
    if (options.position === 'fixed') {
      options.element = {
        "selector": "body",
        "method": "append"
      }
    }

    // We're adding all of our CSS dynamically in js without
    // .css files because the CSS itself is generated depending on the options that the
    // website owner configures depending on his/her preferences

    // The text resizer itself
    textResizer = Eager.createElement(options.element, textResizer);
    textResizer.className = 'example-font-size-resizer';

    // Converting corner position, and vertical/horizontal margins to CSS
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

    // Could either do this or use javascript to change opacity on each hover.
    // I think this is easier to view and debug
    var hoverCSS = document.createElement('style');
    hoverCSS.innerHTML = (`
      .${textResizer.className} {
        display: inline-block;
        padding: 5px;
        z-index: 2147483647;
        -moz-user-select: none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -o-user-select: none;
        border-radius: ${options.borderRadius}px;
        background-color: ${options.backgroundColor};
        opacity: ${options.opacity / 100};
        position: ${options.position};
        ${verticalDirection}: ${options.verticalMargin}px;
        ${horizontalDirection}: ${options.horizontalMargin}px;
        -webkit-transition-duration: ${options.transitionTime}ms;
        -moz-transition-duration: ${options.transitionTime}ms;
        -o-transition-duration: ${options.transitionTime}ms;
        transition-duration: ${options.transitionTime}ms;
      }

      .${textResizer.className}:hover {
        opacity: ${options.onhoverOpacity / 100};
      }

      .${textResizer.className} div {
        float: left;
        display: block;
        margin: 0;
        font-weight: 200;
        font-family: lato, helvetica, arial;
        background-color: transparent;
        cursor: pointer;
        padding: ${options.fontSize / 5}px;
        color: ${options.textColor};
        opacity: ${options.opacity / 100};
      }
      .${textResizer.className} div:hover {
        opacity: ${options.onhoverOpacity / 100};
      }
      .${textResizer.className} div.selected {
        font-weight: 800;
        opacity: ${options.onhoverOpacity / 100 * 1.1};
      }
    `);
    document.body.appendChild(hoverCSS);

    // Literally creates the A's in the font size selector
    function createA(name) {
      createdA = document.createElement('div');
      createdA.innerText = 'A';
      // CSS that depends on the size of the A
      createdA.style.cssText += (`
        line-height: ${options.fontSize * sizeToRatio['large'].shownSize}px;
        font-size: ${options.fontSize * sizeToRatio[name].shownSize}px;
      `);
      // For spacing
      if (name === 'medium') {
        createdA.style.cssText += (`
          margin: ${options.spacing}px;
          margin-top: 0;
          margin-bottom: 0;
        `);
      }
      // Add onClick font modification here
      createdA.onclick = () => {resizeText(localStorage.viewSize, name)};
      return createdA;
    }

    // Actually create the different sized A's
    textResizer.appendChild(createA('small'));
    textResizer.appendChild(createA('medium'));
    textResizer.appendChild(createA('large'));

    updateTextElements();
    var viewSize = localStorage.viewSize;
    resizeText('medium', 'medium');
    // Weird bug where
    if (localStorage.viewSize) {
      resizeText('medium', viewSize);
    }

    // Create a MutationObserver instance to monitor new text containing nodes if they are
    // added on DOM modification
    var observer = new MutationObserver((mutations) => {
      for (var i = 0; i < mutations.length; i++){
        if (mutations[i].type === 'childList'){
          updateTextElements();
          break;
        }
      };
    });
    observer.observe(document.querySelector('body'), {subtree: true, childList: true});
  };

  // Get all text containing elements, so we don't have to waste time on non-text containing
  // elements. This makes it much faster to change text sizes. This also however means that
  // we have to repeat this function each time an element is added to the DOM tree.
  function updateTextElements(){
    textContainingElements = [];
    document.querySelectorAll('body *').forEach((element) => {
      if (element.innerText && textResizer.className != element.parentNode.className) {
        textContainingElements.push(element);
      }
    });
  }

  // For resizing text. Assuming this is completely modular, it's going to be a bit
  // inefficient because we'll be changing the font size for every element
  function resizeText(oldSize, newSize){
    // Modify the A that got selected
    var i = 0;
    for (var key in sizeToRatio) {
      i++;
      if (key === newSize){
        textResizer.querySelector(`div:nth-child(${i})`).className = 'selected';
      } else if (key === oldSize) {
        textResizer.querySelector(`div:nth-child(${i})`).className = '';
      }
    }

    // Find current scroll position
    var scrollRatio = window.scrollY / document.documentElement.scrollHeight;

    // Modify the font size of all text-containing elements
    var newNumericSize = sizeToRatio[newSize].actualSize / sizeToRatio[oldSize].actualSize;
    textContainingElements.forEach((element) => {
      var size = window.getComputedStyle(element, null).getPropertyValue('font-size');
      element.style.fontSize = parseFloat(size) * newNumericSize + 'px';
    });

    // Return user to approximate previous scroll position
    window.scroll(window.scrollX, scrollRatio * document.documentElement.scrollHeight);

    // Change current size to the new size that we've updated it to
    localStorage.viewSize = newSize;
  }

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
