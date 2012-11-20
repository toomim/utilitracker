// A/B test options go in here.  There are two prompts, so this is an
// array of tuples of size 2.
var variants = [['<div class="subtitle">Sell your <a class="url"></a> access for 24 hours.<br>Name your price.</div><br><br>',
                 '<img src="lock_dim.png" class="lock">'],
                ['<div class="subtitle">Sell your <a class="url"></a> access for 24 hours.<br>Set your asking price.</div><br><br>',
                 '<img src="lock_dim.png" class="lock">'],
                ['<div class="subtitle">Sell your <a class="url"></a> access for 24 hours.<br>Name your price.</div><br><br>',
                 '<img src="lock_dim.png" class="lock">'],
]
var timer = null;

/*,
                ['How much money would we have to give you for you to not have access to <a class="url"></a> for 24 hours?', '']],
                ['<div class="title">Cash Chance!</div><div class="subtitle">Sell your <a class="url"></a> access for 24 hours.<br>Name your price.</div><br><br>',
                 '<style>#tint{margin-top: 10px;margin-left: 10px;border-radius: 10px;box-shadow: 0px 0px 35px #fff;width: 99%;}</style><img src="lock_bright.png" class="lock">'],
                ['How much is the next 24 hours of <a class="url"></a> worth to you?', '(Be accurate &amp; honest, because the study might buy your access!)<br><img src="gimme_money.png" style="position: relative; left: 409px; top: -219px;">'],
                ['What would it take for you to choose CASH over the next 24 hours of <a class="url"></a>?', '<img src="gimme_money.png">']
               ];*/

// These listeners allows this javascript to be executed in the extension without
// being blocked by Chrome for security reasons
document.addEventListener("DOMContentLoaded", onload, false);

// Called by the event listener when the page loads
function onload() {
	// Parses the extension url to get the incoming url
	var ws = window.location.search;
	if (ws !== undefined) {
		var kvs = ws.substring(1).split('&');
		for (var i = 0; i < kvs.length; i++) {
			var kv = kvs[i].split('=');
			if (kv[0] == 'url') {
				var url = decodeURIComponent(kv[1]);
			}
		}
	}	
	
	site = find_website_state(url);
	if(site.user_offer == null) {
		// add event listener
		document.addEventListener('DOMContentLoaded', function () {
			document.querySelector('body').addEventListener('keypress', keyboard_submit);
			document.querySelector('#continueButton').addEventListener('click', clickHandler);
		});
		
		// this is the ask_offer step
		console.log('this is a ask offer');
		// Set up the a/b test
    	var v = get_data('variant') || 0;
    	v = Math.min(v, variants.length - 1)
    	// document.getElementById('prompt1').innerHTML = variants[v][0];
    	// document.getElementById('prompt2').innerHTML = variants[v][1];
    	set_data('variant', (v+1) % variants.length);
    	document.getElementById('prompt1').innerHTML = "<img src='ask_offer_title.png' />";
    	document.getElementById('prompt2').innerHTML = variants[v][0];
    	set_url();
    	/*var tmp = 'variations: '
    	for (var i=0; i<variants.length; i++)
    		tmp += '<a href="#">' + i + '</a> '
    	document.getElementById('ab_test_options').innerHTML = tmp*/
    
    	// show the original url in the iframe
    	// document.getElementById('background_url').src = get_url();
    	var url_name = get_hostname(url).split('.');
    
    	if(url_name[1] != "com")
    		document.body.style.background = "url(background/" + url_name[1] + ".png)"
    	else
    		document.body.style.background = "url(background/" + url_name[0] + ".png)"
    
    	// Focus on the text box
    	document.getElementsByName('valueInput')[0].focus();
    
    	console.log('ask_offer.js loaded');
	} else {
		set_url();
		// this is the countdown step
		console.log('this is a countdown');	
		var tit = document.getElementById('prompt1');
		tit.innerHTML = "CONGRAT! TODAY'S AWARD IS $<span id='our_offer'>00.00</span> !";
		tit.style.color = "black";
		tit.style.opacity = 1;
		var cdt = document.getElementById('ask');
		cdt.innerHTML = "<div id='remaining_time'><span id='remaining_hours'></span>:<span id='remaining_minutes'></span>:<span id='remaining_seconds'></span></div>";
		cdt.style.marginTop = '0px';
		// set the remaining time div
		var remain_time = get_remaining_time(url);
		if(remain_time != 'not clicked') {
			countdown(remain_time);
		}

	}

}

function set_url () {
	// Parses the extension url to get the incoming url
	var ws = window.location.search;
	if (ws !== undefined) {
		var kvs = ws.substring(1).split('&');
		for (var i = 0; i < kvs.length; i++) {
			var kv = kvs[i].split('=');
			if (kv[0] == 'url') {
				var url_objs = document.getElementsByClassName('url');
				for (var j=0; j<url_objs.length; j++) {
					var url = decodeURIComponent(kv[1]);
					var site_name = get_hostname(url);
					url_objs[j].href = url;
					url_objs[j].appendChild(document.createTextNode(site_name));
				}
			}
		}
	}	
}

