var js = (js || {}); // The context that holds all methods, see end of file.

(function(ctx){
// the Horvitz-Thompson estimator
ctx.ht = function(y,pik){
	var p = (pik.e || pik).slice(),
	ya = (y.e || y).slice(),
	n = p.length, yHT = 0, i;
	for(i=0;i<n;i++){yHT+=ya[i]/p[i];}
	return yHT;
}

// the ratio estimator
ctx.ratioest = function(y,x,Tx,pik){
	var p = (pik.e || pik).slice(),
	ya = (y.e || y).slice(),
	xa = (x.e || x).slice(),
	xHT=0,
	yHT=0;
	if(p.length!=xa.length){return null;}
	if(ya.length!=xa.length){return null;}
	if(p.length!=ya.length){return null;}
	for(var i=0;i<xa.length;i++){
			xHT +=  xa[i]/p[i];
			yHT +=  ya[i]/p[i];
	}
	return Tx*yHT/xHT;	
}

// Deville's varest of HTestimator
ctx.htvarest = function(y,pik){
	var p = (pik.e || pik).slice(),
	ya = (y.e || y).slice(),
	n = p.length,
	s1mp = 0,
	sak2 = 0,
	del = 0,
	dsum = 0,
	i;
	for(i=0;i<n;i++){
		s1mp += 1-p[i];
		del += ya[i]/p[i]*(1-p[i]); 
	}
	for(i=0;i<n;i++){
		sak2 += (1-p[i])/s1mp*(1-p[i])/s1mp;
		dsum += (1-p[i])*(ya[i]/p[i]-del/s1mp)*(ya[i]/p[i]-del/s1mp);
	}
	return 1/(1-sak2)*dsum;
}

// GS varest of HTestimator
// for well spread samples
ctx.htvarest2 = function(y,pik,x,distfun){
	var ya = (y.e || y).slice(),
	p = (pik.e || pik).slice(),
	z = (x.e || x).slice(),
	n = p.length,
	i,j,k,d,nearest,mindist,ni,res=0,lht;
	for(i=1;i<=n;i++){
		nearest = [];
		mindist = Infinity;
		for(j=1;j<=n;j++){
			if(i!=j){
				d = distfun(z[j-1],z[i-1]);
				if(d==mindist){
					nearest.push(j);
				}
				if(d<mindist){
					mindist = d;
					nearest = [j];
				}
			}	
		}
		nearest.push(i);
		ni = nearest.length;
		lht = 0;
		for(k=0;k<ni;k++){
			lht += ya[nearest[k]-1]/p[nearest[k]-1];
		}
		res += ni/(ni-1)*Math.pow(ya[i-1]/p[i-1]-1/ni*lht,2);
	}
	return res;
}

// WR estimator of total
ctx.wrest = function(y,p){
	//p is drawing probabilities for sample (sum to 1 for population)
	//y is y-values for sample
	var x = (y.e || y).slice(),
	q = (p.e || p).slice(),
	n = x.length, res = 0, i;
	for(i=0;i<n;i++){res+=x[i]/q[i];}
	return res/n;
}

// WR varest of wr_estimator of total
ctx.wrvarest = function(y,p){
	//p is drawing probabilities for sample (sum to 1 for population)
	//y is y-values for sample
	var x = (y.e || y).slice(),
	q = (p.e || p).slice(),
	n = x.length, res = 0, i, m;
	for(i=0;i<n;i++){res+=x[i]/q[i];}
	m = res/n; res = 0;
	for(i=0;i<n;i++){res+=(x[i]/q[i]-m)*(x[i]/q[i]-m);}
	return (res/(n-1))/n;
}

// a balance measure of how well spread a sample is
ctx.voronoibalance = function(pik,x,sample,distfun){
	var z = (x.e || x).slice(),
	p = (pik.e || pik).slice(),
	s = (sample.e || sample).slice(),
	N = p.length,
	n = s.length,
	incl = new Array(N),
	i,j,k,d,nearest,mindist,res=0;
	for(i=0;i<N;i++){incl[i]=0;}
	for(i=1;i<=N;i++){
		nearest = [];
		mindist = Infinity;
		for(j=1;j<=n;j++){
			d = distfun(z[s[j-1]-1],z[i-1]);
			if(d==mindist){
				nearest.push(s[j-1]);
			}
			if(d<mindist){
				mindist = d;
				nearest = [s[j-1]];
			}
		}
		for(k=0;k<nearest.length;k++){
			incl[nearest[k]-1] = incl[nearest[k]-1] + p[i-1]/nearest.length;
		}
	}
	for(i=0;i<n;i++){res+=(incl[s[i]-1]-1)*(incl[s[i]-1]-1);}	
	return res/n;
}

// nearest neighbor estimator
ctx.nnest = function(sample,ys,x,distfun){
	var z = (x.e || x).slice(),
	y = (ys.e || ys).slice(),
	s = (sample.e || sample).slice(),
	N = z.length,
	n = s.length,
	ni = [],
	i,j,k,d,nearest,mindist,res=0;
	for(i=0;i<n;i++){ni[i]=0;}
	for(i=0;i<N;i++){
		nearest = [];
		mindist = Infinity;
		for(j=0;j<n;j++){
			d = distfun(z[s[j]-1],z[i]);
			if(d==mindist){
				nearest.push(j);
			}
			if(d<mindist){
				mindist = d;
				nearest = [j];
			}
		}
		for(k=0;k<nearest.length;k++){
			ni[nearest[k]] = ni[nearest[k]] + 1/nearest.length;
		}
	}
	for(i=0;i<n;i++){res += ni[i]*y[i];}
	return res;
}

})(js);//apply methods to js context (ctx)  
