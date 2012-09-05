// These listeners allows this javascript to be executed in the extension without
// being blocked by Chrome for security reasons
document.addEventListener("DOMContentLoaded", onload, false);

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.valueInputButton').addEventListener('click', clickHandler);
});

// Called by the event listener when the page loads
function onload() {

	// Parses the extension url to get the incoming url
	var ws = window.location.search;
	if (ws !== undefined) {
		var kvs = ws.substring(1).split('&');
		for (var i = 0; i < kvs.length; i++) {
			var kv = kvs[i].split('=');
			if (kv[0] == 'url') {
			
				var u = document.getElementById("url");
					   
				var url = decodeURIComponent(kv[1]);
				u.href = url;
				u.appendChild(document.createTextNode(url));
			}
		}
	}
	
	// Focuses on the text box
	document.getElementsByName('valueInput')[0].focus();
}

// Submits the value inputted by the user to the server. 
function submit() {
	if(is_valid_value()) {	
		store_block_data("value submitted", get_username(), get_url(), document.getElementsByName("valueInput")[0].value);	
		unblock();
	}
}

// Called by the event listener when the submit button is clicked
function clickHandler(e) {
	submit();
}


// Gets the url
function get_url() {
	var a = document.getElementById("url");
	return a.href;
}

// Redirects the tab to the page the user intended to go to.
function unblock() {
	alert("unblocking");
	var url = document.getElementById("url");
	window.location = url.href + "";
}

// Temporary function, replace with account system code
function get_username() {
	return "test user";
}


// Checks to see if the value entered in the text box is valid.
// Valid values are positive dollar amounts. Displays an error on 
// the page if value is invalid. Returns false if value is invalid,
// returns true if value is valid. 

function is_valid_value() {
	var value = document.getElementsByName('valueInput')[0].value;
	var error = document.getElementById("errorAlert");
	
	
	// Make sure value contains only numbers and up to one decimal point
	var valid_characters = "0123456789.";	
	var char_result = true;	
	var point = 0;
	
	// Check each character for validity, decimal points
	for (i = 0; i < value.length && result == true; i++) {
		var temp = value.charAt(i);
		if (valid_characters.indexOf(temp) == -1) {
			char_result = false;
		}
		if (temp == "."){
			point++;
		}
	}
	// Checks decimal point count
	if(point > 1){
		char_result = false;
	}
	
	// Display error in page
	if (value.length == 0) {
		error.innerHTML = "You must enter a value";
		return false;
	}
	if(!char_result) {
		error.innerHTML = "You can only enter numbers and a decimal point";
		return false;
	} else {
		error.innerHTML = "";
		return true;
	}
}


// Allows user to use enter key to submit
function keyboard_submit() {
	if(event.keyCode == 13) {
		submit();
	}	
}

