var js = (js || {}); // The context that holds all methods, see end of file.

(function(ctx){
    
ctx.csv2array = function(str,separator,quote){
    separator = (separator || ',');
	quote = (quote || '"');
    var mat = [], row = [], at = 0, i,
	l = str.length, even = 0;

	var parseValue = function(value,quote){
		var res = value.trim();
		if(res.charAt(0) == quote){
			res = res.substr(1,res.length-1);
		}
		if(res.charAt(res.length-1) == quote){
			res = res.substr(0,res.length-1);
		}
		if(res.trim().length > 0 && +res == res){
			return +res;
		}
		return res;
	};
	
	for(i=0;i<l;i++){
		if(str.charAt(i) == quote){
			even = (even+1)%2;	
		}
		if(str.charAt(i) == separator && even === 0){
			row.push(parseValue(str.substr(at,i-at),quote));
			at = i+1;
		}
		if(str.charAt(i) == '\n' && even === 0){
			row.push(parseValue(str.substr(at,i-at),quote));
			at = i+1;
			if(row.join("").trim().length > 0){
				mat.push(row);
			}
			row = [];
		}
	}
	if(at<l){
		row.push(parseValue(str.substr(at,l-at+1),quote));
		if(row.join("").trim().length > 0){
			mat.push(row);
		}
	}    
    return mat;
};

ctx.csv = function(str,options){
    // str is csv string to parse
    // options is optional object {sep:',',quote:'"',header:true}
    options = typeof options == "undefined" ? {}:options;
    var sep = typeof options.sep == "undefined" ? ',':options.sep,
    quote = typeof options.quote == "undefined" ? '"':options.quote,
	header = typeof options.header == "undefined" ? true:options.header,
	arr = ctx.csv2array(str,sep,quote),
	o = {},i,j;
	if(header == true){
		for(i=0;i<arr[0].length;i++){
			o[arr[0][i]] = [];
		}
		for(i=1;i<arr.length;i++){
			for(j=0;j<arr[0].length;j++){	
				o[arr[0][j]].push(arr[i][j]);		
			}
		}
		return o;	
	}else{
		for(i=0;i<arr[0].length;i++){
			o['C'+(i+1)] = [];	
		}
		for(i=0;i<arr.length;i++){
			for(j=0;j<arr[0].length;j++){	
				o['C'+(j+1)].push(arr[i][j]);		
			}
		}
		return o;		
		
	}
};

ctx.csv2json = function(str,options){
    // str is csv string to parse
    // options is optional object {sep:',',quote:'"',header:true}
    options = typeof options == "undefined" ? {}:options;
    var sep = typeof options.sep == "undefined" ? ',':options.sep,
    quote = typeof options.quote == "undefined" ? '"':options.quote,
	header = typeof options.header == "undefined" ? true:options.header,
	arr = ctx.csv2array(str,sep,quote),
	o = [],i,j;
	if(header == true){
		for(i=1;i<arr.length;i++){
			o.push({});
			for(j=0;j<arr[0].length;j++){
				o[i-1][arr[0][j]]=arr[i][j];
			}
		}
		return o;
	}else{
		for(i=0;i<arr.length;i++){
			o.push({});
			for(j=0;j<arr[0].length;j++){
				o[i]['C'+(j+1)]=arr[i][j];
			}
		}
		return o;
	}
};

ctx.names = function(obj){
	var n =[],o;
	for(o in obj){
		if(obj.hasOwnProperty(o)){n.push(o);}
	}
	return n;
}

})(js);//apply methods to js context (ctx) 
