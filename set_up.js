document.addEventListener("DOMContentLoaded", onload);

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('body').addEventListener('keypress', keyboard_submit);
	document.querySelector('#user_submit_button').addEventListener('click', clickHandler);
});

var this_url;

function onload() {
	// Parses the extension url to get the incoming url
	console.log('setup.js loaded');
	var ws = window.location.search;
	if (ws !== undefined) {
		var kvs = ws.substring(1).split('&');
		for (var i = 0; i < kvs.length; i++) {
			var kv = kvs[i].split('=');
			if (kv[0] == 'url') {
				this_url = decodeURIComponent(kv[1]);
			}
		}
	}	
	document.getElementById('user_name').focus();

}



function submit() {
	var value = document.getElementById('user_name').value;
    
    if(is_valid_value(value)) {
        // save username 
        set_data('username', value);
        // submit to remote server;
        // TODO
        window.location = this_url;
    }    
}

function is_valid_value(value) {
	var error = document.getElementById("errorAlert");
	
	
	// Make sure value contains only numbers and up to one decimal point
	var valid_characters = /^[A-Za-z0-9_ ]{4,32}$/;	
	
	var char_result = value.search(valid_characters) != -1;
	// Display error in page
	if (value.length == 0) {
		error.innerHTML = "You must enter a value";
		return false;
	}

    if(value == 'default_user') {
        error.innerHTML = "can not use default value";
        return false;
    }
    
	if(!char_result) {
		error.innerHTML = "Invalid Format";
		return false;
	} else {
		error.innerHTML = "";
		return true;
	}
}

// Called by the event listener when the submit button is clicked
function clickHandler(event) {
	submit();
}

// Allows user to use enter key to submit
function keyboard_submit(event) {
	if(event.keyCode == 13) {
		submit();
	}	
}
