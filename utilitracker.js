// Options
store.hours_per_block = store.hours_per_block || 0.01;
store.hours_per_block = store.hours_per_cycle || 0.02;
var initial_urls = ['facebook.com', 'google.com'
            /* 'bing.com', 'reddit.com', 'renren.com',
            'quora.com', 'ycombinator.com', 'twitter.com',
            'friendbo.com', 'youtube.com' */];
var blacklisted_urls = {};
store.block_urls.each(function (u) {blacklisted_urls[u] = true;});

var developers = ['Michael Toomim', 'derek', 'guan', 'siye liu', 'chet']
function dev_mode() {
    return store.is_developer;
    return developers.contains(store.username) }
function block_milliseconds() { return 60*60*store.hours_per_block*1000 }
function block_seconds() { return 60*60*store.hours_per_block }
function block_hours() { return store.hours_per_block }
// update_badge();
function time_left(site) {
    var site = site || find_website(url); if (!site) return null;

	var now = new Date();
	var passed = now.getTime() - site.block_start_time;
	return parseInt((block_milliseconds() - passed) / 1000);
}
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


/* Ensures the websites has values for any that's missing. */
function initialize_websites(urls) {
    var state = get_data('websites')
    set_data('websites',
             urls.map(function (url) {
                 return find_website(url) ||
                     {url_pattern: url,
                      user_offer: null,
                      our_offer: null,
                      block_start_time: null,
                     } }));
	blacklisted_urls = {};
    get_data('block_urls').each(function (u) {blacklisted_urls[u] = true;});

}
initialize_websites(get_data('block_urls'));

function remove_websites(url) {
    var tmp = get_data('websites').filter(
        // Keep this one if it doesn't match any of the urls_to_remove
        function (website) {
            return url != website.url_pattern})
    set_data('websites', tmp);
    initialize_websites(get_data('block_urls'));
}

// can get blocked websites for today
function fetch_study_status() {
    var url = "http://yuno.us:8989/fetch_study_status",
        params = "fullname=" + escape(store.username);
    ajax_post(url, params,
              function (xmlHttp) {
				var json = JSON.parse(xmlHttp.responseText);
				if(json.status == "succeed") {
					// Update our stored data
					store.block_urls = json.blocked.map(
                        function (x) {return x.url});
				    initialize_websites(store.block_urls);

                    // Now set up the block cycling hours
                    store.hours_per_block = json.hours_per_block
                    store.hours_per_cycle = json.hours_per_cycle;

                    // And start a new cycle!  If:
                    //   - We just turned on the study
                    //   - Or the old cycle expired
                    if ((!store.enabled_today && json.enabled_today)
                        || new Date().getTime()
                           > store.cycle_start_time + store.hours_per_cycle*60*60*1000) {
                        // New cycle! Reset it all.
                        store.cycle_start_time = new Date().getTime();
                        store.websites.each(function (site) {
                            site.our_offer = null;
                            site.user_offer = null;
                            site.block_start_time = null; });
                    }

                    store.enabled_today = json.enabled_today;

                    // Clear everything if studies were disabled
                    if (!store.enabled_today) {
                        store.cycle_start_time = null;
                        store.websites.each(function (site) {
                            site.our_offer = null;
                            site.user_offer = null;
                            site.block_start_time = null; });
                    }

                    save_store();
                }
              });
}

