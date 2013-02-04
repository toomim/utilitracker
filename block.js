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
var url = get_url()

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
    // Initialize the countdown, and then start it counting down
    update_countdown()
	var timer = setInterval(update_countdown, 1000)

    var duration = instantly ? 0 : 3000;
    $('#singleClickOnGoThrough').css({'margin-top':'0px', opacity: 1})
        .animate({'margin-top': '-50px', opacity: 0}, {duration: duration});
    $('#ask').css({'margin-top':'5px', opacity: 1})
        .animate({'margin-top': '200px', opacity: 0}, {duration: duration});
    $('#tint').animate({'background-color': '#222'},
                       {/*complete: unblock,*/ duration: duration});

    // This takes gift box out of the DOM order, so that the block section
    // fades in underneath it intead of being pushed below it
    $('#gift_box').make_absolute()

    if (instantly) {
        $('#block_section').show()
        $('#skip_section').show()
        $('#gift_box').hide()
    } else {
        $('#block_section').fadeIn(duration);
        $('#skip_section').fadeIn(duration);
        $('#gift_box').fadeOut(duration);
    }        

    var site_state = find_website_state(url)
    if (site_state.user_offer > get_todays_offer(url))
        setTimeout(unblock, 1000)
}

var todays_offer;

// Called by the event listener when the page loads
function onload() {
    todays_offer = get_todays_offer(url)
	
    // Choose which stage of animation we're displaying
	site = find_website_state(url);
	if(site.user_offer != null)
        show_block_stuff(true)

    // Add Event Listeners
	document.body.addEventListener('keypress', keyboard_submit);
	$('#submitButton').click(submit);

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
    $('#dollar_amount').html('' + get_todays_offer(url))

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

    //setTimeout(100, function () { console.log('6', $('#block_section').css('display')) })

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
    $('.url').attr('href', url).append(get_hostname(url));
}


// Submits the value inputted by the user to the server. 
function submit() {
	if(!is_valid_value()) {
		$('#valueInput').val('').focus()
        return
    }

    // Otherwise, let's roll
    store_block_data("value submitted", get_username(), url,
                     $("#valueInput").val());
	show_block_stuff()
}

// Allows user to use enter key to submit
function keyboard_submit(event) {
	if(event.keyCode == 13)
		submit();
}

// Gets the url
function get_user_offer() {
	return $('#valueInput').val()
}

// Temporary function, replace with account system code
function get_username() {
	return get_data('username');
}

// Redirects the tab to the page the user intended to go to.
function unblock() {
	console.log('unblocking: ', url);
	window.location = url;
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


function time_left() {
    var site = find_website_state(url); if (!site) return null;

	var now = new Date();
	var passed = now.getTime() - site.last_day_check;
	return parseInt((60*60*24*1000 - passed) / 1000);
}

function update_countdown () {
    var seconds = time_left();

    // Update the clock
    $('#remaining_hours').html(parseInt(((seconds / 60) / 60) % 24))
	$('#remaining_minutes').html(parseInt((seconds / 60) % 60));
	$('#remaining_seconds').html(seconds % 60);

    // Update the dollar bill cover
    $('#status_bar').css('width', 430 - (430.0 * seconds/(60*60*24)))

    // Time's up?
	if (seconds <= 1)
        unblock()
}

