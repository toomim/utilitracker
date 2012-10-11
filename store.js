var store = {
    read : function() {
        var stg = localStorage;

        // Load options from localStorage
        var opts = JSON.parse(stg['urg_data'] || '{}')

        // Now replace defaults that haven't been set yet
	    if (! ("user" in opts))
		    opts.username = "default_user";
		  
	    if (! ("urls" in opts))
		    opts.urls = [];
				  
	    if (! ("urls_status" in opts))
		    opts.urls_status = {};
		  
	    if (! ("real_money" in opts))
	        opts.real_money = 'false';
		  
        return opts;
    },

    write : function(opts, stg) {
        var stg = localStorage;

        stg['urg_data'] = JSON.stringify(opts);
    }
};

// retrieve data from localStorage
function get_data(key) {
	// return JSON.parse(localStorage.getItem(key));
	var temp_data = store.read();
	return temp_data[key];
}

// store data to localStorage
function set_data(key, value) {
	// localStorage.setItem(key, JSON.stringify(value));	
	var temp_data = store.read();
    temp_data[key] = value;
	store.write(temp_data);	
}
