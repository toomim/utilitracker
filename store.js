store_data = (function () {
  var self = {
    read : function(stg) {
       var opts = {};

       if (stg === undefined) {
         stg = localStorage;
       }

       if ("urg_data" in stg) {
         opts = JSON.parse(stg['urg_data']);
       }

	   if (! ("user_name" in opts))
		  opts.username = "default_user";
		  
	   if (! ("urls_status" in opts))
		  opts.urls_status = {};
       return opts;
    },

    write : function(opts, stg) {
       if (stg === undefined) {
          stg = localStorage;
       } 

       stg['settings'] = JSON.stringify(opts);
    }
  };
  return self;
})();