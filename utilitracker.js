if (get_data('urls_status'))
    localStorage.clear()

// Options
var urls = ['www.bing.com', 'facebook.com', 'reddit.com', 'renren.com',
            'quora.com', 'news.ycombinator.com', 'twitter.com',
            'google.com', 'friendbo.com', 'youtube.com'];
set_data('user', 'Debug_user');


// initialize the website_state
function initialize_website_state(urls) {
    var state = get_data('website_state')
    set_data('website_state',
             urls.map(function (url) {
                 return find_website_state(url, state) ||
                     {url_pattern: url,
                      user_offer: null,
                      last_day_check: null} }))
}
initialize_website_state(urls);

// remove the monitoring urls from website_state
function remove_website_state(urls) {
    var new_website_state = get_data('website_state').filter(
        // Keep this one if it doesn't match any of the urls
        function (website) {
            return urls.indexOf(website.url_pattern) != -1; })
    set_data('website_state', new_website_state);
}

function url_matches(url, website_state) {
    url = get_hostname(url) || url
    return url.indexOf(website_state.url_pattern) != -1
}
/** The second `state' parameter is optional */
function find_website_state(url, state) {
    state = state || get_data('website_state')
    return state.find(function (site) {
        return url_matches(url, site)
    })
}

// Check to see if it's a new day/ over 24 hours
function check_for_new_day (url) {
	// console.log('before checking: ', get_data('website_state'));
	var today_time = new Date();
	var states = get_data('website_state');
    states.each(function (state) {
		if(url_matches(url, state)) {
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

function test_listener(details) {
    console.log('test_listener');
    // check whether is a new day
    check_for_new_day(details.url);
	// Get the blocked state of the url
    var site = find_website_state(details.url);
    // If we don't care about this site, let's go away
    if (!site) {
        return {cancel: false};
    } else if (site.user_offer == null) {
        // If this site needs an offer, ask for it
		// Redirect tab to ask_offer.html
		return { redirectUrl : chrome.extension.getURL("ask_offer.html")
              + "?url=" + escape(details.url) };

        // Record the block event
		store_block_data("ask offer", get_username(), details.url, null);
    }

	// Otherwise, we have a user's offer for this
    // If the user's offer is less than ours, then we pay them and block
    var our_offer = 3; // Temporary until we get it from the server
    if (site.user_offer < our_offer) {
		// Redirect tab to countdown.html
        if (get_data('real_money')) {
            return { 'url' : chrome.extension.getURL("countdown.html")
              + "?url=" + escape(tab.url) };
        }
	}    
}

// add listener before request
chrome.webRequest.onBeforeRequest.addListener(
    test_listener, 
    {urls: ['<all_urls>']}, 
    ['blocking']);

// add listener when created the tab or updated the tab
// chrome.tabs.onUpdated.addListener(tabs_update_listener);
// chrome.tabs.onCreated.addListener(tabs_created_listener);


// Extracts hostname from the URL
// eg: https://www.google.com/webhp?hl=en&tab=nw&authuser=0 -> www.google.com
function get_hostname(str) {
    // Split at the http:// part
    var tmp = str.split('//')

    // If the // existed, grab the second part
    tmp = (tmp.length > 1) ? tmp[1] : tmp[0]

    // Now grab everything up to the first /
	return tmp.split('/')[0];
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
    
    notification.ondisplay = function() {
        // notifications auto disappear after 5 seconds
        setTimeout(function () {notification.cancel();}, 5000);
    };
        
    /*
    var window_id;
    chrome.windows.create({'url':'notification.html', 'type':'popup', 'height':200, 'width':300}, function(window) {
        window_id = window.id;
        chrome.windows.update(window_id, {'drawAttention':true, 'focused':true});

        setTimeout(function() {
            chrome.windows.remove(window.id, function() {})
        }, 3000);
    });    
    */
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