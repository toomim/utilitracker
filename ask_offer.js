// A/B test options go in here.  There are two prompts, so this is an
// array of tuples of size 2.
var variants = [['<div class="subtitle">Sell your <a class="url"></a> access for 24 hours.<br>Name your price.</div><br><br>',
                 '<img src="lock_dim.png" class="lock">'],
                ['<div class="subtitle">Sell your <a class="url"></a> access for 24 hours.<br>Set your asking price.</div><br><br>',
                 '<img src="lock_dim.png" class="lock">'],
                ['<div class="subtitle">Sell your <a class="url"></a> access for 24 hours.<br>Name your price.</div><br><br>',
                 '<img src="lock_dim.png" class="lock">'],
]

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

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('body').addEventListener('keypress', keyboard_submit);
	document.querySelector('#continueButton').addEventListener('click', clickHandler);
});

// Called by the event listener when the page loads
function onload() {
    // Set up the a/b test
    var v = get_data('variant') || 0;
    v = Math.min(v, variants.length - 1)
    // document.getElementById('prompt1').innerHTML = variants[v][0];
    // document.getElementById('prompt2').innerHTML = variants[v][1];
    set_data('variant', (v+1) % variants.length);
	document.getElementById('prompt1').innerHTML = "<img src='ask_offer_title.png' />";
	document.getElementById('prompt2').innerHTML = variants[v][0];
    
    /*var tmp = 'variations: '
    for (var i=0; i<variants.length; i++)
        tmp += '<a href="#">' + i + '</a> '
    document.getElementById('ab_test_options').innerHTML = tmp*/

	// Parses the extension url to get the incoming url
	var ws = window.location.search;
	if (ws !== undefined) {
		var kvs = ws.substring(1).split('&');
		for (var i = 0; i < kvs.length; i++) {
			var kv = kvs[i].split('=');
			if (kv[0] == 'url') {
				var url_objs = document.getElementsByClassName("url");
                for (var j=0; j<url_objs.length; j++) {
				    var url = decodeURIComponent(kv[1]);
			        var site_name = get_hostname(url);
				    url_objs[j].href = url;
				    url_objs[j].appendChild(document.createTextNode(site_name));
			    }
            }
		}
	}	
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
}

// Submits the value inputted by the user to the server. 
function submit() {
	if(is_valid_value()) {
        store_block_data("value submitted", get_username(), get_url(),
                         document.getElementsByName("valueInput")[0].value);
	 	sliding_down();
     	start_fireworks();
     	setTimeout(unblock, 5000);
		// unblock();
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
	var bill_x = 0.5 * parseInt(body_width - title_width) + 56; 
	var bill_y = 0.5 * parseInt(body_height - info_height) + title_height + 20;
	
	console.log("title_width: ", title_width, " title_height: ", title_height);
	console.log("body_width: ", body_width, " body_height: ", body_height);
	console.log("bill_x: ", bill_x, " bill_y: ", bill_y);
	var bill = document.createElement('div');
	bill.innerHTML = "<img src='ask_offer_bill.png' style='position: absolute; left: " + bill_x + "px; top: " + bill_y + "px; z-index: -20; width: 400px;' />";
	console.log("new bill: ", bill.innerHTML);

	info.appendChild(bill);
	
	// sliding ask down
	var ask = document.getElementById('ask');
	ask.style.marginTop = '5px';
	console.log(parseInt(ask.style.marginTop));
	setInterval(function() {ask.style.marginTop = parseInt(ask.style.marginTop) + 1 + "px";}, 20);
	
}

