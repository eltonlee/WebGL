var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

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

  // Set the vertex coordinates and color
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }

  // Calculate the view projection matrix
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);


  // Register the event handler
  var currentAngle = [0.0, 0.0]; // Current rotation angle ([x-axis, y-axis] degrees)
  initEventHandlers(canvas, currentAngle);

  document.onkeydown = function(ev){ keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, currentAngle, canvas); };

  var tick = function() {   // Start drawing
    draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
    requestAnimationFrame(tick, canvas);
  };
  tick();

  // Pass the model view projection matrix to u_MvpMatrix
  //gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the cube
  //gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

var ANGLE_STEP = 45.0
var g_headrotate = 0.0;
function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, currentAngle, canvas) {
  switch (ev.keyCode) {
    case 90: // 'ｚ'key -> the positive rotation of joint2
      g_headrotate = (g_headrotate + ANGLE_STEP) % 360;
      break; 
  }
  // Draw the robot arm
  var tick = function() {   // Start drawing
    draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle); // Draw the robot arm
    requestAnimationFrame(tick, canvas);
  };
  tick();
  //draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
    /*
    0.5,  0.5,  0.5,     1.0,  1.0,  1.0,  // v0 White
    -0.5,  0.5,  0.5,     1.0,  0.0,  1.0,  // v1 Magenta
    -0.5, -0.5,  0.5,     1.0,  0.0,  0.0,  // v2 Red
     0.5, -0.5,  0.5,     1.0,  1.0,  0.0,  // v3 Yellow
     0.5, -0.5, -1.0,     0.0,  1.0,  0.0,  // v4 Green
     0.5,  0.5, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
    -0.5,  0.5, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
    -0.5, -0.5, -1.0,     0.0,  0.0,  0.0   // v7 Black
*/
     0.5,  0.5,  0.5,     0.0,  0.0,  1.0,  // v0 White
    -0.5,  0.5,  0.5,     0.0,  1.0,  1.0,  // v1 Magenta
    -0.5, -0.5,  0.5,     1.0,  0.0,  0.0,  // v2 Red
     0.5, -0.5,  0.5,     1.0,  1.0,  1.0,  // v3 Yellow
     0.5, -0.5, -1.0,     1.0,  0.0,  0.0,  // v4 Green
     0.5,  0.5, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
    -0.5,  0.5, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
    -0.5, -0.5, -1.0,     1.0,  1.0,  1.0   // v7 Black
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
 ]);

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();
  if (!vertexColorBuffer || !indexBuffer) {
    return -1;
  }

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initEventHandlers(canvas, currentAngle) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse

  canvas.onmousedown = function(ev) {   // Mouse is pressed
    var x = ev.clientX, y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };

  canvas.onmouseup = function(ev) { dragging = false;  }; // Mouse is released

  canvas.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var factor = 100/canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };
}

var g_modelMatrix = new Matrix4();
var g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle) {
  // Caliculate The model view projection matrix and pass it to u_MvpMatrix
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube

  //head
  temp = new Matrix4();
  temp = g_MvpMatrix;
  temp.translate(0.0, 0.5, 0.5);
  temp.scale(0.5, 0.5, 0.5);
  temp.rotate(g_headrotate, 0, 0, 1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temp.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  //horn
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(0, 0.7, 0.95);
  temps.scale(0.1, 0.1, 0.2);
  temp.rotate(g_headrotate, 0, 0, 1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  //eyes
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(0.1, 0.55, 0.8);
  temps.scale(0.1, 0.1, 0.05);
  temp.rotate(g_headrotate, 0, 0, 1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(-0.1, 0.55, 0.8);
  temps.scale(0.1, 0.1, 0.05);
  temp.rotate(g_headrotate, 0, 0, 1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  //mouth
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(0, 0.4, 0.8);
  temps.scale(0.2, 0.05, 0.05);
  temp.rotate(g_headrotate, 0, 0, 1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  
  //upper leg
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(0.4, -0.6, 0.4);
  temps.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(-0.4, -0.6, 0.4);
  temps.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(0.4, -0.6, -0.8);
  temps.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(-0.4, -0.6, -0.8);
  temps.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  //lower leg
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(0.4, -0.7, 0.4);
  temps.scale(0.1, 1, 0.1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(-0.4, -0.7, 0.4);
  temps.scale(0.1, 1, 0.1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(0.4, -0.7, -0.8);
  temps.scale(0.1, 1, 0.1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(-0.4, -0.7, -0.8);
  temps.scale(0.1, 1, 0.1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  //tail
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  temps = new Matrix4();
  temps = g_MvpMatrix;
  temps.translate(0, 0, -1.0);
  temps.scale(0.2, 0.2, 0.1);
  gl.uniformMatrix4fv(u_MvpMatrix, false, temps.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  g_headrotate = (g_headrotate + 10) % 360;

}

