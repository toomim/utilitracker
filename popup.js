document.addEventListener("DOMContentLoaded", onload);
var background = chrome.extension.getBackgroundPage();

function onload() {
    load_visited_sites();
    get_user_total(background.get_data('username'));
    
    // update the badge on the icon
	// background.update_badge();    

    document.getElementById('reset_data').onclick = clear_data;
	document.getElementById('check_history_from_server').href = "http://yuno.us:8989/my_history?fullname=" + escape(background.get_data('username'));
    if (dev_mode()) $('.dev_mode').show();
}

function load_visited_sites() {
	var status = background.get_data("website_state");
	var sites_list = document.createElement('ul');
	
	var states = get_data('website_state');
    states.each(function (state) {
		if(state.user_offer != null) {
        	var site_name = document.createElement('li');
			if(state.user_offer <= state.our_offer) {
	        	site_name.innerHTML = state.url_pattern + " - <span id='blocked_site'>BLOCKED</span>";

	        	var site_earning = document.createElement('li');
	        	site_earning.innerHTML = "Earned $" + state.our_offer.toFixed(2);
	        	
	        	var site_block_time = document.createElement('li');
	        	var now = new Date();
	            var passed = now.getTime() - state.last_day_check;
	            var hours_left = parseInt((60*60*BLOCK_HOURS*1000 - passed) / (1000*60*60));

	            site_block_time.innerHTML = "Blocked for <" + (hours_left + 1) + " more hours";
	            
	        	var site_info = document.createElement('ul');
	        	site_info.appendChild(site_earning);
	        	site_info.appendChild(site_block_time);
	        	site_name.appendChild(site_info);
			} else {
				site_name.innerHTML = state.url_pattern + " - <span id='passed_site'>PASSED</span>";
			}
        	sites_list.appendChild(site_name);			
		}
    });
    if(sites_list.childElementCount) {
        document.getElementById('data_part').appendChild(sites_list);
    } else {
        document.getElementById('title_part').innerHTML = 'No websites blocked!';
    }    
}


function clear_data () {
    console.log('Clearing utilitracker data')
    //localStorage.clear()
    background.get_data('block_urls').each(function (url) {remove_website_state(url);});
    initialize_website_state(background.get_data('block_urls'));
    console.log('Cleared utilitracker data')
    //alert('Utilitracker data has been cleared');
}

function get_user_total(fullname) {
	// set the total data at first place
	$('#total_earned_data').html("$" + get_data('totalearned').toFixed(2));
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
					$('#total_earned_data').html("$" + response_json.totalearned.toFixed(2));	
					set_data('is_developer',
                             response_json.usertype == "debug_user")
				}
			} else {
				console.log("server error, try again later");
			}
		}
		console.log('response text: ', xmlHttp.responseText);
	};
	xmlHttp.send(params);	
}

