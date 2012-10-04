// Options
var urls = ['www.bing.com', 'facebook.com', 'reddit.com', 'renren.com'];
var user = "Debug";

// State variables
var sites = urls.map(function (url) {
    return {url_pattern: url, our_offer: null, user_offer: null}; });
var last_day_check = new Date();

// Check to see if it's a new day/ over 24 hours
function check_for_new_day () {
	console.log('check_for_new_day()');
	var today_time = new Date();
	
	if(today_time.getTime() - last_day_check.getTime() >= (1000 * 60 * 60 * 24)) {
        // If so, reset offers
        sites.each(function (site) {
            site.our_offer = null;
            site.user_offer = null; });
	
        }
    last_day_check = today_time;
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
    var site = get_hostname(url);
	console.log('is_blocked', site);
	
	// check whether this url is blocked right now
	var boo = !!sites.find(function(this_site) {
	
		return (site.indexOf(this_site.url_pattern) != -1) && (!this_site.user_offer);	
	});
	console.log('is_blocked', boo);

	return boo;
}

function get_username() {
	return user;
}

function get_url() {
	
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