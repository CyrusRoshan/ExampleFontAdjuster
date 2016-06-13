(function(){

var totalChars = document.body.innerText,length

function test(thisElem) {
  console.log('RESTART')
  // must have most of page text
  var characterCount = thisElem.innerText.length
  if (characterCount < totalChars * 0.5) {
    console.log('Fail')
    return false
  }

  // siblings must not have comparable text count
  var parent = thisElem.parentNode
  for (let i = 0; i < parent.children; i++) {
    if (parent.children[i] == thisElem) {
      continue
    }
    if (parent.children[i].innerText.length > characterCount * 0.25) {
      console.log('A')
      return testChildren(thisElem)
    }
  }

  // most of the text cannot be a link
  var subLinks = thisElem.querySelectorAll('a')
  var totalLinkChars = 0
  for (let i = 0; i < subLinks.length; i++) {
    totalLinkChars += subLinks[i].innerText.length;
  }
  if (totalLinkChars > 0.25 * totalChars) {
    console.log('B')
    return testChildren(thisElem)
  }

  // must have decent text density
  var height = parseFloat(window.getComputedStyle(thisElem).height)
  var width = parseFloat(window.getComputedStyle(thisElem).width)
  var fontSize = parseFloat(window.getComputedStyle(thisElem).fontSize)
  if (width * height / Math.pow(fontSize, 2) > characterCount) {
    console.log('C')
    return testChildren(thisElem)
  }

  return thisElem
}

function testChildren(thisElem) {
  for (let i = 0; i < thisElem.children.length; i++) {
    console.log(i)
    let testResults = test(thisElem.children[i])
    if (testResults) {
      return testResults
    }
  }
  return false
}


var results = test(document.body);
console.log(results);
results.style.backgroundColor = "red";

})()
//
// var allElems = document.querySelectorAll('*')
// for(var i = 0; i < allElems.length; i++) {
//   console.log(i)
//   allElems[i].style.fontSize = parseFloat(window.getComputedStyle(allElems[i]).fontSize) * 1.5 + "px";
// }
