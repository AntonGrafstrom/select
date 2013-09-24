var js = (js || {});

(function(ctx){

ctx.matrix = function(ary){
	return new ctx.Matrix((ary.e || ary));	
}
ctx.rowVector = function(ary){
	return new ctx.Matrix([(ary.e || ary)]);	
}
ctx.columnVector = function(ary){
	var a = (ary.e || ary);
	return new ctx.Matrix(a.map(function(v) {return [v]}))
}

ctx.Matrix = function(ary) {
    this.e = (ary.e || ary).slice();
}

ctx.Matrix.prototype.list = function() {
	var v = [], i, j;
	for(j=0;j<this.ncol();j++){
		for(i=0;i<this.nrow();i++){
			v.push(this.e[i][j]);
		}
	}
    return ctx.list(v);
}

ctx.Matrix.prototype.ncol = function(){return this.e[0].length;}
ctx.Matrix.prototype.nrow = function(){return this.e.length;}
ctx.Matrix.prototype.size = function(){return [this.e.length,this.e[0].length];}
ctx.Matrix.prototype.row = function(i){return ctx.list(this.e[i-1].slice());}
ctx.Matrix.prototype.col = function(i){return ctx.list(this.e.map(function(v) {return v[i-1];}))}

ctx.Matrix.prototype.map = function(f) {
	var i,j,x =[];
	for(i=0;i<this.nrow();i++){
		x.push([]);
		for(j=0;j<this.ncol();j++){
			x[i].push(f(this.e[i][j],i+1,j+1));
		}
	}	
	return new ctx.Matrix(x);
}

ctx.Matrix.prototype.forEach = function(f) {
	var i,j;
	for(i=0;i<this.nrow();i++){
		for(j=0;j<this.ncol();j++){
			f(this.e[i][j],i+1,j+1);
		}
	}
}

ctx.Matrix.prototype.sqrt = function(){return this.map(Math.sqrt);}
ctx.Matrix.prototype.abs = function(){return this.map(Math.abs);}
ctx.Matrix.prototype.acos = function(){return this.map(Math.acos);}
ctx.Matrix.prototype.asin = function(){return this.map(Math.asin);}
ctx.Matrix.prototype.atan = function(){return this.map(Math.atan);}
ctx.Matrix.prototype.ceil = function(){return this.map(Math.ceil);}
ctx.Matrix.prototype.floor = function(){return this.map(Math.floor);}
ctx.Matrix.prototype.round = function(){return this.map(Math.round);}
ctx.Matrix.prototype.exp = function(){return this.map(Math.exp);}
ctx.Matrix.prototype.log = function(){return this.map(Math.log);}
ctx.Matrix.prototype.sin = function(){return this.map(Math.sin);}
ctx.Matrix.prototype.cos = function(){return this.map(Math.cos);}
ctx.Matrix.prototype.tan = function(){return this.map(Math.tan);}

ctx.Matrix.prototype.pow = function(n){
	return this.map(function(v,r,c){return Math.pow(v,n);});
}
ctx.Matrix.prototype.sign = function(){
	return this.map(function(v,r,c){return v > 0 ? 1 : v == 0 ? 0 : -1;});
}

ctx.Matrix.prototype.snap = function(d){
	var k = d || 0;
	return this.map(function(v,r,c){return parseFloat(v.toFixed(k))});
}

ctx.Matrix.prototype.sum = function(){
	var s = 0;
	this.forEach(function(v,r,c){s+=v;});
	return s;	
}

ctx.Matrix.prototype.add = function(n){
	if(typeof(n)=='number'){return this.map(function(v,r,c){return v+n;});}
	if(this.nrow()==n.nrow() && this.ncol()==n.ncol()){
		return this.map(function(v,r,c){return v+n.e[r-1][c-1];});
	}
	return null;
	//incompatible sizes
}

ctx.Matrix.prototype.substract = function(n){
	if(typeof(n)=='number'){return this.map(function(v,r,c){return v-n;});}
	if(this.nrow()==n.nrow() && this.ncol()==n.ncol()){
		return this.map(function(v,r,c){return v-n.e[r-1][c-1];});
	}
	return null;
	//incompatible sizes
}

ctx.Matrix.prototype.multiply = function(n){
	if(typeof(n)=='number'){return this.map(function(v,r,c){return v*n;});}
	if(this.nrow()==n.nrow() && this.ncol()==n.ncol()){
		return this.map(function(v,r,c){return v*n.e[r-1][c-1];});
	}
	return null;
	//incompatible sizes
}

ctx.Matrix.prototype.divide = function(n){
	if(typeof(n)=='number'){return this.map(function(v,r,c){return v/n;});}
	if(this.nrow()==n.nrow() && this.ncol()==n.ncol()){
		return this.map(function(v,r,c){return v/n.e[r-1][c-1];});
	}
	return null;
	//incompatible sizes
}

ctx.Matrix.prototype.min = function(){
	var m = Infinity;
	this.forEach(function(v,r,c){m = Math.min(m,v);});
	return m;	
}

ctx.Matrix.prototype.max = function(){
	var m = -Infinity;
	this.forEach(function(v,r,c){m = Math.max(m,v);});
	return m;	
}

ctx.Matrix.prototype.prod = function(){
	var p = 1;
	this.forEach(function(v,r,c){p*=v;});
	return p;	
}

ctx.Matrix.prototype.mean = function(){
	return this.sum()/(this.nrow()*this.ncol());	
}

ctx.Matrix.prototype.variance = function(){
	var m = this.mean(), s = 0, ss = 0;
	var N = this.nrow()*this.ncol();
	this.forEach(function(v,r,c){s+=v; ss+=v*v;});
	return (ss-s*s/N)/(N-1);	
}

ctx.Matrix.prototype.std = function(){
	return Math.sqrt(this.variance());	
}

ctx.Matrix.prototype.colSums = function(){
		var s = [],i,j;
		for(i=0;i<this.ncol();i++){
			s.push(0);
		}
		for(i=0;i<this.nrow();i++){
			for(j=0;j<this.ncol();j++){
				s[j]+=this.e[i][j];
			}
		}
		return new ctx.Matrix([s]);
}
ctx.Matrix.prototype.colMeans = function(){
		var nr = this.nrow();
		return this.colSums().map(function(v,r,c){return v/nr;}); 
}

ctx.Matrix.prototype.cov = function(){
		var means = this.colMeans();
		var m = means.e[0];
		for(var i=0;i<this.nrow()-1;i++){
			means.e.push(m);	
		}
		var xme = this.substract(means);
		var nr = this.nrow();
		return xme.transpose().mmult(xme).divide(nr-1);
}

ctx.Matrix.prototype.colVar = function(){
		var means = this.colMeans();
		var m = means.e[0];
		for(var i=0;i<this.nrow()-1;i++){
			means.e.push(m);	
		}
		return this.substract(means).pow(2).colSums().divide(this.nrow()-1);
}
ctx.Matrix.prototype.colStd = function(){
		return this.colVar().sqrt();
}

ctx.Matrix.prototype.colStandardized = function(){
		var means = this.colMeans();
		var stds = this.colStd();
		return this.map(function(v,i,j){return (v-means.e[0][j-1])/stds.e[0][j-1]});
}

ctx.Matrix.prototype.cbind = function(){
	var a = arguments.length, x =[], i, j;
	for(i=0;i<this.nrow();i++){
		x.push(this.e[i]);
		for(j=0;j<a;j++){
			if(arguments[j].nrow()!=this.nrow()){
				//incompatible sizes
				return null;
			}
			x[i] = x[i].concat(arguments[j][i]);
		}
	}
	return new ctx.Matrix(x);	
}
 
ctx.Matrix.prototype.toString = function() {
    return '[['+this.e.join("], [")+']]';
}

ctx.Matrix.prototype.toJSON = function() {
    return this.e;
}

// returns a new ctx.Matrix
ctx.Matrix.prototype.copy = function() {
    var s = []
    for (var i = 0; i < this.e.length; i++) 
        s.push(this.e[i].slice());
    return new ctx.Matrix(s);
}
 
// returns a new ctx.Matrix
ctx.Matrix.prototype.transpose = function() {
    var transposed = [];
    for (var i = 0; i < this.ncol(); i++) {
        transposed[i] = [];
        for (var j = 0; j < this.nrow(); j++) {
            transposed[i][j] = this.e[j][i];
        }
    }
    return new ctx.Matrix(transposed);
}
ctx.Matrix.prototype.t = ctx.Matrix.prototype.transpose;

// returns a new ctx.Matrix
ctx.Matrix.prototype.mmult = function(other) {
    if (this.ncol() != other.nrow()) {
		return null;
        //incompatible sizes;
    } 
    var result = [];
    for (var i = 0; i < this.nrow(); i++) {
		result[i]=[];
        for (var j = 0; j < other.ncol(); j++) {
            var sum = 0;
            for (var k = 0; k < other.nrow(); k++) {
                sum += this.e[i][k] * other.e[k][j];
            }
            result[i][j] = sum;
        }
    }
    return new ctx.Matrix(result); 
}

// returns a new ctx.Matrix
// to Reduced Row Echelon Form
ctx.Matrix.prototype.rref = function() {
	var x = this.copy(), lead = 0, r, i, j,
	tmp, val;
    for (r = 0; r < x.nrow(); r++) {
        if (x.ncol() <= lead) {
            break;
        }
        i = r;
        while (x.e[i][lead] == 0) {
            i++;
            if (x.nrow() == i) {
                i = r;
                lead++;
                if (x.ncol() == lead) {
                    return x;
                }
            }
        }
        tmp = x.e[i];
        x.e[i] = x.e[r];
        x.e[r] = tmp;
        val = x.e[r][lead];
        for (j = 0; j < x.ncol(); j++) {
            x.e[r][j] /= val;
        }
        for (i = 0; i < x.nrow(); i++) {
            if (i == r) continue;
            val = x.e[i][lead];
            for (j = 0; j < x.ncol(); j++) {
                x.e[i][j] -= val * x.e[r][j];
            }
        }
        lead++;
    }
    return x;
}

// identityMatrix
ctx.identityMatrix = function(n) {
    this.e = [];
    var i,j;
    for (i = 0; i < n; i++) {
        this.e[i] = [];
        for (j = 0; j < n; j++) {
            this.e[i][j] = (i == j ? 1 : 0);
        }
    }
}
ctx.identityMatrix.prototype = ctx.Matrix.prototype;


// Borrowed and rewritten from Sylvester, (c) 2007–2012 James Coglan, MIT license
// Make the matrix upper (right) triangular by Gaussian elimination.
// This method only adds multiples of rows to other rows. No rows are
// scaled up or switched, and the determinant is preserved.

ctx.Matrix.prototype.toRightTriangular = function() {
    var M = this.copy(), els;
    var n = this.e.length, k = n, i, np, kp = this.e[0].length, p;
    do { i = k - n;
      if (M.e[i][i] == 0) {
        for (j = i + 1; j < k; j++) {
          if (M.e[j][i] != 0) {
            els = []; np = kp;
            do { p = kp - np;
              els.push(M.e[i][p] + M.e[j][p]);
            } while (--np);
            M.e[i] = els;
            break;
          }
        }
      }
      if (M.e[i][i] != 0) {
        for (j = i + 1; j < k; j++) {
          var multiplier = M.e[j][i] / M.e[i][i];
          els = []; np = kp;
          do { p = kp - np;
            // Elements with column numbers up to an including the number
            // of the row that we're subtracting can safely be set straight to
            // zero, since that's the point of this routine and it avoids having
            // to loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.e[j][p] - M.e[i][p] * multiplier);
          } while (--np);
          M.e[j] = els;
        }
      }
    } while (--n);
    return M;
};

// Borrowed and rewritten from Sylvester, (c) 2007–2012 James Coglan, MIT license
ctx.Matrix.prototype.isSquare = function() {
    return (this.e.length == this.e[0].length);
};

// Borrowed and rewritten from Sylvester, (c) 2007–2012 James Coglan, MIT license
// Returns the determinant for square matrices
ctx.Matrix.prototype.determinant = function() {
    if (!this.isSquare()) { return null; }
    var M = this.toRightTriangular(),
    det = M.e[0][0], n = M.e.length - 1, k = n, i;
    do { i = k - n + 1;
      det = det * M.e[i][i];
    } while (--n);
    return det;
};

// returns a new ctx.Matrix
ctx.Matrix.prototype.inverse = function() {
	var x = this.copy();
	var nr = this.nrow();
    if (x.nrow() != x.ncol()) {
        //not a non-square matrix
        return null;
    }
    if(x.determinant()===0){
		//not invertible
		return null;	
	}
    var I = new ctx.identityMatrix(x.nrow()),i;
    for(i = 0; i < x.nrow(); i++){ 
        x.e[i] = x.e[i].concat(I.e[i]);
	}
    x = x.rref();
    for(i = 0; i < nr; i++){ 
        x.e[i].splice(0, nr);
	}
    return x;
}
 
ctx.Matrix.prototype.regression_coefficients = function(x) {
    var x_t = x.transpose();
    return x_t.mmult(x).inverse().mmult(x_t).mmult(this);
}

})(js);
