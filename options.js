// allow access to the data stored on the background page
var bg = chrome.extension.getBackgroundPage();

function save_options() {
	var key = 'blah';
	var value = 'blah';
	bg[key] = value;
}

function restore_options() {

}

document.addEventListener('DOMContentReady', restore_options);
document.querySelector('#save').addEventListener('click', save_options);