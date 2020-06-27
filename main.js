  'use strict';

  const vxShaderStr = `#version 300 es
in vec3 aVertexPosition;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
void main(void)
{
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`;

  const fsShaderStr = `#version 300 es
precision highp float;
uniform float uSpeed;
uniform float uSize;
uniform float uTime;
out vec4 oColor;
float Julia( vec2 C, vec2 Z )
{
  vec2 C0 = C;
  float n = 0.0;
  float C1 = 0.0;
  for(float j = 0.0; j < 255.0; j++)
  {
    C0 = vec2(C0.x * C0.x - C0.y * C0.y, C0.y * C0.x + C0.x * C0.y) + Z;
    C1 = C0.x * C0.x + C0.y * C0.y;
    if (C1 >= 16.0)
    {
      n = j;
      break;
    }
  }
  return n;
}
void main(void)
{
  float c;
  float s = 2.8;
  vec2 A = vec2(0.35, 0.39);
  vec2 B;
  A.x = 0.5 + (0.5) * sin(uSpeed * uTime / 8.0);
  A.y = 1.0 + (uSize) * sin(uSpeed * uTime / 8.0);
  B.x = ((gl_FragCoord.x) / 120.0 - 2.0);
  B.y = ((gl_FragCoord.y) / 120.0 - 2.0);
  c = Julia(B, A);
  oColor = vec4(c * 30.0 / 255.0, c * 0.01 / 153.0, c * 20.0 / 152.0, 1.0);
}
`;

  var gl;

  function initGL(canvas) {
      try {
          gl = canvas.getContext('webgl2');
          gl.viewportWidth = canvas.width;
          gl.viewportHeight = canvas.height;
      } catch (e) {}
      if (!gl) {
          alert('Could not initialize WebGL');
      }
  }

  function getShader(gl, type, str) {
      var shader;
      shader = gl.createShader(type);

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }

      return shader;
  }

  var shaderProgram;

  function initShaders() {
      var fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fsShaderStr);
      var vertexShader = getShader(gl, gl.VERTEX_SHADER, vxShaderStr);

      shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert('Could not initialize shaders');
      }

      gl.useProgram(shaderProgram);

      shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
      gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

      shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
      shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
      shaderProgram.uSpeed = gl.getUniformLocation(shaderProgram, 'uSpeed');
      shaderProgram.uSize = gl.getUniformLocation(shaderProgram, 'uSize');
      shaderProgram.uTime = gl.getUniformLocation(shaderProgram, 'uTime');
  }

  var mvMatrix = mat4.create();
  var pMatrix = mat4.create();
  var fractalSpeed = 30.0;
  var fractalSize = 0.8;
  var timeMs = Date.now();
  var startTime = Date.now();

  function setUniforms() {
      gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
      gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
      gl.uniform1f(shaderProgram.uSpeed, fractalSpeed);
      gl.uniform1f(shaderProgram.uSize, fractalSize);
      gl.uniform1f(shaderProgram.uTime, timeMs);
  }

  var squareVertexPositionBuffer;

  function initBuffers() {
      squareVertexPositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
      var vertices = [
          1.0, 1.0, 0.0, -1.0, 1.0, 0.0,
          1.0, -1.0, 0.0, -1.0, -1.0, 0.0
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      squareVertexPositionBuffer.itemSize = 3;
      squareVertexPositionBuffer.numItems = 4;
  }

  function drawScene() {
      timeMs = (Date.now() - startTime) / 1000;
      gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      mat4.identity(mvMatrix);
      mat4.identity(pMatrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
      setUniforms();
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
  }

  function tick() {
      window.requestAnimationFrame(tick);
      updateSpeed();
      updateSize();
      drawScene();
  }

  function webGLStart() {
      document.getElementById('inputfractalSpeed').value = 50.0;
      document.getElementById('inputfractalSize').value = 0.5;

      var canvas = document.getElementById('webglCanvas');
      initGL(canvas);
      initShaders();
      initBuffers();

      gl.clearColor(0.5, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);

      tick();
  }

  function updateSpeed() {
      var data = document.getElementById('inputfractalSpeed').value;
      fractalSpeed = parseInt(data);
      if (isNaN(fractalSpeed)) fractalSpeed = 1;
  }

  function updateSize() {
      var data = document.getElementById('inputfractalSize').value;
      fractalSize = parseInt(data);
      if (isNaN(fractalSize)) fractalSize = 1;
  }

  function helloMessage() {
      alert('HEYA!!');
  }