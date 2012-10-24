if (get_data('urls_status'))
    localStorage.clear()

// Options
var urls = ['www.bing.com', 'facebook.com', 'reddit.com', 'renren.com',
            'quora.com', 'news.ycombinator.com', 'twitter.com',
            'google.com', 'friendbo.com', 'youtube.com'];
set_data('user', 'Debug_user');

var timer;

// initialize the website_state
function initialize_website_state(urls) {
    var state = get_data('website_state')
    set_data('website_state',
             urls.map(function (url) {
                 return find_website_state(url, state) ||
                     {url_pattern: url,
                      user_offer: null,
                      our_offer: null,
                      offer_day_check:null,
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
function find_website_state(url, optional_state) {
    var state = optional_state || get_data('website_state');
    if(!state) return false;
    return state.find(function (site) {
        return url_matches(url, site)
    })
}

function get_today_offer(url) {
    var states = get_data('website_state');
    var result;
    states.each(function (state) {
		if(url_matches(url, state)) {
            // check whether the our_offer is check in a new day
            var today_date = new Date();
            
            if(today_date.getTime() - state.offer_day_check < (1000*60*60*24)) {
                result = state.our_offer;
            } else {
                state.offer_day_check = today_date.getTime();
                result = 100;
                while(result > 40) {
                    result = Math.pow(1.2, (Math.random() * 40 - 14));
                }
                state.our_offer = result;
            }
		}
    });
    set_data('website_state', states);
    
    return result;
}

// Check to see if it's a new day/ over 24 hours
function check_for_new_day (url) {
	var today_time = new Date();
	var states = get_data('website_state');
	states.each(function (state) {
		if(url_matches(url, state)) {
			// console.log('matched: ', i, ' url: ', state.url_pattern);			
			var last_view = state.last_day_check;
			if(last_view != null) {
				// if the page is viewed before				
				if(today_time.getTime() - last_view >= (1000 * 60 * 60 * 24)) {
   		   			// If so, reset offers
   	 	  			console.log('reset offer for: ', url);
					state.user_offer = null;
					state.last_day_check = today_time.getTime();
       		 	}
			} else {
				// the page is not viewed before.
				state.last_day_check = today_time.getTime();
			}
		}
	});

	set_data('website_state', states);
}

// "Main" function - checks for blocked sites whenever a tab is updated.
// Redirects to our block page. 

function test_listener(details) {
    console.log('test_listener');
	// Get the blocked state of the url
    var site = find_website_state(details.url);
    // If we don't care about this site, let's go away
    if (!site) {
        return {cancel: false};
    }
	//check whether the user is registered
	// if not registered, redirect to the setup page
    var registered_name = get_data('username');
    if(registered_name == "default_user") {
        return {redirectUrl: chrome.extension.getURL("set_up.html")
            + "?url=" + escape(details.url) };
    }
    // check whether is a new day
    check_for_new_day(details.url);
    site = find_website_state(details.url);
    if (site.user_offer == null) {
        // If this site needs an offer, ask for it
		// Redirect tab to ask_offer.html
		return { redirectUrl : chrome.extension.getURL("ask_offer.html")
              + "?url=" + escape(details.url) };
        // Record the block event
		store_block_data("ask offer", get_username(), details.url, null);
    }
	// Otherwise, we have a user's offer for this
    // If the user's offer is less than ours, then we pay them and block
    if (site.user_offer < get_today_offer(details.url)) {
        // Record the block event
    	store_block_data("blocked", get_username(), details.url, site.user_offer);        
		// Redirect tab to countdown.html
        return { redirectUrl : chrome.extension.getURL("countdown.html")
            + "?url=" + escape(details.url)};
	} 	
}

function pass_listener(tab_id, change_info, tab) {
    console.log('pass_listener');
    var site = find_website_state(tab.url);
	if(site.user_offer == 'PASS') {
	    // show timer in the upper right corner for 5 seconds
	    var now = new Date();
        var passed = now.getTime() - site.last_day_check;
        var sec = parseInt((60*60*24*1000 - passed)/1000);
        chrome.tabs.executeScript(tab_id, {code: "var seconds_left = " + sec + ";"});
        chrome.tabs.executeScript(tab_id, {file: "inline.js"});
        // countdown(sec);
	}   
}

chrome.tabs.onUpdated.addListener(pass_listener);


// add listener before request
chrome.webRequest.onBeforeRequest.addListener(
    test_listener, 
    {urls: ['<all_urls>']}, 
    ['blocking']);


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
	return get_data('username');
}

// Stores url, time/date of block in localStorage
function store_block_data(event, user, tab_url, value) {
	// first store the data local:
	// store the user_offer
	
	if(event == 'value submitted') {
		// the user submit the data store in the sites
		console.log('store submit value');
		var status = get_data('website_state');
		for(var i = 0; i < status.length; i++) {
			var ob = status[i];
			if(tab_url.indexOf(ob.url_pattern) != -1 && ob.user_offer == null) {
				status[i].user_offer = value;
			}
		}
		set_data('website_state', status);
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
		"&who=" + escape(user) + 
		"&when=" + time_date +
		"&url=" + url;
	xmlHttp.open("POST", tourl, true);
	
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
		console.log(xmlHttp.responseText);
	};
    console.log(params);
	xmlHttp.send(params);
}