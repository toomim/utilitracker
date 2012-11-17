document.addEventListener("DOMContentLoaded", onload, false);
var background = chrome.extension.getBackgroundPage();
var timer = null;
var url;
function onload() {
	// Parses the extension url to get the incoming url
	var ws = window.location.search;
	if (ws !== undefined) {
		var kvs = ws.substring(1).split('&');
		for (var i = 0; i < kvs.length; i++) {
			var kv = kvs[i].split('=');
			if (kv[0] == 'url') {
			
				var u = document.getElementById("url");
					   
				url = decodeURIComponent(kv[1]);
				u.href = url;
				u.appendChild(document.createTextNode(background.get_hostname(url)));
			}
		}		
	}	

	// set the remaining time div
	var remain_time = get_remaining_time(url);
	if(remain_time != 'not clicked') {
        countdown(remain_time);
	}

    document.getElementById('our_offer').innerHTML = get_today_offer(url).toFixed(2);
    document.getElementById('reset_data').onclick = clear_data;

    var url_name = get_hostname(url).split('.');
    if(url_name[1] != "com")
    	document.body.style.background = "url(background/" + url_name[1] + ".png)"
    else
    	document.body.style.background = "url(background/" + url_name[0] + ".png)"

    
    // add listener skip the countdown page (for sneaky experts like us)
    /*
    document.getElementById('lock_pic').ondblclick = (function() {
        var states = get_data('website_state');
        states.each(function (state) {
		    if(url_matches(url, state)) {
                state.user_offer = 'PASS';                
			}
        });
        set_data('website_state', states);
        window.location = url;
    }); 
    */
    document.getElementById('emegency_go_through').onclick = (function() {
        var states = get_data('website_state');
        states.each(function (state) {
		    if(url_matches(url, state)) {
                state.user_offer = 'PASS';                
			}
        });
        set_data('website_state', states);
        window.location = url;    
    });
}

function get_remaining_time(url) {
		var temp_data = background.get_data('website_state');
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