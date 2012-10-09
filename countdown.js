document.addEventListener("DOMContentLoaded", onload, false);
var background = chrome.extension.getBackgroundPage();
var timer = null;
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
				u.appendChild(document.createTextNode(background.get_hostname(url)));
			}
		}
		
		// set the remaining time div
		var remain_time = get_remaining_time(url);
		if(remain_time != 'not clicked') {
            countdown(remain_time);
		}
	}	
}

function get_remaining_time(url) {
		var temp_data = background.get_data('urls_status');
		console.log(temp_data);
		for(var i = 0; i < temp_data.length; i++) {
            		if(url.indexOf(temp_data[i].url_pattern) != -1) {
            		    // found the data
            		    var now = new Date();
            		    var passed = now.getTime() - temp_data[i].last_day_check;
            		    console.log('passed: ' + passed);
            		    console.log('remaining' + (60*60*24*1000 - passed) / 1000);
            		    return ((60*60*24*1000 - passed) / 1000);
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
    var hrs = parseInt(document.getElementById('remaining_hours').innerHTML);
	var min = parseInt(document.getElementById('remaining_minutes').innerHTML);
	var sec = parseInt(document.getElementById('remaining_seconds').innerHTML);
	var total_seconds = (hrs * 60 + min) * 60 + sec;
	console.log(total_seconds);
	if (total_seconds <= 1) {
		// time's up!
		clearInterval(timer);
		timer = null;
        total_seconds--;
        // trying to go through
	} else {
        total_seconds--;
	}
	document.getElementById('remaining_hours').innerHTML = parseInt(((total_seconds / 60) / 60) % 24);
	document.getElementById('remaining_minutes').innerHTML = parseInt((total_seconds / 60) % 60);
	document.getElementById('remaining_seconds').innerHTML = total_seconds % 60;
}