document.addEventListener("DOMContentLoaded", onload, false);
var background = chrome.extension.getBackgroundPage();
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
		var click_time = get_remaining_time(url);
		if(click_time != 'not clicked') {
		    var click_date = new Date(click_time);
		    document.getElementById('remaining_time').innerHTML = click_date;
		}
	}	
}

function get_remaining_time(url) {
		var temp_data = background.get_data('urls_status');
		console.log(temp_data);
		for(var i = 0; i < temp_data.length; i++) {
            		if(url.indexOf(temp_data[i].url_pattern) != -1) {
            		    // found the data
            		    return temp_data[i].last_day_check;
            		}
		}
		// cannot find it;
		return ('not clicked');
}

function set_timer() {
    var now = new Date();
    var theevent = new Date("Sep 29 2007 00:00:01");
    var seconds = (theevent - now) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    ID=window.setTimeout("update();", 1000);
    function update() {
    now = new Date();
    seconds = (theevent - now) / 1000;
    seconds = Math.round(seconds);
    minutes = seconds / 60;
    minutes = Math.round(minutes);
    hours = minutes / 60;
    hours = Math.round(hours);
    days = hours / 24;
    days = Math.round(days);
    document.form1.days.value = days;
    document.form1.hours.value = hours;
    document.form1.minutes.value = minutes;
    document.form1.seconds.value = seconds;
    ID=window.setTimeout("update();",1000);
}