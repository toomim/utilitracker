document.addEventListener("DOMContentLoaded", onload);
var background = chrome.extension.getBackgroundPage();

function onload() {
    load_visited_sites();
    document.getElementById('reset_data').onclick = clear_data;
	document.getElementById('check_history_from_server').href = "http://yuno.us:8989/my_history?fullname=" + escape(background.get_data('username'));
}

function load_visited_sites() {
	var status = background.get_data("website_state");
	var ul = document.createElement('ul');
	
	var states = get_data('website_state');
    states.each(function (state) {
		if(state.user_offer != null) {
        	var tmp = document.createElement('li'); 
        	tmp.innerHTML = state.url_pattern + ' user_offer: ' + state.user_offer + ' our_offer: ' + state.our_offer + ' last_day_check: ' + state.last_day_check;
        	ul.appendChild(tmp);		
		}
    });
    if(ul.childElementCount) {
        document.getElementById('data_part').appendChild(ul);
    } else {
        document.getElementById('title_part').innerHTML = 'no website visited yet';
    }
}


function clear_data () {
    console.log('Clearing utilitracker data')
    localStorage.clear()
    initialize_website_state(urls);
    console.log('Cleared utilitracker data')
    //alert('Utilitracker data has been cleared');
}
