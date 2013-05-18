if (get_data('urls_status'))
    localStorage.clear()

// Options
var BLOCK_HOURS = 3;
var initial_urls = ['facebook.com', 'google.com'
            /* 'bing.com', 'reddit.com', 'renren.com',
            'quora.com', 'ycombinator.com', 'twitter.com',
            'friendbo.com', 'youtube.com' */];
var blacklisted_urls = {};
get_data('block_urls').each(function (u) {blacklisted_urls[u] = true;});

var developers = ['Michael Toomim', 'derek', 'guan', 'siye liu', 'chet']
function dev_mode() {
    return get_data('is_developer')
    return developers.contains(get_data('username')) }


// update_badge();

function update_badge() {
    // update the badge in the icon 
    var user_total_amount = get_data('totalearned'); 
    	
    console.log("total earned: " + user_total_amount);
    if(user_total_amount) {
    	chrome.browserAction.setBadgeText({text:'$' + parseInt(user_total_amount)});
    }   
}

// set the notications
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
                      last_day_check: null} }));
	blacklisted_urls = {};
    get_data('block_urls').each(function (u) {blacklisted_urls[u] = true;});

}
initialize_website_state(get_data('block_urls'));

function remove_website_state(url) {
    var tmp = get_data('website_state').filter(
        // Keep this one if it doesn't match any of the urls_to_remove
        function (website) {
            return url != website.url_pattern})
    set_data('website_state', tmp);
    initialize_website_state(get_data('block_urls'));
}

// can get blocked websites for today
function fetch_study_status() {
	// open new http request
	var xmlHttp = new XMLHttpRequest();
	tourl = "http://yuno.us:8989/fetch_study_status";
	var params = "fullname=" + escape(get_data('username'));
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
					// get the data successfully
					var block_urls = new Array();
					for (var i = 0; i < response_json.blocked.length; i++) {
						block_urls[i] = response_json.blocked[i].url;
					}
					set_data('block_urls', block_urls);
				    initialize_website_state(block_urls);
				}

			} else {
				console.log("server error, try again later");
			}
		}
		// console.log('response text: ', xmlHttp.responseText);
	};
	xmlHttp.send(params);		
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
function set_website_state(url, new_state) {
    set_data('website_state',
             get_data('website_state').map(
                 function (curr_state) {
                     return url_matches(url, curr_state) ? new_state : curr_state }))
}
function bypass_website_state(url) {
    var state = get_data('website_state');
    if(!state) return false;
    var data = state.find(function (site) {
                    return url_matches(url, site)
               })
    if (data.user_offer == 'PASS') {
        return;
    }
    data.user_offer = 'PASS';
    set_data('website_state', state);
    // Record the block event
    	
	store_block_data("bypass", get_username(), url, data.our_offer);
 
}

function update_last_check(url) {
    var state = get_data('website_state');
    if(!state) return false;
    var data = state.find(function (site) {
                    return url_matches(url, site)
               })
    var today_time = new Date();
    data.last_day_check = today_time.getTime();
    set_data('website_state', state);
}

function random_offer_amount() {
    var result = 100;
    while(result > 40 || result < .1)
        result = Math.pow(1.25, (Math.random() * 35 - 18));
    
    // Round off the decimals
    if (result > 10)
        result = Math.floor(result)
    else
        result = Math.floor(result * 10) / 10

    return result
}

function get_todays_offer(url) {
    var state = find_website_state(url)
    var now = new Date().getTime();

    // Is it time for a new offer?
    if(!state.our_offer
       || now - state.offer_day_check > (1000*60*60*BLOCK_HOURS)) {
        // Then let's make a new offer
        state.offer_day_check = now
        state.our_offer = random_offer_amount()
        set_website_state(url, state)
    }

    return state.our_offer
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
				if(today_time.getTime() - last_view >= (1000 * 60 * 60 * BLOCK_HOURS)) {
   		   			// If so, reset offers
   	 	  			console.log('reset offer for: ', url);
					state.user_offer = null;
					state.last_day_check = today_time.getTime();
					// check server to get blocked data for next day cycle
					fetch_study_status();
       		 	}
			} else {
				// the page is not viewed before.
				state.last_day_check = today_time.getTime();
				// check server to get blocked data for next day cycle
				fetch_study_status();
			}
		}
	});

	set_data('website_state', states);
}

// "Main" function - checks for blocked sites whenever a tab is updated.
// Redirects to our block page. 

function whitelisted (url) {
    var whitelist = ['facebook.com/ajax/',
                     'channel.facebook.com/ping',
                     'channel.facebook.com/p',
                     'facebook.com/connect/',
                     'graph.facebook.com/oauth/authorize',
                     'accounts.google.com',
                     'google.com/calendar/hello',
                     'facebook.com/plugins/',
                     'www.facebook.com/dialog/oauth?',
                     'plus.google.com/u/0/_/n/guc',
                     'google.com/images/',
                     'google.com/complete/search?',
                     //'output=embed', // For an embedded google map
                     'maps.google.com',
                     'twitter.com/scribe/',
                     'talkgadget.google.com/u/0/talkgadget',
                     'mail.google.com/mail/u/0/channel',
                     'mail.google.com/',
                     'graph.facebook.com/me/home',
                     'api-read.facebook.com/restserver',
                     'apis.google.com',
                     'google.com/textinputassistant',
                     'google.com/images',
                     'google.com/uds/',
                     'google.com/cse/',
                     'google.com/jsapi/',
                     'facebook.com/fr/u',
                     'google.com/extern_chrome'
                    ];
    for (var i=0; i<whitelist.length; i++)
        if (url.indexOf(whitelist[i]) != -1)
            return true;
    return false;
}

