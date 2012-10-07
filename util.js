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