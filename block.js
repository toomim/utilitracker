var BLOCK_HOURS = 3;

// A/B test options go in here.
var variants = [
    {title: 'RANDOM CASH OFFER',
     body: 'Yours if you accept ' + BLOCK_HOURS + ' hours of blocked <a class="url"></a> access.'
           + '<br>How much would it need to be?'}, 
 /*   {title: 'CASH CHANCE',
     body: 'Sell your <a class="url"></a> access for 24 hours.'
     	   + '<br>Name your price.'},
    {title: 'REWARD CHANCE',
     body: 'Sell your <a class="url"></a> access for 24 hours.'
     	   + '<br>Name your price.'},*/
    {title: 'REWARD OPPORTUNITY',
     body: 'Yours if you accept ' + BLOCK_HOURS + ' hours of blocked <a class="url"></a> access.'
     	   + '<br>How much would it need to be?'},
    {title: 'CASH CHANCE',
     body: 'How much money would you need to be awarded to allow yourself to be blocked from <a class="url"></a> for ' + BLOCK_HOURS + ' hours?'},
    {title: 'RANDOM CASH OFFER',
     body: "We will pay you to be blocked for " + BLOCK_HOURS + " hours from <a class=\"url\"></a>, if your bid is low enough."},
    {title: 'RANDOM CASH OFFER',
     body: "We could pay you to be blocked for " + BLOCK_HOURS + " hours from <a class=\"url\"></a>, how much is it worth to you?"},

    {title: '',
     body: 'How much would we have to pay you for you to accept ' + BLOCK_HOURS + ' hours of blocked <a class=\"url\"></a> access?'}
]

function get_url () {
	// Parses the extension url to get the incoming url
	if (!location.search) return
	var url = location.search.substring(1).split('&')
        .map (function (keyval) {return keyval.split('=');})
        .find (function (keyval) {return keyval[0] == 'url';})[1];
    return decodeURIComponent(url);
}
var url = get_url(); // The original url that the user wanted to go to

// These listeners allows this javascript to be executed in the extension without
// being blocked by Chrome for security reasons
document.addEventListener("DOMContentLoaded", onload, false);

function show_block_stuff(instantly) {
    // Initialize the countdown, and then start it counting down
    update_countdown()
	countdown_timer = setInterval(update_countdown, 1000)

    // Now we'll animate stuff
    var duration = instantly ? 0 : 2000;

    // This takes gift box out of the DOM order, so that the block section
    // fades in underneath it intead of being pushed below it
    $('#gift_box').make_absolute()

    //$('#gift_box').fadeOut(duration);
    
    // easeOutCirc from jQueryUI source code
    $.extend($.easing,
    {
        		easeOutCirc: function (x, t, b, c, d) {
                    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
                }
    });

    $('#block_section').show();
    $('#status_bar').hide();
    
    // And ... the big moment ... DOES HE WIN THE FISH?
    var site_state = find_website_state(url)
    if (site_state.user_offer > todays_offer) {
        exceeded_offer();
    } else {
        $('#gift_box_top').animate(
            {'margin-top': '-200px'},
            {
                duration: duration,
                easing: 'easeOutCirc',
                complete: function() {
                    $('#tint').animate(
                        {'background-color': '#222'},
                        {
                            duration: duration
                        }
                    );
                    $('#skip_section').fadeIn(duration);
                    $('#status_bar').show();
                    // And animate the status bar to make it look real
                    setTimeout(status_bar_init(1000), duration);
                }
            }
        );
        $('#gift_box_bottom').animate(
            {'margin-top': '600px'},
            {
                duration: duration,
                easing: 'easeOutCirc'
            }
        );
		// show the bottom bar
		var mssss;
		$.getJSON("http://yuno.us:8989/my_history?fullname=" + escape(get_data('username')), function(data) {
			mssss = data.totalearned;
		});
	   	$('#bottom_bar').show();
	   	$('#bottom_bar').html("You will receive the money after the timer goes off. <a href='http://yuno.us:8989/my_history?fullname=" + escape(get_data('username')) + "'>Click for more details.</a>");
    }
    // Hide the old junk
    setTimeout(function () {$('#gift_box').hide()}, duration);
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
	document.body.addEventListener('keypress',
                                   function (event) {if(event.keyCode == 13) submit()})
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

/*    $('#resetthis').click(function () {
        remove_website_state(find_website_state(url).url_pattern);
        unblock(); });
*/
	// set up the a/b test
    var v = get_data('variant') || 0;
    v = Math.min(v, variants.length - 1)
    set_data('variant', (v+1) % variants.length);
    $('#gift_box_top_msg').html(variants[v].title);
    $('#prompt').html(variants[v].body);

    // Set the dollar amount in the dollar bill
    $('#dollar_amount').html('' + get_todays_offer(url))
    
    $('#dollar_amount_outline').html('$' + get_todays_offer(url))

	// set the background page according to the url
    var url_name = get_hostname(url).split('.');
    if(url_name[1] != "com")
    	document.body.style.background = "url(background/" + url_name[1] + ".png)"
    else
    	document.body.style.background = "url(background/" + url_name[0] + ".png)"
    
    // Set the url for all class="url" objects
    $('.url').attr('href', url).append(get_hostname(url));

    // Focus on the text box
    var is_in_iframe = !(window.self === window.top);
    if (!is_in_iframe) //$(window).height() > 800 && $(window).width() > 700
        $('#valueInput').focus()

    //setTimeout(100, function () { console.log('6', $('#block_section').css('display')) })

    if (dev_mode()) $('.dev_mode').show()
}

