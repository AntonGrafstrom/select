select
======

A JavaScript library for probability sampling


´´´
// Draw a simple random sample without replacement of size 5 from a population of size 10
s = js.srs(5,10);
print(s);
´´´	 

´´´
// Draw a simple random sample with replacement of size 5 from a population of size 10
s = js.srs(5,10,true);
print(s);
´´´ 

´´´
// Draw 100 simple random samples without replacement of size 5 from a population of size 10
// and print results as csv (comma separated values) where each row is a sample.
t = [];
for(i=0;i&lt;100;i++){
	t[i] = js.srs(5,10);
}
print(t.join('\n'));
´´´ 	 
	 
´´´
// Draw a Pareto pps sample
p = [.2,.3,.7,.8]; // parameters (should sum to integer)
s = js.pareto(p);
print(s);
´´´ 

´´´
// Draw a Sampford pps sample
p = [.2,.3,.7,.8]; // inclusion probabilities (should sum to integer)
s = js.sampford(p);
print(s);
´´´ 

´´´
// Draw a Brewer pps sample
p = [.2,.3,.7,.8]; // inclusion probabilities (should sum to integer)
s = js.brewer(p);
print(s);
´´´ 

´´´
// Draw a (random size) Poisson sample
p = [.2,.3,.7,.8]; // inclusion probabilities
s = js.poisson(p);
print(s);
´´´ 

´´´
// Draw a Conditional Poisson sample
p = [.2,.3,.7,.8]; // parameters
n = 2; // sample size
s = js.conditionalpoisson(p,n);
print(s);
´´´ 

´´´
// Draw a Systematic pps sample
p = [.2,.3,.7,.8]; // inclusion probabilities
s = js.systematic(p);
print(s);
´´´ 

´´´
// Draw a Systematic pps sample with randomized order of the units
p = [.2,.3,.7,.8]; // inclusion probabilities
s = js.randomsystematic(p);
print(s);
´´´ 

´´´
// Draw a pps sample with the random pivotal method
p = [.2,.3,.7,.8]; // inclusion probabilities
s = js.randompivotal(p);
print(s);
´´´ 

´´´
// Draw a pps with replacement sample
p = [.1,.15,.35,.4]; // drawing probabilities (should sum to 1)
n = 2; // sample size
s = js.ppswr(p,n);
print(s);
´´´ 

´´´
// minimal demo of the cube method
// inclusion probabilities
p = [.1,.2,.3,.7,.8,.9]; 
// balancing variables, balance on p to have fixed size
// balance on a constant to improve ht estimator of population size
X = [
  [.1, 1],
  [.2, 1],
  [.3, 1],
  [.7, 1],
  [.8, 1],
  [.9, 1]
];
// select sample 
s = js.cube(p,X);
// print sample
print(s);
´´´ 

´´´
// starter example, work with lists, the list object has 70+ methods
x = js.li([1,2,3,4,5]); // creates a list with elements [1,2,3,4,5]
y = js.li([1,2,4,4,4]);

// a list is an object with one variable named e, the Array
// x.e = [1,2,3,4,5];
// the list uses a 1-based index (Arrays use a 0-based index)
// get first element of x as x1 = x.i(1);
// get several elements by using an Array or list, x.i([1,2,3])

// you can use .add() or .substract(), .divide(), .multiply()
z = x.add(y);
print('z = ' + z);

// sum, mean, var, std
xsum = x.sum();
xmean = x.mean();
xvar = x.variance();
xstd = x.std();
print('xsum = ' + xsum);
print('xmean = ' + xmean);
print('xvar = ' + xvar);
print('xstd = ' + xstd);

// cov, cor
xycov = x.cov(y);
xycor = x.cor(y);
print('xycov = ' + xycov);
print('xycor = ' + xycor);

// chaining
xvar = x.substract(x.mean()).pow(2).sum()/(x.length()-1);
print('xvar = ' + xvar);
´´´ 	


´´´
// check inclusion probabilities for systematic pps sample
p = [.2,.3,.7,.8]; // inclusion probabilities
counts = js.rep(0,4); // [0,0,0,0] counter for nr of inclusions
nrs = 1000; // nr of samples to simulate
for(i=0;i&lt;nrs;i++){
	s = js.systematic(p); // draw sample
  	counts.increment(s); // increment counts for sampled units
}
print(counts.divide(nrs)); // print result
´´´ 

´´´
// small example with simple random sampling
x = js.li([5,4,7,3,6,4,8,2,11,9]); // population x-values as a list
N = x.length(); // population size
n = 5; // sample size

sample = js.srs(n,N); // select sample
xs = x.i(sample); // sampled x-values

print( 'sample = ' + sample );
print( 'sample x = ' + xs );
print( 'mean = ' + xs.mean() );
print( 'variance = ' + xs.variance() );
´´´ 

´´´
// small bootstrap example 
x = js.li([5,4,7,3,6,4,8,2,11,9]); // x-values as a list

// example of chaining, select one bootstrap sample 
// and calculate sample mean
bootstrapmean = x.bootstrap().mean();

print( 'bootstrapmean = ' + bootstrapmean );
´´´ 



´´´
// demo of the cube method, with simulation
// inclusion probabilities
p = [.1,.2,.3,.7,.8,.9]; 
// balancing variables, balance on p to have fixed size
// balance on a constant to improve ht estimator of population size
X = [
  [.1, 1],
  [.2, 1],
  [.3, 1],
  [.7, 1],
  [.8, 1],
  [.9, 1]
];
// count nr of inclusions 
counts = js.rep(0,6);
// draw nrs samples
nrs = 1000;
// do simulation
for(i=0;i&lt;nrs;i++){
 s = js.cube(p,X);
 counts.increment(s);
}
// check inclusion probabilities
print(counts.divide(nrs));
´´´ 

´´´
// demo of the cube method
// 2 strata and 2 auxiliary variables
X = [
[1,0,1,2],
[1,0,2,5],
[1,0,3,7],
[1,0,4,9],
[1,0,5,1],
[1,0,6,5],
[1,0,7,7],
[1,0,8,6],
[1,0,9,9],
[1,0,10,3],
[0,1,11,3],
[0,1,12,2],
[0,1,13,3],
[0,1,14,6],
[0,1,15,8],
[0,1,16,9],
[0,1,17,1],
[0,1,18,2],
[0,1,19,3],
[0,1,20,4]
];
pik = js.rep(1/2,20);
counts = js.rep(0,20);
nrs = 1000; 
// do simulation
for(i=0;i&lt;nrs;i++){
	s = js.cube(pik,X);
	counts.increment(s);
}
// check inclusion probabilities
print(counts.divide(nrs));
´´´
