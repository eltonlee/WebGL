// ClickedPints.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';



// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + 
  'void main() {\n' +
  		'gl_FragColor = u_FragColor;\n' +
  //'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';



var Cflag = false;
var Sflag = false;
var Tflag = false;
var vertexBuffer;
var g_points = [];
var s_points = [];
var c_points = [];
var gpointCount = 0;
var size;
var g_colors = [];

function main() {

  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  var element = document.getElementById('Tri');
  element.addEventListener('click', Tclicked);
  
  var element = document.getElementById('Squ');
  element.addEventListener('click', Sclicked);

  var element = document.getElementById('Cir');
  element.addEventListener('click', Cclicked);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position, u_FragColor); };
  document.getElementById('clearButton').onclick = function () { clearCanvas(gl) };
  //document.getElementById('Cir').onclick = function () { clearCanvas() };
  //document.getElementById('Squ').onclick = function () { clearCanvas() };
  //document.getElementById('Tri').onclick = function () { makeTri(gl) };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  
}

function Tclicked(){
	Tflag = true;
	Sflag = false;
  	Cflag = false;
}

function Cclicked(){
	Tflag = false;
	Sflag = false;
  	Cflag = true;
}

function Sclicked(){
	Tflag = false;
	Sflag = true;
  	Cflag = false;
  	/*
  	if (g_points){
  		g_points = []
  	}
  	*/
}
var clickFlag = false;
var x = 0;
var y = 0;
//var g_points = []; // The array for the position of a mouse press

function click(ev, gl, canvas, a_Position, u_FragColor) {
var r = (document.getElementById("red").value)/100;
var g = (document.getElementById("green").value)/100;
var b = (document.getElementById("blue").value)/100;
//g_colors.push(1.0);g_colors.push(b);g_colors.push(g);g_colors.push(r);
gl.uniform4f(u_FragColor, r, g, b, 1.0)

  x = ev.clientX; // x coordinate of a mouse pointer
  y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  // Store the coordinates to g_points array
  //g_points.push(x); g_points.push(y);
  //gpointCount+=2;

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  if(Tflag == true){
  	g_points.push(x); g_points.push(y);
  	count = makeTri(gl);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, count);
  }

  if(Sflag == true){
  	s_points.push(x); s_points.push(y);
  	count = makeSqu(gl);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, count);
  }

  if(Cflag == true){
  	c_points.push(x); c_points.push(y);
  	count = makeCir(gl);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, count);
    c_points = [];
	
  }

  if(Tflag == false){
  	if(Cflag == false){
  		if(Sflag == false){
  			s_points.push(x); s_points.push(y);
  			count = makeSqu(gl);

    		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    		gl.enableVertexAttribArray(a_Position);

    		gl.drawArrays(gl.TRIANGLES, 0, count);
  		}
  	}
  }
  
/*
  var len = g_points.length;
  for(var i = 0; i < len; i += 2) {
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);

    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);

  }
  */
}

function makeTri(gl){
	size = (document.getElementById("Shape Size").value)/100;
	var vertices = new Float32Array((g_points.length)*3);
	var count = 0;
	var j = 0;
	for(var i = 0; i < g_points.length; i+=2){
		vertices[j] = g_points[i];
		vertices[j+1] = g_points[i+1]+size;

		vertices[j+2] = g_points[i]-size;
		vertices[j+3] = g_points[i+1]-size;

		vertices[j+4] = g_points[i]+size;
		vertices[j+5] = g_points[i+1]-size;
		j+=6;
	}
	
	for(var i = 0; i < vertices.length; i+= 2){
		count += 1;
	}
	
	vertexBuffer = gl.createBuffer();
  	if (!vertexBuffer) {
    	console.log('Failed to create the buffer object');
    return -1;
  	}

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  	return count;
}

function makeSqu(gl){
	size = (document.getElementById("Shape Size").value)/100;
	var vertices = new Float32Array((s_points.length)*6);
	var count = 0;
	var j = 0;
	for(var i = 0; i < s_points.length; i+=2){
		vertices[j] = s_points[i]-size;
		vertices[j+1] = s_points[i+1]+size;

		vertices[j+2] = s_points[i]-size;
		vertices[j+3] = s_points[i+1]-size;

		vertices[j+4] = s_points[i]+size;
		vertices[j+5] = s_points[i+1]+size;

		vertices[j+6] = s_points[i]+size;
		vertices[j+7] = s_points[i+1]+size;

		vertices[j+8] = s_points[i]+size;
		vertices[j+9] = s_points[i+1]-size;

		vertices[j+10] = s_points[i]-size;
		vertices[j+11] = s_points[i+1]-size;
		j+=12;
	}
	
	for(var i = 0; i < vertices.length; i+= 2){
		count += 1;
	}
	
	vertexBuffer = gl.createBuffer();
  	if (!vertexBuffer) {
    	console.log('Failed to create the buffer object');
    return -1;
  	}

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  	return count;
}

function makeCir(gl){
	var r = (document.getElementById("Shape Size").value)/100;
	var forone = 105;
	var vertices = new Float32Array((c_points.length)*105);
	var j = 0;
	var k = 0;
	var z = 0;
	var count = 0;
	var temp = 2;

	for (var k = 0; k < c_points.length; k+=2){
		vertices[0] = c_points[k];
		vertices[1] = c_points[k+1];
		for (var i = 2; i < forone*2-1; i+=2){
			vertices[i] = c_points[k] + r*Math.cos(j*2*Math.PI/100);
   			vertices[i+1] =  c_points[k+1] + r*Math.sin(j*2*Math.PI/100);
   			j++;    
		}
		//i = 208 for last verices
		//vertices[(forone*2-2)+z] = vertices[temp + z];
		//vertices[(forone*2-1)+z] = vertices[temp + z+1]; 
		//z+=210;	
		j = 0;
	}	

	for(var i = 0; i < vertices.length; i+= 2){
		count += 1;
	}

	vertexBuffer = gl.createBuffer();
  	if (!vertexBuffer) {
    	console.log('Failed to create the buffer object');
    return -1;
  	}

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  	return count;
}

function clearCanvas(gl){
	g_points = [];
	s_points = [];
	c_points = [];
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);	
}



