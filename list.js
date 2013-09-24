var js = (js || {}); // The context that holds all methods, see end of file.

(function(ctx){
// constructor of list object	
ctx.List = function(els){this.e = (els.e || els).slice();};
// Simplified constructor, make a list without using new
// and with several arguments
ctx.list = function(){
	var l = arguments.length,r = [],v,i;
	for(i=0;i<l;i++){
		v = arguments[i].e || arguments[i];
		r = r.concat(v);
	}
	return new ctx.List(r);
};
ctx.li = ctx.list;

// TODO: document listify object with arrays
// makes a list of each array in obj
ctx.listify = function(obj){
	var i;
	for(i in obj){
		if(obj.hasOwnProperty(i)){
			if(ctx.isArray(obj[i])){
				obj[i] = new ctx.List(obj[i]);	
			}
		}
	}
};

// A few shortcut constructors 
ctx.zeros = function(n){return (new ctx.List([0])).rep((n || 0));};	
ctx.ones = function(n){return (new ctx.List([1])).rep((n || 0));};
ctx.rep = function(what,n){
	var i = (n || 0), r = [];
	if(typeof what == "function"){
		for(i=0;i<n;i++){r[i]=what();}	
	}else{
		for(i=0;i<n;i++){r[i]=what;}	
	}
	return new ctx.List(r);
};

// borrowed from jStat (MIT licence), compensate for IEEE error
var calcRdx = function( n, m ) {
	var val = n > m ? n : m;
	return Math.pow( 10, 17 - ~~( Math.log((( val > 0 ) ? val : -val )) * Math.LOG10E ));
};

ctx.seq = function(from, to, by) {
	var arr = [],
	hival = calcRdx(from, to);
	by = (by || 1);
	if((to-from)<0){
		by = -Math.abs(by);
	}else{
		by = Math.abs(by);
	}
	var current = from, i,
	l = parseFloat(((to*hival-from*hival)/(by*hival)).toFixed(0));
	for (i = 0; i <= l; i++, current = ( from * hival + by * hival * i ) / hival ){
		// still some IEEE error issue, to avoid that precision is set to 12 decimals
		arr.push(parseFloat(current.toFixed(12)));
	}
	return new ctx.List(arr);
};

// Instance methods of the list object 

ctx.List.prototype = {
	length: function(){return this.e.length;},
	join: function(sep){return this.e.join(sep);},
	indexOf: function(searchElement){return this.e.indexOf(searchElement)+1;},
	lastIndexOf: function(searchElement){return this.e.lastIndexOf(searchElement)+1;},
	//TODO: document every and some
	every: function(fn,thisObj){return [].every.call(this.e.slice(),fn,thisObj);},
	some: function(fn,thisObj){return [].some.call(this.e.slice(),fn,thisObj);},
	forEach: function(fn,thisObj){
		for(var i=0;i<this.e.length;i++){
				fn.call(thisObj,this.e[i],i+1);
		}
	},
	map: function(fn,thisObj){
		var r =[],i;
		for(i=0;i<this.e.length;i++){
				r.push(fn.call(thisObj,this.e[i],i+1));
		}
		return new ctx.List(r);
	},
	filter: function(fn,thisObj){
		var r =[],i;
		for(i=0;i<this.e.length;i++){
			if(fn.call(thisObj,this.e[i],i+1)){
				r.push(this.e[i]);
			}		
		}
		return new ctx.List(r);	
	},	
	// TODO: document reduce
	reduce: function(fn,start,thisObj){
		//fn takes args: prev,curr,index,arr
		return this.e.slice().reduce(fn,start,thisObj);	
	},
	toString: function(){return '['+this.e.join(',')+']';},
	toJSON: function(){return this.e;},
	sum: function(){return this.e.reduce(function(prev,curr,index,arr){return prev + curr},0);},
	mean: function(){return this.sum()/this.e.length;},
    cumsum: function() {
			var l = this.e.length, sum = 0, cumsum = [], i;
			for (i = 0; i < l; i++) {
				sum += +this.e[i];
				cumsum.push(sum);
			}
			return new ctx.List(cumsum);
    },
	prod: function(){return this.e.reduce(function(prev,curr,index,arr){return prev * curr},1);},
	add: function(y){
			var a = y.e || y;
			if(typeof(a)=="number"){
				return this.map(function(v){return v + a;});
			}
			if(a.length == this.e.length){
				return this.map(function(v,i){return v + a[i-1];});
			}
			return null;
	},
	substract: function(y){
			var a = y.e || y;
			if(typeof(a)=="number"){
				return this.map(function(v){return v - a;});
			}
			if(a.length == this.e.length){
				return this.map(function(v,i){return v - a[i-1];});
			}
			return null;
	},
	divide: function(y){
			var a = y.e || y;
			if(typeof(a)=="number"){
				return this.map(function(v){return v / a;});
			}
			if(a.length == this.e.length){
				return this.map(function(v,i){return v / a[i-1];});
			}
			return null;
	},
	multiply: function(y){
			var a = y.e || y;
			if(typeof(a)=="number"){
				return this.map(function(v){return v * a;});
			}
			if(a.length == this.e.length){
				return this.map(function(v,i){return v * a[i-1];});
			}
			return null;
	},
	pow: function(y){
			var a = y.e || y;
			if(typeof(a)=="number"){
				return this.map(function(v){return Math.pow(v,a);});
			}
			if(a.length == this.e.length){
				return this.map(function(v,i){return Math.pow(v,a[i-1]);});
			}
			return null;
	},
	mod: function(y) {
        if (typeof(y) == 'number') {
            return this.map(function(x) {return x % y;});
        } else {
            var V = y.e || y;
            if (this.e.length != V.length) {
                return null;
            }
            return this.map(function(x, i) {return x % V[i];});
        }
    },
	//min: function(){return Math.min.apply( Math, this.e );},
	min: function(){
		var m = Infinity, i;
		for(i=0;i<this.e.length;i++){
			if(this.e[i]<m){m=this.e[i];}
		}
		return m;
	},
	//max: function(){return Math.max.apply( Math, this.e );},
	max: function(){
		var m = -Infinity, i;
		for(i=0;i<this.e.length;i++){
			if(this.e[i]>m){m=this.e[i];}
		}
		return m;
	},	
	sin: function(){return this.map(Math.sin,Math);},
	asin: function(){return this.map(Math.asin,Math);},
	cos: function(){return this.map(Math.cos,Math);},
	acos: function(){return this.map(Math.acos,Math);},
	tan: function(){return this.map(Math.tan,Math);},
	atan: function(){return this.map(Math.atan,Math);},
	abs: function(){return this.map(Math.abs,Math);},	
    exp: function(){return this.map(Math.exp,Math);},
    log: function(){return this.map(Math.log,Math);},
    ceil: function(){return this.map(Math.ceil,Math);},
    // round: function(){return this.map(Math.round,Math);},
    // TODO: document new round
    round: function(d){
		var k = d || 0;
		return this.map(function(v){return parseFloat(v.toFixed(k))});
	},
    floor: function(){return this.map(Math.floor,Math);},
    sign: function(){return this.map(function(x){return x > 0 ? 1 : x === 0 ? 0 : -1;});},
    sqrt: function(){return this.map(Math.sqrt,Math);},  
    rep: function(n) {
        var r = [],i;
        for (i = 0; i < n; i++) {
            r = r.concat(this.e);
        }
        return new ctx.List(r);
    },   
    unique: function(){
        var o = {}, i, l = this.e.length, r = [];
        for(i = 0; i < l; i++){
            o[this.e[i]] = this.e[i];
        }
        for(i in o){
			if(o.hasOwnProperty(i)){
				r.push(o[i]);
			}
        }
        return new ctx.List(r);
    },
    geomean: function(){return Math.exp(this.log().mean());},   
    skewness: function(){
			var xm = this.substract(this.mean());
			return xm.pow(3).mean()/Math.pow(xm.pow(2).mean(),3/2);
	},
	variance: function(population) {
			var p = population || false, N = this.e.length, res;
			if (N <= 1) {return 0;}
			var sum = 0, ssquares = 0, i;
			for (i = 0; i < N; i++) {
				sum += this.e[i];
				ssquares += this.e[i]*this.e[i];
			}
			if(p){    
				res = (ssquares-sum*sum/N) / N;
			}else{
				res = (ssquares-sum*sum/N) / (N - 1);
			}
			if(res<0){res=0;}
			return res;
    },  
    std: function(population){
		return Math.sqrt(this.variance(population));
	}, 
	standardized: function(population) {
        var sd = this.std(population),m = this.mean();
        if (sd !== null && sd > 0) {
            return this.map(function(x) {
                return (x - m) / sd;
            });
        } else {
            return null;
        }
    },
    sort: function(asc) {
        var c = this.e.slice();
        if (asc === false) {
            c.sort(function(a, b) {
                return b - a;
            });
        } else {
            c.sort(function(a, b) {
                return a - b;
            });
        }
        return new ctx.List(c);
    },
    sortIndex: function(asc) {
        var c = this.e.slice(),r = [],r1=[],i;
        for(i=0;i<c.length;i++){
			r.push([c[i],(i+1)]);
		}
        if (asc === false) {
            r.sort(function(a, b) {
                return b[0] - a[0];
            });
        } else {
            r.sort(function(a, b) {
                return a[0] - b[0];
            });
        }
        for(i=0;i<r.length;i++){
			r1.push(r[i][1]);
		}
        return new ctx.List(r1);
    },
    mode: function() {
        var o = {}, i, l = this.e.length, r = [],
        mod=[], mc = 0, val;
        for (i = 0; i < l; i += 1){
            o[this.e[i]] = 0;
        }
        for (i = 0; i < l; i += 1){
            o[this.e[i]] += 1;
        }
        for (i in o){
			if(o.hasOwnProperty(i)){
				val = !isNaN(i) ? Number(i):i;
				if(o[i]>mc){mod=[val];}
				if(o[i]==mc){mod.push(val);}
				mc = Math.max(mc,o[i]);
			}
		}  
        return {count:mc, nrmode:mod.length, mode:mod};
    },
    quantiles: function(p,sorted) {
		var pq = p.e || p,c,l,r=[],i;
		if(typeof(pq)=='number'){pq=[pq];}
		if(sorted !== true){
			c = this.sort().e;
		}else{
			c = this.e;	
		}
		l = c.length;
		for(i=0;i<pq.length;i++){
			if(0<=pq[i] && pq[i]<=1){
				r.push(c[Math.floor(pq[i]*(l-1))]*(1-(pq[i]*(l-1))%1)+c[Math.ceil(pq[i]*(l-1))]*((pq[i]*(l-1))%1));
			}else{
				r.push(null);
			}
		}
		if(r.length==1){return r[0];}
        return new ctx.List(r);
    },
    range: function(){
		return this.max()-this.min();
	},
	cov: function(y) {
        var V = y.e || y,xm,ym,res=0,i;
        if (this.e.length == V.length && V.length > 1) {
            xm = this.mean();
            ym = (new ctx.List(V)).mean();
            for (i = 0; i < this.e.length; i++) {
                res = res + (this.e[i] - xm) * (V[i] - ym);
            }
            return res / (V.length - 1);
        }
        return null;
    },
    cor: function(y) {
        var V = y.e || y;
        V = new ctx.List(V);
        return this.cov(y) / Math.sqrt(this.variance() * V.variance());
    },
    attach: function(y) {
        var V = y.e || y;
        if (!ctx.isArray(V)){V = [y];}
		return new ctx.List(this.e.slice().concat(V));
    },    
    median: function(){return this.quantiles(0.5);},
    union: function(y){return this.attach(y).unique();},   
	intersect: function(y){return this.unique().remove(this.remove(y));},	
	remove: function(what) {
		var V = what.e || what,r = [],found,i,j;
		if (!ctx.isArray(V)) {V = [V];}
		for(i=0;i<this.e.length;i++){
			found=0;
			for(j=0;j<V.length;j++){
				if(this.e[i]==V[j]){found=1; break;}
			}
			if(found===0){r.push(this.e[i]);}
		}
		return new ctx.List(r);
    },
	replace: function(oldvalue,newvalue) {
		var r = this.e.slice(),i;
		for(i=0;i<this.e.length;i++){
			if(r[i]==oldvalue){r[i]=newvalue;}
		}
		return new ctx.List(r);
    },
    randomOrder: function() {
        var c = this.e.slice();
        for (var rnd, tmp, i = c.length; i; rnd = Math.floor(Math.random() * i), tmp = c[--i], c[i] = c[rnd], c[rnd] = tmp);
        return new ctx.List(c);
    },
    eq: function(y) {
        if (!ctx.isArray(y)) {
            return this.map(function(x){
                return (x == y) ? 1: 0;
            });
        } else {
            var V = y.e || y;
            if (this.e.length != V.length){
                return null;
            }
            return this.map(function(x, i){
                return (x == V[i-1]) ? 1: 0;
            });
        }
    },
    neq: function(y) {
        if (!ctx.isArray(y)) {
            return this.map(function(x){
                return (x != y) ? 1: 0;
            });
        } else {
            var V = y.e || y;
            if (this.e.length != V.length){
                return null;
            }
            return this.map(function(x, i){
                return (x != V[i-1]) ? 1: 0;
            });
        }
    },
    lt: function(y) {
        if (!ctx.isArray(y)) {
            return this.map(function(x){
                return (x < y) ? 1: 0;
            });
        } else {
            var V = y.e || y;
            if (this.e.length != V.length){
                return null;
            }
            return this.map(function(x, i){
                return (x < V[i-1]) ? 1: 0;
            });
        }
    },
    leq: function(y) {
        if (!ctx.isArray(y)) {
            return this.map(function(x){
                return (x <= y) ? 1: 0;
            });
        } else {
            var V = y.e || y;
            if (this.e.length != V.length){
                return null;
            }
            return this.map(function(x, i){
                return (x <= V[i-1]) ? 1: 0;
            });
        }
    },
    gt: function(y) {
        if (!ctx.isArray(y)) {
            return this.map(function(x){
                return (x > y) ? 1: 0;
            });
        } else {
            var V = y.e || y;
            if (this.e.length != V.length){
                return null;
            }
            return this.map(function(x, i){
                return (x > V[i-1]) ? 1: 0;
            });
        }
    },
    geq: function(y) {
        if (!ctx.isArray(y)) {
            return this.map(function(x){
                return (x >= y) ? 1: 0;
            });
        } else {
            var V = y.e || y;
            if (this.e.length != V.length){
                return null;
            }
            return this.map(function(x, i){
                return (x >= V[i-1]) ? 1: 0;
            });
        }
    },
    ind:function(y) {
        var V = y.e || y,l = this.e.length,r = [],i,j;
        if (l != V.length) {
            return null;
        }
        for (i = 0; i < l; i++) {
            for(j=0;j<V[i];j++){
                r.push(this.e[i]);
            }
        }
        return new ctx.List(r);
    },
    nind: function(y) {
        var V = y.e || y,l = this.e.length,r = [],i;
        if (l != V.length) {
            return null;
        }
        for (i = 0; i < l; i++) {
            if (V[i] === 0) {
                r.push(this.e[i]);
            }
        }
        return new ctx.List(r);
    },
    i2s: function(){
		var l = this.e.length,r = [],i,j;
        for (i = 0; i < l; i++) {
			for(j=0;j<this.e[i];j++){
                r.push(i+1);
            }
        }
        return new ctx.List(r);
	},
    s2i: function(N){
		var l = this.e.length,r = [],i;
		for (i = 0; i < N; i++) {
			r.push(0);
        }
        for (i = 0; i < l; i++) {
			if(this.e[i]>N){return null;}
			r[this.e[i]-1]+=1;
        }
        return new ctx.List(r);
	},
    i: function(index){
		var V = (index.e || index),i,r=[];
		if (typeof(index) == 'number') {
			return this.e[index-1];
		}
		for(i=0;i<V.length;i++){
			if(V[i]>0 && V[i]<=this.e.length){
				r.push(this.e[V[i]-1]);
			}else{return null;}
		}
		return new ctx.List(r);
	},
	ni: function(index){
		var V = index.e || index,i;
		if (typeof(index) == 'number') {
			V =[index];
		}
		var obj ={},res=[];
		for(i=0;i<V.length;i++){
			obj[V[i]]=1;
		}		
		for(i=0;i<this.e.length;i++){
			if(obj[(i+1)]!=1){
				res.push(this.e[i]);
			}
		}
		return new ctx.List(res);
	},
	increment: function(index,number){
		var V = (index.e || index),i,
		n = (number || 1);
		for(i=0;i<V.length;i++){
			if(V[i]>0 && V[i]<=this.e.length){
				this.e[V[i]-1]+=n;
			}
		}
	},
	// TODO: document ht 
	ht : function(p){
		var i, s = 0, q = (p.e || p);
		for(i=0;i<this.e.length;i++){
			s += this.e[i]/q[i];
		}
		return s;	
	},
	change: function(index,value){
		var ind = index.e || index,
		val = value.e || value;
		if(typeof(index) == 'number'){ind = [ind];}
		if(typeof(value) == 'number'){val = [val];}
		var r = this.e.slice(), i;
		for(i = 0; i<ind.length; i++){
			r[ind[i]-1] = val[(ind[i]-1)%val.length];
		}
		return new ctx.List(r);
	},
	hist: function(nbins,xmin,xmax){
		nbins = (nbins || Math.floor(Math.sqrt(this.e.length)));
		var min = xmin || this.min(), 
		max = xmax || this.max(), 
		bw = (max-min)/nbins,
		counts=[], data=[], bp=[min], i, j;
		for(i=0;i<nbins;i++){
			counts.push(0);
			bp.push(min+(i+1)*bw);
		}
		for(j=0;j<this.e.length;j++){
			for(i=0;i<nbins;i++){
				if(bp[i]<=this.e[j] && this.e[j]<bp[i+1] && this.e[j]<max){counts[i]++;break;}	
			}
			if(this.e[j]==max){counts[nbins-1]++;}
		}
		for(i=0;i<nbins;i++){
			data.push([bp[i]+bw/2,counts[i]]);
		}
		return {data:data,bars:{show:true,barWidth:bw,lineWidth:1,align:'center',horizontal:false}};
	},
	sample: function(n,wr) {
		n = (n || 1);
		wr = (wr || false);
		var r = [],i;
		if(wr===true){
			for (i = 0; i < n; i++) {
				r.push(this.e[Math.floor(Math.random()*this.e.length)]);
			}
			return new ctx.List(r);
		}
        var nrsampled = 0, N = this.e.length;
        n = Math.min(Math.max(n, 0), N);
        for (i = 0; i < N; i++) {
            if (Math.random() < (n - nrsampled) / (N - i)) {
                nrsampled += 1;
                r.push(this.e[i]);
            }
        }
        return new ctx.List(r);
    },
    bootstrap: function(){return this.sample(this.e.length,true);},
    ecdf: function(y){
		var V = y.e || y;
		if (typeof(y) == 'number') {V = [y];}
		if (typeof(y) == 'undefined') {return null;}
		var r=[], s=this.sort(), count, i;
		for(i=0;i<V.length;i++){
			count=0;
			while(V[i]>=s.e[count] && count<s.e.length){count++;}
			r.push(count/s.e.length);
		}
		if(V.length==1){return r[0];}
		return new ctx.List(r);
	}
};

// utility functions to bind lists/Arrays to Array matrices

ctx.cbind = function(){ // binds [1,2,3],[4,5,6] to [[1,4],[2,5],[3,6]]
	if(arguments.length===0){return null;}
	var v = arguments[0].e || arguments[0],
	le = v.length,i,j,k,res=[],arr;
	for(i=0; i<arguments.length; i++){
		v = arguments[i].e || arguments[i];
		if(v.length!=le){
			return null;
		}
	}
	for(i=0; i<le; i++){
		arr=[];
		for(j=0;j<arguments.length;j++){
			v = arguments[j].e || arguments[j];
			if(ctx.isArray(v[i])){
				for(k=0;k<v[i].length;k++){
					arr.push(v[i][k]);
				}
			}else{
				arr.push(v[i]);
			}
		}
		res.push(arr);
	}
	return res;	
};
// Alias for cbind
ctx.zip = ctx.cbind;

ctx.rbind = function(){ // binds [1,2,3],[4,5,6] to [[1,2,3],[4,5,6]]
	if(arguments.length===0){return null;}
	var v = arguments[0].e || arguments[0],le = v.length,res = [],i;
	for(i=0; i<arguments.length; i++){
		v = arguments[i].e || arguments[i];
		if(v.length!=le){
			return null;
		}
		res.push(v);
	}
	return res;	
};

ctx.isArray = function(obj) {
	if (obj.constructor.toString().indexOf("Array") == -1){
		return false;
	}else{
		return true;
	}
};

})(js);
