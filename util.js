if(! Array.prototype.map ) {
    Array.prototype.map = function (fun) {
        var len = this.length;
        if( typeof fun != 'function' )
            throw new TypeError();
        
        var res = new Array( len );
        for( var i = 0; i < len; ++i ) {
            if( i in this )
                res[i] = fun.call( null, this[i], i, this );
        }
        
        return res;
    };
}

if(! Array.prototype.each ) {
    Array.prototype.each = function (fun) {
        var len = this.length;
        if( typeof fun != 'function' )
            throw new TypeError();
        
        for( var i = 0; i < len; ++i ) {
            if( i in this )
                fun.call( null, this[i], i, this );
        }
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun) {
        "use strict";
        if (this === void 0 || this === null)
            throw new TypeError();
        
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();
        
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i]; // in case fun mutates this
                if (fun.call(null, val, i, t))
                    res.push(val);
            }
        }
        return res;
    };
}
Array.prototype.find = function (predicate) {
    for (var i=0; i<this.length; i++)
        if (predicate(this[i])) return this[i];
    return false;
};

if (window.$)
    $.fn.make_absolute = function(rebase) {
        return this.each(function() {
            var el = $(this);
            var pos = el.offset();
            el.css({ position: "absolute",
                     marginLeft: 0, marginTop: 0,
                     top: pos.top, left: pos.left });
            if (rebase)
                el.remove().appendTo("body");
        });
    }

function hash_each (h,f) {
    //var h = this;
    for(var key in h)
        if (h.hasOwnProperty(key))
            f(key,h[key]);
};

function rand_int (max) { return Math.floor(Math.random() * (max + 1)) }

// Storage Read and Write

var store = {
    read : function() {
        var stg = localStorage;

        // Load options from localStorage
        var opts = JSON.parse(stg['urg_data'] || '{}')

        // Now replace defaults that haven't been set yet
	    if (! ("username" in opts))
		    opts.username = "default_user";
		
		if (! ("totalearned" in opts))
			opts.totalearned = 0  
		  
	    if (! ("website_state" in opts))
		    opts.website_state = null;
		  
	    if (! ("real_money" in opts))
	        opts.real_money = false;
		  
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
	return store.read()[key];
}

// store data to localStorage
function set_data(key, value) {
	// localStorage.setItem(key, JSON.stringify(value));	
	var temp_data = store.read();
    temp_data[key] = value;
	store.write(temp_data);	
}
function clear_data () {
    console.log('Clearing utilitracker data')
    set_data('website_state', []);
    initialize_website_state(urls);
    console.log('Cleared utilitracker data')
    //alert('Utilitracker data has been cleared');
}