function curr_cycle () {
    var now = new Date().getTime()
    console.log('This cycle started ' + (now - store.cycle_start_time) / (1000 * 60.0)
                + ' minutes ago' + ' and ends in '
                + ((store.cycle_start_time + store.hours_per_cycle*1000*60*60 - now)
                   / (1000 * 60.0))
                + ' minutes');
}
function url_matches(url, websites) {
    url = get_hostname(url) || url
    return url.indexOf(websites.url_pattern) != -1
}
function find_website(url) {
    if (!store || !store.websites) return null;
    return store.websites.find(function (site) {
        return url_matches(url, site)
    })
}
function set_websites(url, new_state) {
    set_data('websites',
             get_data('websites').map(
                 function (curr_state) {
                     return url_matches(url, curr_state) ? new_state : curr_state }))
}
function bypass_websites(url) {
    var state = get_data('websites');
    if(!state) return false;
    var data = state.find(function (site) {
                    return url_matches(url, site)
               })

    if (data.user_offer == 'PASS') {
        // This prevents the user from skipping the same page multiple
        // times, losing money for each duplicitous skip
        return;
    }
    data.user_offer = 'PASS';
    set_data('websites', state);
    // Record the block event
    	
    console.log('About to store this bypass.')
	store_block_data("bypass", get_username(), url, data.our_offer);
 
}

// function update_last_day_check(url) {
//     var site = find_website(url);
//     site.last_day_check = (new Date()).getTime();
//     set_websites(url, site);
// }

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
    var site = find_website(url)
    var now = new Date().getTime();

    // Is it time for a new offer?
    // The answer is YES if:
    //   - We don't have one yet
    //   - Or we were blocking, but the timer on that has expired
    if (!site.our_offer
        || (site.block_start_time
            && now > site.block_start_time + store.hours_per_block*60*60*1000)) {

        // Then let's make a new offer
        site.our_offer = random_offer_amount()
        store.save()
    }

    return site.our_offer
}

// Check to see if it's a new day/ over 24 hours
// function check_for_new_day (url) {
// 	var now = new Date().getTime();
// 	var states = get_data('websites');
// 	states.each(function (state) {
// 		if(url_matches(url, state)) {
// 			var last_view = state.last_day_check;
// 			if(last_view != null) {
// 				// if the page is viewed before				
// 				if(now - last_view >= (1000 * 60 * 60 * store.hours_per_cycle)) {
//    		   			// If so, reset offers
//    	 	  			console.log('reset offer for: ', url);
// 					state.user_offer = null;
// 					state.last_day_check = now;
// 					// check server to get blocked data for next day cycle
// 					fetch_study_status();
//        		 	}
// 			} else {
// 				// the page is not viewed before.
// 				state.last_day_check = now;
// 				// check server to get blocked data for next day cycle
// 				fetch_study_status();
// 			}
// 		}
// 	});

// 	set_data('websites', states);
// }

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
                     'translate.google.com',
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
    store.refresh()

    // If we don't care about this site, let's go away
    var domain = get_domain(details.url);
    if (!domain || !blacklisted_urls[domain] || whitelisted(details.url))
        return {cancel: false};

    // If study is disabled today, go away
    if (!store.enabled_today)
        return {cancel: false};

    // If we're not registered yet, let's go away
    if(store.username == "default_user")
        return {cancel: false};

    // Let's go!  Initialize some variables
    var now = new Date().getTime()
    var within_cycle = now < (store.cycle_start_time
                              + store.hours_per_cycle*60*60*1000)
    var site = find_website(details.url);
    if(!site) set_notification("Utility Error 3857! Tell the Utility Researchers!",
                               details.url);
    var within_block = (site.block_start_time && (time_left(site) > 0))

    if (
        !within_cycle           // If we're out of cycle
        || (site.block_start_time && !within_block) // Or out of a block
        || (site.user_offer == 'PASS')  // Or the user explicitly passed out
       )
        return {cancel: false};        // Then go through

    // Has the user seen the gift box page yet?
    if (site.user_offer == null) {
        // Then this site needs an offer, so ask for it.
        // (1) Record the event and (2) redirect tab to block.html.
        store_block_data("ask offer", get_username(), details.url, null);
		return { redirectUrl : chrome.extension.getURL("block.html")
              + "?url=" + escape(details.url) };
    }

	// Otherwise, we have a user's offer for this.

    // If the block has expired, get outa here
    if (site.block_start_time + store.hours_per_cycle*60*60*1000 < now)
        return 
	if (site.user_offer <= site.our_offer) {
        store_block_data("blocked", get_username(), details.url, site.user_offer);    
            
        // Redirect tab to countdown.html
        return { redirectUrl : chrome.extension.getURL("block.html")
                 + "?url=" + escape(details.url)};
    }

    // Otherwise they go through!
}

