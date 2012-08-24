// Options
var urls = ['bing.com', 'facebook.com', 'reddit.com', 'renren.com'];

// State variables
var sites = urls.map(function (url) {
    return {url_pattern: url, our_offer: null, user_offer: null}; });


// New day
var last_event_time = new Date();
function check_for_new_day () {
    // Check to see if it's a new day
	var today_time = new Date();
	var is_new_day = true;
	if(today_time.toDateString() != last_event_time.toDateString()) {
		// If so, reset offers
		for(var i = 0; i < urls.length; i++) {
			urls.map(urls[i]) = {url_pattern: urls[i], our_offer: null, user_offer: null;};
		}
		last_event_time = new Date();
	}
	
    // and go through all tabs and re-block what's needed
	
	
}


// "Main" function - checks for blocked sites whenever a tab is updated.
// Redirects to our block page. 
function tab_event_listener (tab_id, change_info, tab) {
    console.log('tab_event_listener of', tab);
	if(is_blacklisted(get_hostname(tab.url))){
		chrome.tabs.update(tab.id, 
		{ "url" : chrome.extension.getURL("blocked.html") + "?url=" + escape(tab.url) });
	}
}
chrome.tabs.onUpdated.addListener(tab_event_listener);


// Extracts hostname from the URL
// eg: https://www.google.com/webhp?hl=en&tab=nw&authuser=0 -> www.google.com
function get_hostname(str) {
	var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
	return str.match(re)[1].toString();
}

// Finds blocked urls from a given url.
// Returns true if given url is blocked, false if otherwise. 
function is_blacklisted(url){
    return sites.find(function (site) {
		return url.search(site.url_pattern) != -1;});
}

// Stores url, time/date of block in localStorage
function store_block_data(event, user, tab_url, value) {
	// Get the time of block
	var time = new Date();
	var month = time.getMonth() + 1;
	var day = time.getDate();
	var year = time.getFullYear();
	var hour = time.getHours();
	var minute = time.getMinutes();
	var second = time.getSeconds();
	
	// Formatting time and date
	var timedate = month + "/" + day + "/" + year + " ";
	
	if(minute < 10){
		minute = "0" + minute;
	}
	if(second < 10){
		second = "0" + second;
	}
	
	timedate = timedate + hour + ":" + minute + ":" + second;
	if(localStorage['log'] == undefined){
		localStorage['log'] = JSON.stringify([]);
	}
	
	// Stores data online
	post_to_server(event, user, timeDate, tab_url, value);
	
	// Stores second copy in localStorage
	var array = JSON.parse(localStorage['log']);
	array.push(event, user, timedate, tab_url, value);
	localStorage['log'] = JSON.stringify(array);
}




// **************** SERVER INTERACTION ******************* //

// Pushes data about site blocks to the server:
// Type of block, user info, time, url, and surveyed value
function post_to_server(event, user, timeDate, url, value) {
	
	// another solution:
	var xmlHttp = new XMLHttpRequest();
	var tourl = "http://yuno.us:8989/save_event";
	var params = 
		"paid=" + value +
		"&what=" + event +  
		"&who=" + user + 
		"&when=" + timeDate +
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