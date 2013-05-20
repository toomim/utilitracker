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
Array.prototype.contains = function (x) {
    return this.indexOf(x) != -1;}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
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

Storage.prototype.set_object = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}
Storage.prototype.get_object = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

/*
// Initialize localStorage
var stg = localStorage;
var defaults = {username : 'default_user',
                totalearned : 0,
                websites : null,
                real_money : false,
                block_urls : ['facebook.com', 'google.com']};

//localStorage.set('username', 'default_user')

if (!localStorage.get('username'))
    for (var k in defaults)
        if (defaults.hasOwnProperty(k))
            localStorage.set(k, defaults[k])
*/

// retrieve data from localStorage
function get_data(key) {
    var data = JSON.parse(localStorage['urg_data'] || '{}')

    // Now replace defaults that haven't been set yet
	if (! ("username" in data))
		data.username = "default_user";
		
	if (! ("totalearned" in data))
		data.totalearned = 0  
		  
	if (! ("websites" in data))
		data.websites = null;
		  
	if (! ("real_money" in data))
	    data.real_money = false;
		
	if (! ("block_urls" in data))
		data.block_urls = ['facebook.com', 'google.com'];  
		  
	return data[key];
}

// store data to localStorage
function set_data(key, value) {
	// localStorage.setItem(key, JSON.stringify(value));	
	var data = JSON.parse(localStorage['urg_data'] || '{}');
    data[key] = value;
    localStorage['urg_data'] = JSON.stringify(data)
}
function clear_data () {
    console.log('Clearing utilitracker data')
    set_data('websites', []);
    initialize_websites(get_data('block_urls'));
    console.log('Cleared utilitracker data')
    //alert('Utilitracker data has been cleared');
}

var store;
function load_store() {
    store = JSON.parse(localStorage['urg_data'] || '{}')

    // Now replace defaults that haven't been set yet
    var defaults = [['username', 'default_user'],
                    ['totalearned', 0],
                    ['real_money', false],
                    ['block_urls', ['facebook.com', 'google.com']],
                    ['cycle_start_time', new Date().getTime()]
                   ];

    defaults.each(function (d) {
        var key = d[0], val=d[1];
        store[key] = store[key] || val;
    });
    store.save = save_store
    store.refresh = store.load = load_store
}
function save_store() {
    delete store.save
    delete store.refresh
    delete store.load

    localStorage['urg_data'] = JSON.stringify(store);
    load_store();
}
load_store()