function pass_listener(tab_id, change_info, tab) {
    // This is disabled for now.  Remove this return statement when we
    // are ready to put it back in.
    return;

    // //console.log('pass_listener');
    // var site = find_website(tab.url);
	// if(site.user_offer == 'PASS') {
	//     // show timer in the upper right corner for 5 seconds
	//     var now = new Date();
    //     var sec = parseInt((60*60*store.hours_per_cycle*1000 - (now.getTime() - site.last_day_check))/1000);
    //     chrome.tabs.executeScript(tab_id, {code: "var seconds_left = " + sec + ";"});
    //     chrome.tabs.executeScript(tab_id, {file: "inline.js"});
	// }   
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
		var status = get_data('websites');
		for(var i = 0; i < status.length; i++) {
			var ob = status[i];
			if(tab_url.indexOf(ob.url_pattern) != -1 && ob.user_offer == null) {
				status[i].user_offer = parseFloat(value);
				if(status[i].our_offer >= value) {
					earned = status[i].our_offer;
				}
			}
		}
		set_data('websites', status);
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

    var url = tab_url
    if (!dev_mode()) url = get_hostname(url)

	post_to_server(eventss, user, time_date, url, value, earned);
	//
	//
	//
	
}

// **************** SERVER INTERACTION ******************* //

// Pushes data about site blocks to the server:
// Type of block, user info, time, url, and surveyed value
function post_to_server(eventss, user, time_date, url, value, earned) {
	
	var tourl = "http://yuno.us:8989/save_event";
	var params = 
		"paid=" + escape(value) +
		"&earned=" + escape(earned) +
		"&what=" + escape(eventss) +  
		"&who=" + escape(user) + 
		"&when=" + escape(time_date) +
		"&url=" + escape(url);

    enqueue_network_post(tourl, params);
    return;
}

function enqueue_network_post(url, payload) {
    var queue = localStorage.get_object('network_post_queue') || [];
    queue.push({url:url, payload:payload,
                last_attempt:null, id:new Date().getTime()})
    localStorage.set_object('network_post_queue', queue)
    //console.log('enqueued ' + url + ' with ' + payload)
}

function process_network_queue() {
    var two_minutes = 1000 * 60 * 2;
    var queue = localStorage.get_object('network_post_queue') || [];

    for (var i=0; i<queue.length; i++) {
        var item = queue[i];
        if (!item.last_attempt
            || item.last_attempt < new Date().getTime() - two_minutes) {
            item.last_attempt = new Date().getTime();
            localStorage.set_object('network_post_queue', queue)
            process_network_item(item.id, item.url, item.payload);
            return;
        }
    }
}

function process_network_item(id, url, payload) {
    //console.log('Firing on ' + url + ' ' + payload);

    ajax_post(url, payload, function () {
        // Once an item is successfully sent, let's remove it
        // from the network queue.
        //   1. Get the old queue from localStorage
        //   2. Filter it down to remove this item
        //   3. Store it back into localStorage
        var queue = localStorage.get_object('network_post_queue') || [];
		queue = queue.filter(function (obj) {
            return !(obj.url==url && obj.payload==payload && obj.id==id)
		})
        localStorage.set_object('network_post_queue', queue)
    });
}

function ajax_post(url, payload, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", url, true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.onreadystatechange = function() {
	    if(xmlHttp.readyState == 4)
			if(xmlHttp.status == 200) {
                callback(xmlHttp)
            } else {
                console.log('Got a weird status back: ' + xmlHttp.status)
            }
	};
	xmlHttp.send(payload);
}