function request_listener(details) {
    //console.log('request_listener');

    // If we don't care about this site, let's go away
    var domain = get_domain(details.url);
    if (!domain || !blacklisted_urls[domain] || whitelisted(details.url)) {
        // if (domain && blacklisted_urls[domain])
        // console.log("domain: " + domain);
        // console.log('Ignoring whitelisted url ' + details.url);
        return {cancel: false};
    }
    // console.log('Processing blacklisted url ' + details.url);

	// Get the blocked state of the url
    var site = find_website_state(details.url);

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

    // what if we don't havs state for this particular url?
    if(!site) {
        set_notification("block something else", details.url);
    }
    
    if (site.user_offer == null) {
		// Record the block event
        store_block_data("ask offer", get_username(), details.url, null);

        // If this site needs an offer, ask for it
		// Redirect tab to block.html
		return { redirectUrl : chrome.extension.getURL("block.html")
              + "?url=" + escape(details.url) };
    }
	// Otherwise, we have a user's offer for this
    // If the user's offer is less than ours, then we pay them and block
    if (site.user_offer < get_todays_offer(details.url)) {
        // Record the block event
    	store_block_data("blocked", get_username(), details.url, site.user_offer);    
    	
		// Redirect tab to countdown.html
        return { redirectUrl : chrome.extension.getURL("block.html")
            + "?url=" + escape(details.url)};
	}
}

function pass_listener(tab_id, change_info, tab) {
    // This is disabled for now.  Remove this return statement when we
    // are ready to put it back in.
    return;

    //console.log('pass_listener');
    var site = find_website_state(tab.url);
	if(site.user_offer == 'PASS') {
	    // show timer in the upper right corner for 5 seconds
	    var now = new Date();
        var sec = parseInt((60*60*BLOCK_HOURS*1000 - (now.getTime() - site.last_day_check))/1000);
        chrome.tabs.executeScript(tab_id, {code: "var seconds_left = " + sec + ";"});
        chrome.tabs.executeScript(tab_id, {file: "inline.js"});
	}   
}

if (chrome.tabs) {
    // Add these listeners only if chrome.tabs is defined... I was
    // having problems with this whole thing being loaded for each
    // request of a page.  It would fail from within the actual website,
    // cause chrome.tabs is not defined.  We should do something about
    // that at a higher level.

    chrome.tabs.onUpdated.addListener(pass_listener);

    // add listener before request
    chrome.webRequest.onBeforeRequest.addListener(
        request_listener, 
        {urls: ['<all_urls>']}, 
        ['blocking']);
}


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
function get_domain(str) {
    var domain = get_hostname(str).split('.');
    if (!domain || domain.length<2) return null;
    return domain[domain.length-2] + '.' + domain[domain.length-1];
}
function get_username() {
	return get_data('username');
}

// Stores url, time/date of block in localStorage
function store_block_data(eventss, user, tab_url, value) {
	// first store the data local:
	// store the user_offer
	
	var earned = 0;
	if(eventss == 'value submitted') {
		// the user submit the data store in the sites
		//console.log('store submit value');
		var status = get_data('website_state');
		for(var i = 0; i < status.length; i++) {
			var ob = status[i];
			if(tab_url.indexOf(ob.url_pattern) != -1 && ob.user_offer == null) {
				status[i].user_offer = value;
				if(status[i].our_offer >= value) {
					earned = status[i].our_offer;
				}
			}
		}
		set_data('website_state', status);
	} else if(eventss == 'bypass') {
		earned = (-1.0) * value;
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
	if (value == null) {
		value = 0;	
	} 

	post_to_server(eventss, user, time_date, tab_url, value, earned);
	//
	//
	//
	
}

// **************** SERVER INTERACTION ******************* //

// Pushes data about site blocks to the server:
// Type of block, user info, time, url, and surveyed value
function post_to_server(eventss, user, time_date, url, value, earned) {
	
	var xmlHttp = new XMLHttpRequest();
	var tourl = "http://yuno.us:8989/save_event";
	var params = 
		"paid=" + escape(value) +
		"&earned=" + escape(earned) +
		"&what=" + escape(eventss) +  
		"&who=" + escape(user) + 
		"&when=" + escape(time_date) +
		"&url=" + escape(url);
	xmlHttp.open("POST", tourl, true);
	
	//Send the proper header information along with the request  //x-www-form-urlencoded
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	//xmlHttp.setRequestHeader("Content-length", params.length);
	//xmlHttp.setRequestHeader("Connection", "close");

	xmlHttp.onreadystatechange = function() {//Call a function when the state changes.
	    if(xmlHttp.readyState == 4) {
	        // alert(xmlHttp.statusText);
			if(xmlHttp.status == 200) {
				//console.log(xmlHttp.responseText);
			}
	    }
		//console.log('response text: ', xmlHttp.responseText);
	};
    //console.log(params);
	xmlHttp.send(params);
	// alert('wait for server response');
}