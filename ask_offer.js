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

function show_block_stuff(instantly) {
	// set the remaining time div
	var remain_time = get_remaining_time(get_url());
	if(remain_time != 'not clicked') {
		countdown(remain_time);
	}

    // Start the remaining time counting down
	var timerr = setInterval(function(){
        $('#status_bar').css('width',
                             430 - (430.0 * get_remaining_time(get_url())/(60*60*24)))
	}, 1000);


    var duration = instantly ? 0 : 3000;
    $('#singleClickOnGoThrough').css({'margin-top':'0px', opacity: 1})
        .animate({'margin-top': '-50px', opacity: 0}, {duration: duration});
    $('#ask').css({'margin-top':'5px', opacity: 1})
        .animate({'margin-top': '200px', opacity: 0}, {duration: duration});
    $('#tint').animate({'background-color': '#222'},
                       {/*complete: unblock,*/ duration: duration});

    if (instantly || true) {
        console.log('Showing page 2', $('#block_section')[0])
        $('#block_section').show();
        $('#skip_section').show();
        $('#gift_box').hide();
        console.log('Showed page 2')
    } else {
        $('#block_section').fadeIn();
        $('#skip_section').fadeIn();
        $('#gift_box').fadeOut();
    }        

/*
	// append dollar bill
	var info = document.getElementById('info');
	var title_width = document.getElementById('singleClickOnGoThrough').clientWidth;
	var title_height = document.getElementById('singleClickOnGoThrough').clientHeight;
	var body_width = document.body.clientWidth;
	var body_height = document.body.clientHeight;
	var info_height = document.getElementById('info').clientHeight;
	//var bill_x = 0.5 * parseInt(body_width - title_width) + 100; 
	var bill_x = 363;
	//var bill_y = 0.5 * parseInt(body_height - info_height) + title_height + 20;
	//var bill_y = title_height + 40;
	var bill_y = 149;
	var amount_x = bill_x + 165;
	var amount_y = bill_y + 75;

	var bill = document.createElement('div');
	bill.innerHTML = "<img src='ask_offer_bill.png' style='position: absolute; left: " + bill_x + "px; top: " + bill_y + "px; z-index: -20; width: 430px;' />";

	var amount = document.createElement('div');
	amount.innerHTML = "<p style='margin: 0px; font-size: 30pt; color: black; position: absolute; left: " + amount_x + "px; top: " + amount_y + "px; z-index: -10;'>" + get_today_offer(document.getElementsByClassName('url')[0].innerHTML).toFixed(2) + "</p>";
	info.appendChild(bill);
	info.appendChild(amount);
*/

}

// Called by the event listener when the page loads
function onload() {
    var url = get_url();
	
    // Choose which stage of animation we're displaying
	site = find_website_state(url);
	if(site.user_offer != null)
        show_block_stuff(true)

    // Add Event Listeners
	document.body.addEventListener('keypress', keyboard_submit);
	$('#submitButton').click(clickHandler);

    // Set up the escape arrow event listeners
    $('#skip_prompt').hide();
    $('#skip_arrow').mouseover(function () {
        $('#skip_prompt').show();
        $('#skip_prompt').mouseleave(function () {
            $('#skip_prompt').hide();
        });
        $('#confirm_btn').click(function () {
            bypass_website_state(url);
            unblock();
        });
        $('#money').html(parseFloat(find_website_state(url).our_offer).toFixed(2));
        $('#website').html(find_website_state(url).url_pattern); });

    // Set up the reset this debugging button
    $('#resetthis').click(function () {
        remove_website_state(find_website_state(url).url_pattern);
        unblock(); });

	// set up the a/b test
    var v = get_data('variant') || 0;
    v = Math.min(v, variants.length - 1)
    set_data('variant', (v+1) % variants.length);
    $('#prompt2').html(variants[v][0]);

    // Set the dollar amount in the dollar bill
    $('#dollar_amount').html('' + get_today_offer(get_url()))

	// set the background page according to the url
    var url_name = get_hostname(url).split('.');
    if(url_name[1] != "com")
    	document.body.style.background = "url(background/" + url_name[1] + ".png)"
    else
    	document.body.style.background = "url(background/" + url_name[0] + ".png)"
    
    // Set the url for all class="url" objects
    set_urls();

    // Focus on the text box
    $('#valueInput').focus()
}

function get_url () {
	// Parses the extension url to get the incoming url
	if (!location.search) return
	var url = location.search.substring(1).split('&')
        .map (function (keyval) {return keyval.split('=');})
        .find (function (keyval) {return keyval[0] == 'url';})[1];
    return decodeURIComponent(url);
}

function set_urls () {
    var url = get_url()
    var site_name = get_hostname(url);

	$('.url').each(function () {
        this.href = url;
        this.appendChild(document.createTextNode(site_name));
    });
}


// Submits the value inputted by the user to the server. 
function submit() {
	if(is_valid_value()) {
        store_block_data("value submitted", get_username(), get_url(),
                         $("#valueInput")[0].value);

	 	show_block_stuff()
	} else {
		$('#valueInput').val('').focus()
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
function get_user_offer() {
	return $('#valueInput')[0].value
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
	var value = $('#valueInput')[0].value;
	var error = $("#errorAlert");
	
	// Make sure value contains only numbers and up to one decimal point
	var valid_characters = "0123456789.";	
	var char_result = true;	
	var point = 0;
	
	// Check each character for validity, decimal points
	for (var i = 0; i < value.length && char_result == true; i++) {
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

function get_remaining_time(url) {
	var temp_data = get_data('website_state');
	for(var i = 0; i < temp_data.length; i++) {
		if(url.indexOf(temp_data[i].url_pattern) != -1) {
			// found the data
			var now = new Date();
			var passed = now.getTime() - temp_data[i].last_day_check;
			//console.log('passed: ' + passed);
			//console.log('remaining' + (60*60*24*1000 - passed) / 1000);
			return parseInt((60*60*24*1000 - passed) / 1000);
		}
	}
	// cannot find it;
	return ('not clicked');
}

function countdown(total_seconds) {
	if (!timer) {
        $('#remaining_hours').html(parseInt(((total_seconds / 60) / 60) % 24))
		$('#remaining_minutes').html(parseInt((total_seconds / 60) % 60));
		$('#remaining_seconds').html(total_seconds % 60);

		timer = setInterval(oneSecond, 1000);
	}
}

function oneSecond() {
	var hrs = parseFloat($('#remaining_hours').html());
	var min = parseFloat($('#remaining_minutes').html());
	var sec = parseFloat($('#remaining_seconds').html());
	var total_seconds = (hrs * 60 + min) * 60 + sec;
	if (total_seconds <= 1) {
		// time's up!
		clearInterval(timer);
		timer = null;
		total_seconds--;
		// trying to go through
		//window.location = url;
	} else {
		total_seconds--;
	}
	var hours = parseInt(((total_seconds / 60) / 60) % 24);
	var minutes = parseInt((total_seconds / 60) % 60);
	var seconds = total_seconds % 60;
	$('#remaining_hours').html((hours < 10 ? '0' : '') + hours);
	$('#remaining_minutes').html((minutes < 10 ? '0' : '') + minutes);
	$('#remaining_seconds').html((seconds < 10 ? '0' : '') + seconds);
}
