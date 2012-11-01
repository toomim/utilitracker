document.addEventListener("DOMContentLoaded", onload);

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('body').addEventListener('keypress', keyboard_submit);
	document.querySelector('#user_register_button').addEventListener('click', registerClickHandler);
	document.querySelector('#user_login_button').addEventListener('click', loginClickHandler);
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



function submit(func) {
	var value = document.getElementById('user_name').value;
    
    if(is_valid_value(value)) {
	    // try to post to server
	    register_to_server(value, func);
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

function register_to_server(value, func) {
	var error = document.getElementById("errorAlert");
	var xmlHttp = new XMLHttpRequest();
	if(func == 'register') {
		var tourl = "http://yuno.us:8989/setup_user";	
	} else if(func == 'login') {
		var tourl = "http://yuno.us:8989/check_user";		
	}
	var params = 
		"uid=" + escape(value);
	xmlHttp.open("POST", tourl, true);

	//Send the proper header information along with the request  //x-www-form-urlencoded
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.setRequestHeader("Content-length", params.length);
	xmlHttp.setRequestHeader("Connection", "close");

	xmlHttp.onreadystatechange = function() {//Call a function when the state changes.
		if(xmlHttp.readyState == 4) {
			// alert(xmlHttp.statusText);
			if(xmlHttp.status == 200) {
				if(xmlHttp.responseText == '1') {
					if(func == 'register') {
						console.log('user name is available');						
					} else {
						console.log('user name login successful');
					}
					// save username 
					set_data('username', value);
					// TODO
					window.location = this_url;		    
				} else {
					if(func == 'register') {
						error.innerHTML = "user name alreadly been registered";					
					} else {
						error.innerHTML = "invalid user name";
					}
				}
			} else {
				error.innerHTML = "server error, try again later. ";
			}
		}
		console.log('response text: ', xmlHttp.responseText);
	};
	xmlHttp.send(params);	
}

// Called by the event listener when the submit button is clicked
function registerClickHandler(event) {
	submit('register');
}

// Called by the event listener when the login button is clicked
function loginClickHandler(event) {
	submit('login');
}

// Allows user to use enter key to submit
function keyboard_submit(event) {
	if(event.keyCode == 13) {
		submit();
	}	
}
