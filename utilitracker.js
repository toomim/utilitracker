if (get_data('urls_status'))
    localStorage.clear()

// Options
set_data('urls', ['www.bing.com', 'facebook.com', 'reddit.com', 'renren.com']);
set_data('user', 'Debug_user');

initialize_website_state(get_data('urls'));


// initialize the website_state
function initialize_website_state(urls) {
	// State variables
	var sites = urls.map(function (url) {
	    return {url_pattern: url, user_offer: null, last_day_check: null}; 
	});
	set_data('website_state', sites);
}

// remove the monitoring urls from website_state
function remove_website_state(urls) {
    var new_website_state = get_data('website_state').filter(
        // Keep this one if it doesn't match any of the urls
        function (website) {
            return urls.indexOf(website.url_pattern) != -1; })
    set_data('website_state', new_website_state);
}

function find_website_state(url) {
    url = get_hostname(url) || url;
    return get_data('website_state').find(function (site) {
        return url.indexOf(site.url_pattern) != -1;
    })
}

// Check to see if it's a new day/ over 24 hours
function check_for_new_day (url) {
	// console.log('before checking: ', get_data('website_state'));
	var today_time = new Date();
	var states = get_data('website_state');
    states.each(function (state) {
		if(get_hostname(url).indexOf(state.url_pattern) != -1) {
			// console.log('matched: ', i, ' url: ', state.url_pattern);			
			var last_view = state.last_day_check;
			if(last_view != null) {
				// if the page is viewed before				
				// console.log('the page have been viewed before');
				if(today_time.getTime() - last_view >= (1000 * 60 * 60)) {
   		   			// If so, reset offers
   	 	  			console.log('reset offer for: ', url);
					state.user_offer = null;
					state.last_day_check = today_time.getTime();
       		 	}
			} else {
				// the page is not viewed before.
				// console.log('the page have NOT been viewed before');
				state.last_day_check = today_time.getTime();
			}
		}
    });

	set_data('website_state', states);
	// console.log('after checking: ', get_data('website_state'));
    // and go through all tabs and re-block what's needed    
    // console.log('should check tabs and reblock');   
}

// "Main" function - checks for blocked sites whenever a tab is updated.
// Redirects to our block page. 

function tabs_update_listener(tab_id, change_info, tab) {
    // check whether is a new day
    check_for_new_day(tab.url);
        
	// Get the blocked state of the url
    var site = find_website_state(tab.url)

    // If we don't care about this site, let's go away
    if (!site) return;

    // If this site needs an offer, ask for it
    if (site.user_offer == null) {
		// Redirect tab to ask_offer.html
		chrome.tabs.update(tab.id, 
			{ 'url' : chrome.extension.getURL("ask_offer.html")
              + "?url=" + escape(tab.url) });

        // Record the block event
		store_block_data("ask offer", get_username(), tab.url, null);
    }

	// Otherwise, we have a user's offer for this
    // If the user's offer is less than ours, then we pay them and block
    var our_offer = 3; // Temporary until we get it from the server
    if (site.user_offer < our_offer) {
		// Redirect tab to countdown.html
        if (get_data('real_money')) {
		    chrome.tabs.update(tab.id, 
			                   { 'url' : chrome.extension.getURL("countdown.html")
                                 + "?url=" + escape(tab.url) });
        }
	}
}
function tabs_created_listener(tab) {
	console.log('tab_created', tab.id);
	tabs_update_listener(null, null, tab);
}

// add listener when created the tab or updated the tab
chrome.tabs.onUpdated.addListener(tabs_update_listener);
chrome.tabs.onCreated.addListener(tabs_created_listener);


// Extracts hostname from the URL
// eg: https://www.google.com/webhp?hl=en&tab=nw&authuser=0 -> www.google.com
function get_hostname(str) {
	var exp = str.split('//')[1].split('/')[0];
	return exp;
}
function get_username() {
	return get_data('user');
}

function set_notification(title, body) {
    var notification = webkitNotifications.createNotification(
        'icon.png',
        title,  // notification title
        body  // notification body text
    );
    notification.show();
    
    setTimeout(function() { 
        notification.cancel(); 
    }, 5000);
}

// Stores url, time/date of block in localStorage
function store_block_data(event, user, tab_url, value) {
	// first store the data local:
	// store the user_offer
	
	if(event == 'value submitted') {
		// the user submit the data store in the sites
		console.log('store submit value');
		var status = get_data('website_state');
		// console.log(status);
		// alert('check console');
		for(var i = 0; i < status.length; i++) {
			var ob = status[i];
			if(tab_url.indexOf(ob.url_pattern) != -1 && ob.user_offer == null) {
				// console.log(ob.url_pattern, ' is trying to go through');
				status[i].user_offer = value;
			}
		}
		set_data('website_state', status);

        // Tell them they've been paid
        if (parseFloat(value) < 3)
            set_notification('You have been rewarded!', 'Thank you for your data.')
        // Todo: actually pay people

		// console.log(status);
	}

	
	// Get the time of block
	var time = new Date();
	var month = time.getMonth() + 1;
	var day = time.getDate();
	var year = time.getFullYear();
	var hour = time.getHours();
	var minute = time.getMinutes();
	var second = time.getSeconds();
	
	// Formatting time and date
	var time_date = month + "/" + day + "/" + year + " ";
	if(minute < 10){ minute = "0" + minute; }
	if(second < 10){ second = "0" + second; }
	time_date = time_date + hour + ":" + minute + ":" + second;
	
	// Stores data online
	// disable since server is not up yet
	//
	//
	// post_to_server(event, user, time_date, tab_url, value);
	//
	//
	//
	
	
	// Stores second copy in localStorage
	/*
	var array = JSON.parse(localStorage['log']);
	array.push(event, user, time_date, tab_url, value);
	localStorage['log'] = JSON.stringify(array);
	*/
	
}


// **************** SERVER INTERACTION ******************* //

// Pushes data about site blocks to the server:
// Type of block, user info, time, url, and surveyed value
function post_to_server(event, user, time_date, url, value) {
	
	var xmlHttp = new XMLHttpRequest();
	var tourl = "http://yuno.us:8989/save_event";
	var params = 
		"paid=" + value +
		"&what=" + event +  
		"&who=" + user + 
		"&when=" + time_date +
		"&url=" + url;
	xmlHttp.open("POST", tourl, false);
	
	//Send the proper header information along with the request  //x-www-form-urlencoded
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.setRequestHeader("Content-length", params.length);
	xmlHttp.setRequestHeader("Connection", "close");

	xmlHttp.onreadystatechange = function() {//Call a function when the state changes.
	    if(xmlHttp.readyState == 4) {
	        // alert(xmlHttp.statusText);
			if(xmlHttp.status == 200) {
				console.log(xmlHttp.responseText);
			}
	    }
	};
	xmlHttp.send(params);
}