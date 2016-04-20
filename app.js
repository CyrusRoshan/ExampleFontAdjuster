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
    'small': 0.7,
    'medium': 1,
    'large': 1.3
  }


  // We get our stored view size from the last time a visitor viewed the site.
  // If the visitor hasn't viewed the site before, we default to 'medium',
  // which does not change the font size for any elements
  var viewSize = localStorage.viewSize || 'medium';

  var textResizer = null;
  var updateElement = function(){
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
    textResizer.parentNode.backgroundColor = 'red';
    textResizer.style.cssText = (`
      display: inline-block;
      padding: 5px;
      z-index: 2147483647;
      border-radius: ${options.borderRadius}px;
      background-color: ${options.backgroundColor};
      opacity: ${options.opacity / 100};
      position: ${options.position};
    `);

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

    // Apply corner and margin CSS
    textResizer.style.cssText += (`
      ${verticalDirection}: ${options.verticalMargin}px;
      ${horizontalDirection}: ${options.horizontalMargin}px;
    `);

    // Literally creates the A's in the font size selector
    function createA(name) {
      // Add CSS here
      createdA = document.createElement('div');
      createdA.innerText = 'A';
      createdA.style.cssText = (`
        float: left;
        display: block;
        margin: 0;
        background-color: transparent;
        cursor: pointer;
        padding: ${options.fontSize / 5}px;
        color: ${options.textColor};
        opacity: ${options.opacity / 100};
        line-height: ${options.fontSize * sizeToRatio['large']}px;
        font-size: ${options.fontSize * sizeToRatio[name]}px;
      `);
      if (name === 'medium') {
        createdA.style.cssText += (`
          margin: ${options.spacing}px;
          margin-top: 0;
          margin-bottom: 0;
        `);
      }

      // Add onClick font modification here
      createdA.onclick = () => {console.log(name)};
      return createdA;
    }

    textResizer.appendChild(createA('small'));
    textResizer.appendChild(createA('medium'));
    textResizer.appendChild(createA('large'));
  };

  function resizeText(newSize){

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
