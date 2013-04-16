document.addEventListener("DOMContentLoaded", onload);
var background = chrome.extension.getBackgroundPage();

function onload() {
    load_visited_sites();
    get_user_total(background.get_data('username'));
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
			if(state.user_offer <= state.our_offer) {
	        	tmp.innerHTML = state.url_pattern;
			} else {
				tmp.innerHTML = state.url_pattern + " (pass)"
			}
        	ul.appendChild(tmp);			
		}
    });
    if(ul.childElementCount) {
        document.getElementById('data_part').appendChild(ul);
    } else {
        document.getElementById('title_part').innerHTML = 'no website blocked';
    }
}


function clear_data () {
    console.log('Clearing utilitracker data')
    //localStorage.clear()
    urls.each(function (url) {remove_website_state(url);});
    initialize_website_state(urls);
    console.log('Cleared utilitracker data')
    //alert('Utilitracker data has been cleared');
}

function get_user_total(fullname) {
	// set the total data at first place
	$('#total_earned').html("Total earned: " + get_data('totalearned').toFixed(2));
	// open new http request
	var xmlHttp = new XMLHttpRequest();
	tourl = "http://yuno.us:8989/calculate_user";
	var params = 
		"fullname=" + escape(fullname);
	xmlHttp.open("POST", tourl, true);

	//Send the proper header information along with the request  //x-www-form-urlencoded
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.setRequestHeader("Content-length", params.length);
	xmlHttp.setRequestHeader("Connection", "close");

	xmlHttp.onreadystatechange = function() {
		//Call a function when the state changes.
		if(xmlHttp.readyState == 4) {
			if(xmlHttp.status == 200) {
				var response_json = JSON.parse(xmlHttp.responseText);
				if(response_json.status == "succeed") {
					set_data('totalearned', response_json.totalearned);
					$('#total_earned').html("Total earned: " + response_json.totalearned.toFixed(2));		
				}
			} else {
				console.log("server error, try again later");
			}
		}
		console.log('response text: ', xmlHttp.responseText);
	};
	xmlHttp.send(params);	
}

