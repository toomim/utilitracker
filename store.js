if (typeof urg == "undefined") {
    var urg = {};
}

urg.store_data = (function () {
  var self = {
    read : function(stg) {
       var opts = {};

       if (stg === undefined) {
         stg = localStorage;
       }

       if ("urg_data" in stg) {
         opts = JSON.parse(stg['urg_data']);
       }

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
       if (stg === undefined) {
          stg = localStorage;
       } 

       stg['urg_data'] = JSON.stringify(opts);
    }
  };
  return self;
})();