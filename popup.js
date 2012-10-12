document.addEventListener("DOMContentLoaded", onload);
var background = chrome.extension.getBackgroundPage();
function onload() {
	var status = background.get_data("website_state");
	var ul = document.createElement('ul');
	for(var i = 0; i < status.length; i++) {
	    var tmp = document.createElement('li'); 
	    tmp.innerHTML = status[i].url_pattern + ' user_offer: ' + status[i].user_offer + ' last_day_check: ' + status[i].last_day_check;
		ul.appendChild(tmp);		
	}
	document.getElementById('data_part').appendChild(ul);
}