// Submits the value inputted by the user to the server. 
function submit() {
	if(is_valid_value()) {
        store_block_data("value submitted", get_username(), get_url(),
                         document.getElementsByName("valueInput")[0].value);
	 	sliding_down();
     	start_fireworks();
     	setTimeout(unblock, 5000);
	} else {
		document.getElementsByName('valueInput')[0].value = "";
		document.getElementsByName('valueInput')[0].focus();		
	}
}

// Called by the event listener when the submit button is clicked
function clickHandler(event) {
	submit();
}

// Allows user to use enter key to submit
function keyboard_submit(event) {
	if(event.keyCode == 13)
		submit();
}

// Gets the url
function get_url() {
	return document.getElementsByClassName("url")[0].href;
}

function get_user_offer() {
	return document.getElementsByClassName('valueInput')[0].value;		
}

// Temporary function, replace with account system code
function get_username() {
	return get_data('username');
}

// Redirects the tab to the page the user intended to go to.
// start counting down
function unblock() {
	console.log('unblocking: ', get_url());
	var url = document.getElementsByClassName("url")[0];
	
	window.location = url.href + "";
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
	for (i = 0; i < value.length && char_result == true; i++) {
		var temp = value.charAt(i);
		if (valid_characters.indexOf(temp) == -1) {
			char_result = false;
		}
		if (temp == "."){
			point++;
		}
	}
	// Checks decimal point count
	if (point > 1)
		char_result = false;
	
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

function sliding_down() {	
	// append dollar bill
	var info = document.getElementById('info');
	var title_width = document.getElementById('singleClickOnGoThrough').clientWidth;
	var title_height = document.getElementById('singleClickOnGoThrough').clientHeight;
	var body_width = document.body.clientWidth;
	var body_height = document.body.clientHeight;
	var info_height = document.getElementById('info').clientHeight;
	var bill_x = 0.5 * parseInt(body_width - title_width) + 41; 
	//var bill_y = 0.5 * parseInt(body_height - info_height) + title_height + 20;
	var bill_y = title_height + 20;
	var amount_x = bill_x + 165;
	var amount_y = bill_y + 75;

	var bill = document.createElement('div');
	bill.innerHTML = "<img src='ask_offer_bill.png' style='position: absolute; left: " + bill_x + "px; top: " + bill_y + "px; z-index: -20; width: 430px;' />";

	var amount = document.createElement('div');
	amount.innerHTML = "<p style='margin: 0px; font-size: 30pt; color: black; position: absolute; left: " + amount_x + "px; top: " + amount_y + "px; z-index: -10;'>" + get_today_offer(document.getElementsByClassName('url')[0].innerHTML).toFixed(2) + "</p>";
	info.appendChild(bill);
	info.appendChild(amount);
	
	// sliding ask down
	var ask = document.getElementById('ask');
	var prompt1 = document.getElementById('prompt1');
	ask.style.marginTop = '5px';
	prompt1.style.opacity = 1;
	ask.style.opacity = 1;
	
	setInterval(function() {ask.style.marginTop = parseInt(ask.style.marginTop) + 1 + "px"; prompt1.style.opacity = parseFloat(prompt1.style.opacity) - 0.0045; ask.style.opacity = parseFloat(ask.style.opacity) - 0.0045;}, 20);
	
}

function get_remaining_time(url) {
		var temp_data = get_data('website_state');
		for(var i = 0; i < temp_data.length; i++) {
					if(url.indexOf(temp_data[i].url_pattern) != -1) {
						// found the data
						var now = new Date();
						var passed = now.getTime() - temp_data[i].last_day_check;
						console.log('passed: ' + passed);
						console.log('remaining' + (60*60*24*1000 - passed) / 1000);
						return parseInt((60*60*24*1000 - passed) / 1000);
					}
		}
		// cannot find it;
		return ('not clicked');
}

function countdown(total_seconds) {
	if (!timer) {
		document.getElementById('remaining_hours').innerHTML = parseInt(((total_seconds / 60) / 60) % 24);
		document.getElementById('remaining_minutes').innerHTML = parseInt((total_seconds / 60) % 60);
		document.getElementById('remaining_seconds').innerHTML = total_seconds % 60;

		timer = setInterval(oneSecond, 1000);
	}
}

function oneSecond() {
	var hrs = parseFloat(document.getElementById('remaining_hours').innerHTML);
	var min = parseFloat(document.getElementById('remaining_minutes').innerHTML);
	var sec = parseFloat(document.getElementById('remaining_seconds').innerHTML);
	var total_seconds = (hrs * 60 + min) * 60 + sec;
	if (total_seconds <= 1) {
		// time's up!
		clearInterval(timer);
		timer = null;
		total_seconds--;
		// trying to go through
		window.location = url;
	} else {
		total_seconds--;
	}
	var hours = parseInt(((total_seconds / 60) / 60) % 24);
	var minutes = parseInt((total_seconds / 60) % 60);
	var seconds = total_seconds % 60;
	document.getElementById('remaining_hours').innerHTML = (hours < 10 ? '0' : '') + hours;
	document.getElementById('remaining_minutes').innerHTML = (minutes < 10 ? '0' : '') + minutes;
	document.getElementById('remaining_seconds').innerHTML = (seconds < 10 ? '0' : '') + seconds;
}
