// PointLightedCube.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' + // Defined constant in main()
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' + // Model matrix
  'uniform mat4 u_NormalMatrix;\n' + // Transformation matrix of the normal
  'uniform vec3 u_LightColor;\n' + // Light color
  'uniform vec3 u_LightPosition;\n' + // Position of the light source
  'uniform vec3 u_AmbientLight;\n' + // Ambient light color
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'void main() {\n' +
  '  vec4 color = vec4(0.0, 1.0, 1.0, 1.0);\n' + // Sphere color
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  // Calculate world coordinate of vertex
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
  // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
  // The dot product of the light direction and the normal
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' +
  // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * color.rgb;\n' +
  // Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = vec4(diffuse + ambient, color.a);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'uniform int u_normalViz;\n' +
  'void main() {\n' +

  '  int normalViz = u_normalViz;\n' +
  '  if ( normalViz == 1 )\n' +
  '  {\n' +
  '    gl_FragColor = vec4(v_Normal, 1);\n' +
  '  }\n' +
  '  else\n' +
  '  {\n' +
  '    gl_FragColor = v_Color;\n' +
  '  }\n' +

  //'  gl_FragColor = v_Color;\n' +
  '}\n';

var i = 1;
var z = 7;
var x = 5;
var y = 8;
var flagUp = 0;
var g_headrotate = 0.0;
var norm = 0;

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

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_getNormalViz = gl.getUniformLocation(gl.program, 'u_normalViz');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
    console.log('Failed to get the storage location');
    return;
  }

  gl.uniform1i(u_getNormalViz, 0);
  // Set the light color (white)
  gl.uniform3f(u_LightColor, i, i, i);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, 0.0, 8.0, 7.0);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  document.getElementById('normal').onclick = function() {
    getNormalFlag(gl, u_getNormalViz)
  };

  document.getElementById('light').onclick = function() {
    changeLight(gl, u_LightColor)
  };

  var modelMatrix = new Matrix4(); // Model matrix
  var mvpMatrix = new Matrix4(); // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Calculate the view projection matrix
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  var tick = function() { // Start drawing
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var n = initVertexBuffers(gl);

    // Draw the left sphere(Note that the 3rd argument is the gl.UNSIGNED_SHORT)
    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.translate(-2.5, 2, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

    //right sphere
    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.translate(2.5, 2, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

    var c = initVertexBufferCube(gl);

    //cube
    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.scale(0.35, 0.35, 0.35);
    g_MvpMatrix.translate(0, 5, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, c, gl.UNSIGNED_BYTE, 0);

    //body
    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.scale(0.35, 0.35, 0.6);
    g_MvpMatrix.translate(0, -2, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, c, gl.UNSIGNED_BYTE, 0);

    //head
    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.scale(0.15, 0.15, 0.15);
    g_MvpMatrix.translate(0, -2, 10);
    g_MvpMatrix.rotate(g_headrotate, 0, 0, 1);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, c, gl.UNSIGNED_BYTE, 0);

    //legs
    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.scale(0.1, 0.2, 0.1);
    g_MvpMatrix.translate(5, -8.5, 10);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, c, gl.UNSIGNED_BYTE, 0);

    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.scale(0.1, 0.2, 0.1);
    g_MvpMatrix.translate(-5, -8.5, 10);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, c, gl.UNSIGNED_BYTE, 0);

    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.scale(0.1, 0.2, 0.1);
    g_MvpMatrix.translate(5, -8.5, -10);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, c, gl.UNSIGNED_BYTE, 0);

    var g_MvpMatrix = new Matrix4();
    g_MvpMatrix.set(mvpMatrix);
    g_MvpMatrix.scale(0.1, 0.2, 0.1);
    g_MvpMatrix.translate(-5, -8.5, -10);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, c, gl.UNSIGNED_BYTE, 0);

    g_headrotate = (g_headrotate + 10) % 360;

    gl.uniform3f(u_LightPosition, x, y, z);
    if (flagUp == 0) {
      rightDown(x, y);
      if (x >= 35 && y <= -50) {
        flagUp = 1;
      }
    }
    if (flagUp == 1) {
      leftUp(x, y);
      if (x <= 5 && y >= 8) {
        flagUp = 0;
      }
    }

    requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl) { // Create a sphere
  var SPHERE_DIV = 13;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var indices = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj); // X
      positions.push(cj); // Y
      positions.push(ci * sj); // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

function initVertexBufferCube(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // Coordinates
  var vertices = new Float32Array([
    2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, 2.0, // v0-v1-v2-v3 front
    2.0, 2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, // v0-v3-v4-v5 right
    2.0, 2.0, 2.0, 2.0, 2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 2.0, 2.0, -2.0, 2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, // v1-v6-v7-v2 left
    -2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, -2.0, 2.0, -2.0, -2.0, 2.0, // v7-v4-v3-v2 down
    2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, -2.0, 2.0, 2.0, -2.0 // v4-v7-v6-v5 back
  ]);

  // Colors
  var colors = new Float32Array([
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v1-v2-v3 front
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v5-v6-v1 up
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v1-v6-v7-v2 left
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v7-v4-v3-v2 down
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0 // v4-v7-v6-v5 back
  ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // right
    8, 9, 10, 8, 10, 11, // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23 // back
  ]);

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBufferCube(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  //if (!initArrayBufferCube(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  if (!initArrayBufferCube(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBufferCube(gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function changeLight(gl, temp) {
  if (i == 1) {
    gl.uniform3f(temp, 0, 0, 0);
    i = 0;
  } else {
    gl.uniform3f(temp, 1, 1, 1);
    i = 1;
  }
}

function getNormalFlag(gl, u_getNormalViz) {
  norm = ((norm == 0) ? 1 : 0);
  gl.uniform1i(u_getNormalViz, norm);
}

function rightDown() {
  if (x > 0 && x <= 35) {
    x += 0.2;
  }
  if (x >= 35 && y >= -50) {
    y -= 0.2;
  }
  return;
}

function leftUp() {
  if (x >= 5 && y <= -50) {
    x -= 0.2;
  }
  if (x <= 5 && y <= 8) {
    y += 0.2;
  }
}