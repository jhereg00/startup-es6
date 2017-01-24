// our standard 3d fragment shader for building the g-buffer
precision mediump float;

varying float vDepth;

void main () {
  // depth
  gl_FragColor = vec4(vec3(vDepth), 1.0);
}
