// data stored:
var local = chrome.storage.local;


// Options

set_data('urls', ['www.bing.com', 'facebook.com', 'reddit.com', 'renren.com']);
set_data('user', 'Debug_user');

initial_urls_status(get_data('urls'));

// initialize the urls_status
function initial_urls_status(urls) {
	// State variables
	var sites = urls.map(function (url) {
	    return {url_pattern: url, user_offer: null, last_day_check: null}; 
	});
	set_data('urls_status', sites);
}

// retrieve data from localStorage
function get_data(item) {
	return JSON.parse(localStorage[item]);
}

// store data to localStorage
function set_data(item, data) {
	localStorage[item] = JSON.stringify(data);
}


// test

//



// remove the monitoring urls from urls_status
function remove_urls_status(urls) {
	for(i = 0; i < urls.length; i++) {
		var le = get_data('urls_status').length;
		var status = get_data('urls_status');
		for(j = 0; j < le; j++) {
			if(status[j].url_pattern == urls[i]) {
				status.splice(j, 1);
				le -= 1;
			}
		}
		set_data('urls_status', status);
	}
}

// Check to see if it's a new day/ over 24 hours
function check_for_new_day (url) {
	console.log('check_for_new_day() ', url);
	var today_time = new Date();
	var status = get_data('urls_status');
	for(i = 0; i < status.length; i++) {
		var last_view = status[i].last_day_check;
		if(url.indexOf(status[i].url_pattern) != 1 &&  last_view != null) {
			// if the page is viewed before
			if(today_time.getTime() - last_view.getTime() >= (1000 * 60 * 60 * 24)) {
      			// If so, reset offers
      			console.log('reset offer for: ', url);
				status[i].user_offer = null;
				status[i].last_day_check = today_time;
        	}
		}
	set_data('urls_status', status);
	}	
	
    // and go through all tabs and re-block what's needed    

    console.log('should check tabs and reblock');    
}

// "Main" function - checks for blocked sites whenever a tab is updated.
// Redirects to our block page. 
function tabs_update_listener(tab_id, change_info, tab) {
    console.log('tab_updated ', tab.id);    
	block_tab(tab);	
}
function tabs_created_listener(tab) {
	console.log('tab_created', tab.id);
	block_tab(tab);
}

// helper function, check whether the tab is blocked, if so, block the tab
function block_tab(tab) {
	if (is_blocked(tab.url)) {
		// Redirect tab to blocked.html
		chrome.tabs.update(tab.id, 
			{ 'url' : chrome.extension.getURL("blocked.html")
              + "?url=" + escape(tab.url) });

        // Record the block event
		store_block_data("block", get_username(), get_url(), null);
	}			
}

// add listener when created the tab or updated the tab
chrome.tabs.onUpdated.addListener(tabs_update_listener);
chrome.tabs.onCreated.addListener(tabs_created_listener);

chrome.tabs.onRemoved.addListener(function(tab_id, remove_info) {
	console.log('tab_removed ', tab_id);
});


// Extracts hostname from the URL
// eg: https://www.google.com/webhp?hl=en&tab=nw&authuser=0 -> www.google.com
function get_hostname(str) {
	var exp = str.split('//')[1].split('/')[0];
	return exp;
}

function is_blocked(url) {

    //  We should show the block page if:
    //    • The user has not given an offer yet
    //    • Or they did, and it was less than our offer (so we gave them
    //      our offer instead)
    
    // check whether is a new day
    check_for_new_day(url);
    
    var site = get_hostname(url);
	// check whether this url is blocked right now
	// if the block_array is not empty, then the url is being blocked
	for(i = 0; i < get_data('urls_status').length; i++) {
		var ob = get_data('urls_status')[i];
		if(site.indexOf(ob.url_pattern) != -1 && ob.user_offer == null) {
			return true;
		}
	}
	return false;
}

function get_username() {
	return get_data('user');
}

function get_url() {
	
}


// Stores url, time/date of block in localStorage
function store_block_data(event, user, tab_url, value) {
	// first store the data local:
	// store the user_offer
	
	if(event == 'value submitted') {
		// the user submit the data store in the sites
		console.log('store submit value');
		var status = get_data('urls_status');
		for(i = 0; i < status.length; i++) {
			var ob = status[i];
			if(tab_url.indexOf(ob.url_pattern) != -1 && ob.user_offer == null) {
				console.log(ob.url_pattern, ' is trying to go through');
				status[i].user_offer = value;
				alert(status[i].user_offer);
			}
		}
		set_data('urls_status', status);
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
	
	if(localStorage['log'] == undefined){
		localStorage['log'] = JSON.stringify([]);
	}
	
	// Stores data online
	// disable since server is not up yet
	//
	//
	// post_to_server(event, user, time_date, tab_url, value);
	//
	//
	//
	
	
	/* why do we need to store second copy?? 
	//
	// Stores second copy in localStorage
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