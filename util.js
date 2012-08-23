if(! Array.prototype.map ) {
    Array.prototype.map = function( fun /*, thisp*/ ) {
        var len = this.length;
        if( typeof fun != 'function' )
            throw new TypeError();
        
        var res = new Array( len );
        var thisp = arguments[1];
        for( var i = 0; i < len; ++i ) {
            if( i in this )
                res[i] = fun.call( thisp, this[i], i, this );
        }
        
        return res;
    };
}

if(! Array.prototype.each ) {
    Array.prototype.each = function( fun /*, thisp*/ ) {
        var len = this.length;
        if( typeof fun != 'function' )
            throw new TypeError();
        
        var thisp = arguments[1];
        for( var i = 0; i < len; ++i ) {
            if( i in this )
                fun.call( thisp, this[i], i, this );
        }
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp */) {
        "use strict";
        if (this === void 0 || this === null)
            throw new TypeError();
        
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();
        
        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t))
                    res.push(val);
            }
        }
        return res;
    };
}
