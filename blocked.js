
document.addEventListener("DOMContentLoaded", onload, false);
		
function onload() {
	alert("Executing onload");
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
	document.getElementsByName('valueInput')[0].focus();
	
}

function getUrl() {
	var a = document.getElementById("url");
	return a.href;
}

function toGoogle() {
	window.location = "http://www.google.com";
}

function redirectTo() {
	re_allow_better();
	var url = document.getElementById("url");
	window.location = url.href + "";
}

// one way to unblock the site: make the unblock time to be 0 minute.
function re_allow() {
	var opts = csapuntz.siteblock.read_options();
    
	opts.allowed = Number(60);
	opts.period = Number(60);

	csapuntz.siteblock.write_options(opts);
	chrome.extension.getBackgroundPage().onOptionsChanged(opts);
}

// another way to unblock the site: delete the block rule.
function re_allow_opt() {
	var opts = csapuntz.siteblock.read_options();
	
	// var ori_rules = opt.rules;
	// var new_rules = ori_rules.replace('', '');
	opts.rules = "";

	csapuntz.siteblock.write_options(opts);
	chrome.extension.getBackgroundPage().onOptionsChanged(opts);	
}

// better way to block. block the site first, then each time user click go through,
// another minute is allowed before the site is blocked again
function re_allow_better() {
	var opts = csapuntz.siteblock.read_options();
	
	opts.allowed = Number(1);
	opts.period = Number(24*60);
	
	csapuntz.siteblock.write_options(opts);
	chrome.extension.getBackgroundPage().onOptionsChanged(opts);		
	
	// reset the timer
	// var time_current = csapuntz.siteblock.newUsageTracker.time_cb;
	// var reset = csapuntz.siteblock.newUsageTracker.check_reset;
}

/*
function getUserName() {
	var opts = csapuntz.siteblock.read_options();
	return opts.username;
}
*/

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

/*
function finishSessionFunc() {
	var opts = csapuntz.siteblock.read_options();

	opts.timeClicked = 0;
	
	csapuntz.siteblock.write_options(opts);
	chrome.extension.getBackgroundPage().onOptionsChanged(opts);
	
	// alert("session ended, restart another. ");
	self.close();
}
*/

function submit() {
	if(is_valid_value()) {	
		store_block_data("paid", getUserName(), getUrl(), document.getElementsByName("valueInput")[0].value);	
		redirectTo();
	}
}

// for the user to hit enter to submit the form
function keyboard_submit() {
	if(event.keyCode == 13) {
		submit();
	}	
}


/* 
// reset the timer in the siteblock.js file
function refreshFunc() {
	// a little trick to reset the timer in the siteblock.js file. set the period to 0 and then set it back to normal. hehe
	var opts = csapuntz.siteblock.read_options();
	opts.allowed = Number(0);
	opts.period = Number(0*60);
	csapuntz.siteblock.write_options(opts);
	chrome.extension.getBackgroundPage().onOptionsChanged(opts);		
	document.getElementById("moreClickOnGoThrough").style.display = "true";
	document.getElementById("singleClickOnGoThrough").style.display = "none";
	document.getElementById("continueButton").value = "get extra minute!";
	
	// get what user paid last time and put into the valueInput
	document.getElementById("valueInput").value = opts.lastPaid;
}

*/