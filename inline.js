console.log('Hello from inline');
if (document && !document.getElementById('remaining_seconds')) {
    var d = document.createElement('div');
    var hours = document.createElement('span');
    hours.setAttribute('id', "remaining_hours");
    var minutes = document.createElement('span');
    minutes.setAttribute('id', "remaining_minutes");
    var seconds = document.createElement('span');
    seconds.setAttribute('id', "remaining_seconds");
    d.innerHTML += 'time to next blocking time: <br />';
    d.appendChild(hours);
    d.innerHTML += ' : ';
    d.appendChild(minutes);
    d.innerHTML += ' : ';
    d.appendChild(seconds);
    document.body.appendChild(d);
    d.setAttribute("id", "countdown_timer");
    d.style.position = 'fixed';
    d.style.top='100px';
    d.style.left=(window.innerWidth - 150) + 'px';
    d.style.width='150px';
    d.style.height='100px';
    d.style.color='yellow';
    d.style.fontSize = '15pt';
    d.style.opacity='0.5';
    d.style['background-color']= '#333';
        
    // enable countdown feature
    var timer;
    countdown(seconds_left);
    setTimeout(function() {
        document.getElementById('countdown_timer').style.display = 'none';
    }, 5000);    
}

// countdown functionality
function countdown(total_seconds) {
	if (!timer) {
    	document.getElementById('remaining_hours').innerHTML = parseInt(((total_seconds / 60) / 60) % 24);
    	document.getElementById('remaining_minutes').innerHTML = parseInt((total_seconds / 60) % 60);
    	document.getElementById('remaining_seconds').innerHTML = total_seconds % 60;
	    
		timer = setInterval(oneSecond, 1000);
	}
}

function oneSecond() {
    var hrs = parseFloat(document.getElementById('remaining_hours').innerHTML);
	var min = parseFloat(document.getElementById('remaining_minutes').innerHTML);
	var sec = parseFloat(document.getElementById('remaining_seconds').innerHTML);
	var total_seconds = (hrs * 60 + min) * 60 + sec;
	if (total_seconds <= 1) {
		// time's up!
		clearInterval(timer);
		timer = null;
        total_seconds--;
        // trying to go through
	} else {
        total_seconds--;
	}
	var hours = parseInt(((total_seconds / 60) / 60) % 24);
	var minutes = parseInt((total_seconds / 60) % 60);
	var seconds = total_seconds % 60;
    document.getElementById('remaining_hours').innerHTML = (hours < 10 ? '0' : '') + hours;
    document.getElementById('remaining_minutes').innerHTML = (minutes < 10 ? '0' : '') + minutes;
    document.getElementById('remaining_seconds').innerHTML = (seconds < 10 ? '0' : '') + seconds;
}