// Called when the user's offer exceeds our offer to show the "exceeds offer" page
function exceeded_offer() {
    $('#congratulation').hide();
    $('#status_bar').hide();
    $('#unblocked_url').hide();
    $('#remaining_time').hide();
    // $('#resetthis').hide();
    $('#skip_section').hide();
    $('#dollar_bill').hide();
    $('#gift_box').animate(
        {opacity: 0},
        {
            duration: 2000,
        }
    );
    setTimeout(unblock, 3000);
    $('#gift_outline').show();
    $('#exceed_offer').show();
    $('#enjoy_visit').show();
    $('.url').css("color", "#888");
}

// Redirects the tab to the page the user intended to go to.
function unblock() {
	console.log('unblocking: ', url);
	window.location.replace(url);
}


// Submits the value inputted by the user to the server. 
function submit() {
	if(!is_valid_value()) {
		// should return some error code
		$('#error_msg').html('invalid input, try again')
		setTimeout(function() {
			$('#error_msg').html('')
		}, 1000)
		$('#valueInput').val('').focus()
        return
    }

    // Otherwise, let's roll
    store_block_data("value submitted", get_data('username'), url,
                     $("#valueInput").val());
    
    // Sets last_check_date after submit button is pressed
    // (Makes it so the countdown will only start after user submits a value)
    update_last_check(url);
	show_block_stuff();
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
	return parseInt((60*60*BLOCK_HOURS*1000 - passed) / 1000);
}

var countdown_timer;
function update_countdown () {
    var seconds = time_left();

    // Update the clock
    $('#remaining_hours').html(pad2(parseInt(((seconds / 60) / 60) % 24)))
	$('#remaining_minutes').html(pad2(parseInt((seconds / 60) % 60)));
	$('#remaining_seconds').html(pad2(seconds % 60));

    // Update the dollar bill cover
    $('#status_bar').css('width', (430.0 * seconds/(60*60*BLOCK_HOURS)))

    // Time's up?
	if (seconds <= 1)
        unblock()
}

function pad2(number) {
	 return (number < 10 ? '0' : '') + number
}

// function that make the status bar grow from zero at beginning
// make it look real
function status_bar_init(duration) {
	var seconds = time_left();

	$('#status_bar').css('width', 0);
	$('#status_bar').animate({'width' : 430.0 * seconds/(60*60*BLOCK_HOURS)}, duration);
	
}
