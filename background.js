// State variables

var sites = [{url_pattern: 'bing.com',
              our_offer: null,
              user_offer: null
             },
             {url_pattern: 'facebook.com',
              our_offer: null,
              user_offer: null
             },
             {url_pattern: 'facebook.com',
              our_offer: null,
              user_offer: null
             }];

var last_event_time = Date();
function check_for_new_day () {
    // Check to see if it's a new day
    // If so, reset offers
    // and go through all tabs and re-block what's needed
}

function tab_event_listener (tab_id, change_info, tab) {
	if(isBlocked(getHostname(tab.url))){
		chrome.tabs.update(tab.id, 
		{ "url" : chrome.extension.getURL("blocked.html") + "?url=" + escape(tab.url) });
	}
}


// "Main" function - checks for blocked sites whenever a tab is updated.
// Redirects to our block page. 
chrome.tabs.onUpdated.addListener(tab_event_listener);


// Extracts hostname from the URL
// eg: https://www.google.com/webhp?hl=en&tab=nw&authuser=0 -> www.google.com
function getHostname(str) {
	var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
	return str.match(re)[1].toString();
}

function getBlocked(){
	// Replace with code to get sites from our server
	var urls = ["bing.com", "bbc.co.uk"];
	return urls;
}

// Finds blocked urls from a given url.
// Returns true if given url is blocked, false if otherwise. 
function isBlocked(url){
	var blocked = getBlocked();
	for(var i = 0; i < blocked.length; i++){
		var blockUrl = blocked[i];
		if (url.search(blockUrl) != -1){
			return true;
		}
	}
	return false;
}

// Stores url, time/date of block in localStorage
function storeBlockData(event, user, tab_url, value) {
	// Get the time of block
	var time = new Date();
	var month = time.getMonth() + 1;
	var day = time.getDate();
	var year = time.getFullYear();
	var hour = time.getHours();
	var minute = time.getMinutes();
	var second = time.getSeconds();
	
	// Formatting time and date
	var timeDate = month + "/" + day + "/" + year + " ";
	
	if(minute < 10){
		minute = "0" + minute;
	}
	if(second < 10){
		second = "0" + second;
	}
	
	timeDate = timeDate + hour + ":" + minute + ":" + second;
	if(localStorage['log'] == undefined){
		localStorage['log'] = JSON.stringify([]);
	}
	
	// Stores data online
	postToServer(event, user, timeDate, tab_url, value);
	
	// Stores second copy in localStorage
	var array = JSON.parse(localStorage['log']);
	array.push(event, user, timeDate, tab_url, value);
	localStorage['log'] = JSON.stringify(array);
}




// **************** SERVER INTERACTION ******************* //

// Pushes data about site blocks to the server:
// Type of block, user info, time, url, and surveyed value
function postToServer(event, user, timeDate, url, value) {
	
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
	}
	xmlHttp.send(params);
}