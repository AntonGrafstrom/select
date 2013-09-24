var js = (js || {}); // The context that holds all methods, see end of file.

// Dependencies are List and Matrix

(function(ctx){

// Frame depend on List	(just an object to hold population data as lists)
// one method (i) to get sample data
// argument should be an object containing array(s)
ctx.Frame = function(obj){
	var prop;
	for(prop in obj){
		if(ctx.isArray(obj[prop]) || obj[prop].e){
			this[prop]=new ctx.List(obj[prop]);
		}
	}
};

ctx.frame = function(obj){
		return new ctx.Frame(obj);
}

ctx.Frame.prototype = {
	i: function(index){
		var prop, obj = {};
		for(prop in this){
			if(this.hasOwnProperty(prop)){
				obj[prop] = this[prop].i(index).e;
			}
		}
		return new ctx.Frame(obj);
	}
};

// simple random sampling with and without replacement
ctx.srs = function(n,N,replacement){
	var wr = replacement || false,	
	nrsampled = 0,s;
	if(wr==false){
		var nn = Math.min(n,N);
		s = new Array(nn);
		for(var i=0;i<N;i++){
			if(Math.random()< (nn-nrsampled)/(N-i)){
				s[nrsampled] = i+1;
				nrsampled += 1;
			}
		}
	}else{
		s = new Array(n);
		for(var i=0;i<n;i++){
			s[i] = Math.floor(Math.random()*N+1);
		}
		s = s.sort(function(a,b){return a-b;});
	}
	return s;
}	

// generation of a random number between 1 and length of prob according to prob
// a discrete random variable on 1,2,...,length
ctx.discrete = function(prob){
	var p = (prob.e || prob).slice(),
	r = Math.random(),
	psum = 0,
	x = 0;
	while( psum < r ){
		psum += p[x];
		x += 1;
	}
	return x;
}

// pps sampling with replacement
ctx.ppswr = function(p,n){
	//depends on discrete
	//p should sum to 1 
	var q = (p.e || p).slice(),
	N = q.length,
	qsum = 0,
	i,
	s = new Array(n);
	for(i=0;i<N;i++){ qsum+=q[i]; }
	for(i=0;i<N;i++){ q[i]=q[i]/qsum; }
	for(i=0;i<n;i++){ s[i]=ctx.discrete(q); }
	return s.sort(function(a,b){return a-b;});
}

// systematic sampling
ctx.systematic = function(pik){
	var p = (pik.e || pik).slice(),
	r = Math.random(),
	N = p.length,
	s = [],
	psum = 0,
	i;
	for(i=0;i<N;i++){
		if(psum < r && r <= psum+p[i]){
			s.push(i+1);
			r += 1; 
		}
		psum += p[i];
	}
	return s;
}

// systematic sampling with randomization
ctx.randomsystematic = function(pik){
	var p = (pik.e || pik).slice(),
	r = Math.random(),
	N = p.length,
	index = new Array(N),
	i,
	rnd,
	tmp,
	s=[],
	psum=0;
	//create index array
	for(i=0;i<N;i++){index[i]=i;}
	//randomize order of index array
	for(i = N; i; rnd = Math.floor(Math.random() * i), tmp = index[--i], index[i] = index[rnd], index[rnd] = tmp);
	//sample in the new random order
	for(i=0;i<N;i++){
		if(psum < r && r <= psum+p[index[i]]){
			s.push(index[i]+1);
			r += 1; 
		}
		psum += p[index[i]];
	}
	return s.sort(function(a,b){return a-b;});
}

// poisson sampling
ctx.poisson = function(pik){
	var p = (pik.e || pik).slice(),
	N = p.length,
	s = [],
	i;
	for(i=0;i<N;i++){
		if(Math.random()<p[i]){
			s.push(i+1);
		}
	}
	return s;
}	

// conditional poisson sampling
ctx.conditionalpoisson = function(p,n){
	//depends on poisson
	//sum(p) should be n or close to n
	var pr = (p.e || p).slice(),
	s = [];
	while(s.length!=n){
		s = ctx.poisson(pr);
	}
	return s;
}

// sampford pps sampling
ctx.sampford = function(pik){
	//depends on discrete,conditionalpoisson
	var p = (pik.e || pik).slice(),
	N = p.length,
	i,
	psum = 0,
	pd = p.slice(),
	n,nr1,found = 0,found2 = 0;
	for(i=0;i<N;i++){psum+=p[i];}
	for(i=0;i<N;i++){pd[i]=pd[i]/psum;}
	n = Math.round(psum);
	while(found == 0){
		nr1 = ctx.discrete(pd);
		if(n>1){
			s = ctx.conditionalpoisson(pik,n-1);
			found2 = 0;
			for(i=0;i<s.length;i++){
				if(s[i] == nr1){found2 = 1;}	
			}
			if(found2 == 0){found = 1; s.push(nr1);}
		}else{found=1; s=[nr1];}
	}
	return s.sort(function(a,b){return a-b;});
}

// pareto pps sampling
ctx.pareto = function(pik,eps){
	var p = (pik.e || pik).slice(),
	psum = 0,n,N = p.length,r = new Array(N),u,eps=(eps || 1e-9),i,s;
	for(i=0;i<N;i++){psum+=p[i];}
	n = Math.round(psum);
	for(i=0;i<N;i++){
		u = Math.random();
		if(eps<p[i] && p[i]<1-eps){
			r[i]=[i,(u/(1-u))/(p[i]/(1-p[i]))];
		}
		if(p[i]<=eps){r[i]=[i,Infinity];}
		if(p[i]>=1-eps){r[i]=[i,0];}
	}
	r = r.sort(function(a,b){return a[1]-b[1];});
	s = new Array(n);
	for(i=0;i<n;i++){s[i]=r[i][0]+1;}
	return s.sort(function(a,b){return a-b;});
}

//brewers pps method draw without replacement
ctx.brewer = function(pik,eps){
	//depends on discrete
	var p = (pik.e || pik).slice(),
	N = p.length,
	psum = 0,
	n,
	s = [], I = [], u,
	del1 = 0, pk=[], i, j,
	eps = (eps || 1e-9);
	for(i=0;i<N;i++){psum+=p[i];}
	n = Math.round(psum);
	for(j=0;j<N;j++){
		I[j] = 0;
		if(p[j]>1-eps){p[j]=0;I[j]=1;n=n-1;s.push(j+1);}
	}
	for(i = 1; i<=n; i++){		
		psum = 0;
    	for(j=0;j<N;j++){
			pk[j] = (1-I[j])*p[j]*(n-del1-p[j])/(n-del1-p[j]*(n-i+1));
			psum += pk[j];
		}
		for(j=0;j<N;j++){
			pk[j] = pk[j]/psum;
		}
    	u = ctx.discrete(pk);
    	s.push(u);
    	I[u-1] = 1;
    	del1 += p[u-1];
	}
	return s.sort(function(a,b){return a-b;});
}

// spatially correlated poisson sampling
ctx.scps = function(pik,xm,distfun){
	//does not randomize order
	var p = (pik.e || pik).slice(),
	x = xm.e || xm,N = p.length,
	s = [],weight,toSort,d,mw,nr,uw,sample = [];
	for(var i=0;i<N;i++){
		//Make sampling decision for unit i 
		if(Math.random()<p[i]){
			s.push(1);
			sample.push(i+1);
		}else{
			s.push(0);
		}
		//Update others
		if(i<N-1){
			//create md array to sort
			toSort = [];
			for(var k=i+1;k<N;k++){
				d = distfun(x[i],x[k]);
				mw = Math.min(p[k]/(1-p[i]),(1-p[k])/p[i]);
				toSort.push([k,d,mw]);	
			}
			toSort.sort(function(a, b){
					if(a[1]<b[1]){return -1;}
					if(a[1]>b[1]){return 1;}
					if(a[1]==b[1]){
						if(a[2]<=b[2]){
							return -1;
						}else{
							return 1;
						}	
					}
			});
			weight = 1;
			if(p[i]>0 && p[i]<1){
				for(var k=0;k<toSort.length;k++){
					nr = 1;
					while(nr+k<toSort.length){
						if(toSort[nr+k-1][1]==toSort[nr+k][1]){
							nr = nr + 1;
						}else{
							break;
						}
					}
					// nr = number of units at equal dist
					// uw = used weight on unit toSort[k][0]
					uw = Math.min(weight/nr,toSort[k][2]);
					// Update
					p[toSort[k][0]] = p[toSort[k][0]]-(s[i]-p[i])*uw;
					// Remove used weight
					weight = weight-uw;
					if(weight==0){break;}
				}
			}
		}
	}	
	return sample;
}

// The Local pivotal method
ctx.localpivotal = function(pik,xm,distfun,eps){
	var a,chooseFrom=[],others,mindist,n1,n2,nr1,nr2,i,j,s=[],nmax,nmin, u,
	x = xm.e || xm,eps = (eps || 1e-9),
	p = (pik.e || pik).slice(),
	N = p.length, NR = N,a,d;
	for(i=0;i<N;i++){
		if(p[i]<0){p[i]=0;}
		if(p[i]>1){p[i]=1;}
		if(p[i]>0 && p[i]<1){chooseFrom.push(i);}
	}
	NR = chooseFrom.length;
	while(NR > 0){
		nr1 = Math.floor(Math.random()*NR);
		n1 = chooseFrom[nr1];
		others = [];
		mindist = Infinity;
		for(i=0;i<NR;i++){
			if(chooseFrom[i]!=n1){
				d = distfun(x[n1],x[chooseFrom[i]]);
				if(d==mindist){
					others.push([chooseFrom[i],i]);	
				}
				if(d<mindist){
					mindist = d;
					others = [[chooseFrom[i],i]];	
				}
			}
		}
		if(others.length>0){
			u = Math.floor(Math.random()*others.length);
			n2 = others[u][0];
			nr2 = others[u][1];	
			a = Math.min(1,(p[n1]+p[n2]));
			if(Math.random()<(a-p[n2])/(2*a-p[n1]-p[n2])){
				p[n2] = p[n1]+p[n2]-a;
				p[n1] = a;
			}else{
				p[n1] = p[n1]+p[n2]-a;
				p[n2] = a;
			}
			if(p[n1]<eps){p[n1]=0;}
			if(p[n1]>1-eps){p[n1]=1;}
			if(p[n2]<eps){p[n2]=0;}
			if(p[n2]>1-eps){p[n2]=1;}
			
			nmax = Math.max(nr1,nr2);
			nmin = Math.min(nr1,nr2);
			if(p[chooseFrom[nmax]]==0 || p[chooseFrom[nmax]]==1){
				chooseFrom.splice(nmax,1);
			}
			if(p[chooseFrom[nmin]]==0 || p[chooseFrom[nmin]]==1){
				chooseFrom.splice(nmin,1);
			}
		}else{
			if(Math.random() < p[n1]){p[n1]=1;}else{p[n1]=0; chooseFrom=[];}	
		}
		NR = chooseFrom.length;
	}
	for(i=0;i<N;i++){if(p[i]>=1-eps){s.push(i+1);}}
	return s;
}

// The random pivotal method
ctx.randompivotal = function(pik,eps){
	var p = (pik.e || pik).slice(),
	chooseFrom=[],n1,n2,nr1,nr2,i,s=[],a,nmax,nmin,
	eps = (eps || 1e-9),
	N = p.length;
	for(i=0;i<N;i++){
		if(p[i]<0){p[i]=0;}
		if(p[i]>1){p[i]=1;}
		if(p[i]>0 && p[i]<1){chooseFrom.push(i);}
	}
	while(chooseFrom.length > 0){
		nr1 = Math.floor(Math.random()*chooseFrom.length);
		n1 = chooseFrom[nr1];
		if(chooseFrom.length > 1){
			nr2 = Math.floor(Math.random()*(chooseFrom.length-1));
			if(nr2>=nr1){nr2+=1;}
			n2 = chooseFrom[nr2];	
			a = Math.min(1,(p[n1]+p[n2]));
			if(Math.random()<(a-p[n2])/(2*a-p[n1]-p[n2])){
				p[n2] = p[n1]+p[n2]-a;
				p[n1] = a;
			}else{
				p[n1] = p[n1]+p[n2]-a;
				p[n2] = a;
			}
			if(p[n1]<eps || p[n1]>1-eps){p[n1]=Math.round(p[n1]);}
			if(p[n2]<eps || p[n2]>1-eps){p[n2]=Math.round(p[n2]);}
			nmax = Math.max(nr1,nr2);
			nmin = Math.min(nr1,nr2);
			if(p[chooseFrom[nmax]]==0 || p[chooseFrom[nmax]]==1){
				chooseFrom.splice(nmax,1);
			}
			if(p[chooseFrom[nmin]]==0 || p[chooseFrom[nmin]]==1){
				chooseFrom.splice(nmin,1);
			}
		}else{
			if(Math.random() < p[n1]){p[n1]=1;}else{p[n1]=0;}
			chooseFrom=[];	
		}
	}
	for(i=0;i<N;i++){if(p[i]==1){s.push(i+1);}}
	return s;
}

// Euclidean dist
ctx.euclideandist = function(x,y){
	var a = (x.e || x).slice(),
	b = (y.e || y).slice(),
	res = 0, i;
	for(i=0;i<a.length;i++){
		res = res + Math.pow(a[i]-b[i],2);
	}
	return Math.sqrt(res);
}

// a variant of distance from Grafstrom and Schelin
ctx.gsdist = function(x,y){
	var a = (x.e || x).slice(),
	b = (y.e || y).slice(),
	res1 = 0, res2 = 0, i;
	for(i=0;i<a.length;i++){
		if(!isNaN(a[i]) && !isNaN(b[i])){
			res1 += Math.pow(a[i]-b[i],2);
		}else{
			if(a[i]!=b[i]){
				res2+=1;	
			}
		}
	}
	return Math.sqrt(res1)+res2;
}

// calculation of inclusion probabilities from positive auxiliary variable
ctx.inclusionprobabilities = function(x,n,eps){
	var p = (x.e || x).slice(),
	sp,N,n1,i,pmax,eps=(eps || 1e-9);
	N = p.length;
	sp = 0;
	for(i=0;i<N;i++){
		sp+=p[i];
		if(p[i]<0){return null;}
	}
	pmax=0;
	for(i=0;i<N;i++){
		p[i] = n*p[i]/sp;
		pmax = Math.max(pmax,p[i]);
	}
	while(pmax>1){
		n1 = 0;
		sp = 0;
		for(i=0;i<N;i++){
			if(p[i]>=1){p[i]=1;n1+=1;}
			sp+=p[i];
		}
		pmax = 0;
		for(i=0;i<N;i++){
			if(p[i]<1){p[i]=(n-n1)/(sp-n1)*p[i];}
			pmax = Math.max(pmax,p[i]);
		}
	}
	for(i=0;i<N;i++){
		if(p[i]>1-eps){p[i]=1;}
	}
	return p;
}
ctx.incl = ctx.inclusionprobabilities;

// start implementation of the cube method
// depends on matrix.js for rref
ctx.onestepfastflightcube = function(pik,Bm){
	var phi = (pik.e || pik).slice(),
	B = (Bm.e || Bm),
	ncol = B[0].length,
	nrow = B.length,
	i, j,
	u = new Array(ncol), 
	lambda1 = Infinity,
	lambda2 = Infinity,
	lambda,
	eps = 1e-9,
	lead, v, free = -1;
	// nr of units must be larger than nr of balancing variables
	if(nrow>=ncol){return null;}
	// find nonzero vector u in Ker B (null space of B, i.e. Bu = 0)
	// with both positive and negative values
	// find reduced row echelon form of B
	B = ctx.matrix(B).rref();
	for(i=(nrow-1);i>=0;i--){
		// find lead (first nonzero entry on row) if exists
		// if no lead, i.e lead = ncol, do nothing
		// if lead, the variables after are either set or free
		// free variables are set to 1 or -1 (is this the best?, does it matter?)
		lead = 0;
		for(j=0;j<ncol;j++){if(B.e[i][j]==0){lead++;}else{break;}}
		// lead found
		if(lead<ncol){
			v = 0;
			for(j=lead+1;j<ncol;j++){
				if(typeof(u[j])!="number"){
					free *= -1;
					u[j] = free;
				}
				v -= u[j]*B.e[i][j];		
			}
			u[lead] = v/B.e[i][lead];
		}
	}
  	// unset u[i] are free and are set to 1 or -1, can only exist at beginning
  	for(i=0;i<ncol;i++){
		if(typeof(u[i])!="number"){
			free *= -1;
			u[i] = free;
		}else{break;}	
	}
	// find lambda1 and lambda2
	for(i=0;i<ncol;i++){
		if(u[i]>0){
			lambda1 = Math.min(lambda1,(1-phi[i])/u[i]);
			lambda2 = Math.min(lambda2,phi[i]/u[i]);
		}
		if(u[i]<0){
			lambda1 = Math.min(lambda1,-phi[i]/u[i]);
			lambda2 = Math.min(lambda2,(phi[i]-1)/u[i]);					
		}
	}
	// random choice of p+lambda1*u and p-lambda2*u
	if(Math.random()<lambda2/(lambda1+lambda2)){
		lambda = lambda1;
	}else{
		lambda = -lambda2;
	}
	// update phi
	for(i=0;i<ncol;i++){
			phi[i] = phi[i] + lambda * u[i];
			if(phi[i] < eps){ phi[i] = 0; }
			if(phi[i] > 1-eps){ phi[i] = 1; }
	}
	return phi;	
}

ctx.cube = function(pik,Xbal){
	// landing by supression of balancing variables, 
	// starting from the column with largest index.
	// the first (nr of balancing variables +1) undecided
	// units are sent to flightphase each time.
	// hence the units can be sorted by decending probabilities
	// before applying the method in order to improve balance
	// by deciding for large units first. this is not done automatically.	  
	var p = (pik.e || pik).slice(),
	p_orig = p.slice(),
	x = (Xbal.e || Xbal),
	N = p.length,
	ncol = x.length,
	naux = x[0].length,
	B = [], p_small, index_small, i, j, nr=N, 
	counts=0, count2, start=0, eps=1e-9, howmany, s=[];
		
	if(N!=ncol){return null;} // length of pik must match nr of columns in B
	
	while(nr > 0 && counts <= N){
		nr = 0;
		x_small = [],p_small=[], index_small=[];
		for(i=start;i<N;i++){
			if(p[i]>eps && p[i]<1-eps){
				nr++;					
			}else{
				if(start==i){start=i+1;}
				// start is the first undecided unit in the list
			}
		}
		// nr is nr of units with 0<p<1
		// howmany is the number of units we choose to use
		// in the flight phase. for optimal speed it is
		// equal to nr of balancing variables + 1. 
		// if fewer units remain, balancing variables are dropped. 
		// the maximum nr of balancing variables is howmany - 1.
		howmany = Math.min(naux+1,nr);	
		// run flightphase only if howmany > 1
		if( howmany > 1 ){	
			// build empty arrays to hold p and index
			// for selected subset			
			p_small = new Array(howmany);
			index_small = new Array(howmany);	
			// build empty B-matrix of size (howmany-1) x howmany		
			B = new Array((howmany-1));	
			for(i=0;i<howmany-1;i++){
				B[i]=new Array(howmany);
			}
			// fill B, p_small, index_small
			count2 = 0;
			for(i=start;i<N;i++){
				if(p[i]>eps && p[i]<1-eps){
					count2++;
					if(count2<=howmany){
						for(j=0;j<howmany-1;j++){
							B[j][count2-1]=x[i][j]/p_orig[i];
						}
						p_small[count2-1] = p[i];
						index_small[count2-1] = i;
					}else{
						break;	
					}	
				}
			}
			// run flightphase on selected subset
			p_small = ctx.onestepfastflightcube(p_small,B);
			// update p
			for(i=0;i<howmany;i++){
				p[index_small[i]] = p_small[i];
			}
		}else{
			// max one unit left
			for(i=start;i<N;i++){
				if(p[i]>eps && p[i]<1-eps){
					if(Math.random()<p[i]){p[i]=1}else{p[i]=0};
				}
			}
		}
		counts++;	
	}
	// make index sample from indicators
	for(i=0;i<N;i++){ if( p[i] > 1-eps ){ s.push(i+1); }}	
	return s;
}


ctx.localcube = function(pik,Xbal,Xspread,distfun){
	// landing by supression of balancing variables, 
	// starting from the column with largest index.	  
	var p = (pik.e || pik).slice(),
	p_orig = p.slice(),
	x = (Xbal.e || Xbal),
	xspread = (Xspread.e || Xspread),
	N = p.length,
	ncol = x.length,
	naux = x[0].length,
	B = [], p_small, index_small, i, j, k, nr=N, 
	counts=0, one, eps=1e-9, howmany, left=[], s=[], dists, d;
		
	if(N!=ncol){return null;} // length of pik must match nr of columns in B
	
	for(i=0;i<N;i++){
		if(p[i]>eps && p[i]<1-eps){
			left.push(i);					
		}
	}
	
	while(nr>0 && counts <= N){
		nr = left.length;
		// nr is nr of units with 0<p<1
		// howmany is the number of units we choose to use
		// in the flight phase. for optimal speed and spatial balance it is
		// equal to nr of balancing variables + 1. 
		// if fewer units remain, balancing variables are dropped. 
		// the maximum nr of balancing variables is howmany - 1.
		howmany = Math.min(naux+1,nr);	
		// run flightphase only if howmany > 1
		if( howmany > 1 ){	
			
			// build empty arrays to hold p and index
			// for selected subset			
			p_small = new Array(howmany);
			index_small = new Array(howmany);	
			
			// build empty B-matrix of size (howmany-1) x howmany		
			B = new Array((howmany-1));	
			for(i=0;i<howmany-1;i++){
				B[i]=new Array(howmany);
			}
			
			// select one unit randomly
			one = Math.floor(Math.random()*nr);
			
			// calculate distance to the others, and store 
			// only the howmany closests
			dists = new Array(howmany);
			for(i=0;i<howmany;i++){
				dists[i] = [i,Infinity];	
			}
			
			for(i=0;i<nr;i++){
				d = distfun(xspread[left[one]],xspread[left[i]]);
				// check if candidate
				if(d<dists[howmany-1][1]){
					for(j=0;j<howmany;j++){
						if(d<dists[j][1]){		
							dists.splice(j,0,[i,d]); // enter new value at correct position
							dists.pop(); // remove last element of dists
							break;	
						}
					}
				}
			}
			
			// fill B, p_small, index_small
			for(i=0;i<howmany;i++){
				for(j=0;j<howmany-1;j++){
					B[j][i]=x[left[dists[i][0]]][j]/p_orig[left[dists[i][0]]];
				}
				p_small[i] = p[left[dists[i][0]]];
				index_small[i] = left[dists[i][0]];
			}
				
			// run flightphase on selected subset
			p_small = ctx.onestepfastflightcube(p_small,B);
			
			// update p
			for(i=0;i<howmany;i++){
				p[index_small[i]] = p_small[i];
			}
			
			// remove finished units from array left
			j = 0;
			for(i=0;i<nr;i++){
				if(p[left[j]]<eps || p[left[j]]>1-eps){
					// remove index j from left	
					left.splice(j,1);			
				}else{
					j++;
				}
			}
		}else{
			// max one unit left
			if(left.length==1){
				if(p[left[0]]>eps && p[left[0]]<1-eps){
					if(Math.random()<p[left[0]]){p[left[0]]=1}else{p[left[0]]=0};
				}
				left=[];
			}
		}
		counts++;	
	}
	// make index sample from indicators
	for(i=0;i<N;i++){ if( p[i] > 1-eps ){ s.push(i+1); }}	
	return s;
}

//misc utilities

// a simulation helper function
ctx.simulate = function(fn,n){
	var r = {},i,c;
	for(i=1;i<=n;i++){
		c = fn();
		for(o in c){
			r[o] = (r[o] || []);
			r[o].push(c[o]);
		}	
	}
	for(o in r){
		r[o] = new ctx.List(r[o]);
	}
	return r;
}

// a timer object
ctx.Timer = function(){
	this.time = (new Date()).getTime();
	this.getTime = function(){return (new Date()).getTime()-this.time;}
	this.toJSON = this.getTime;
	this.toString = this.getTime;	
}
ctx.timer = function(){return new ctx.Timer();}

})(js);//apply methods to js context (ctx)  
