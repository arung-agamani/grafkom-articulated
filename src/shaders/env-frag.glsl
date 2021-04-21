precision highp float;

varying vec3 v_world;
uniform vec4 u_fragColor;
uniform vec3 u_camPos;

uniform samplerCube u_texture;

void main() {
    vec3 worldNormal = normalize(v_world);
    vec3 eyeSurface = normalize(v_world - u_camPos);
    vec3 dir = reflect(eyeSurface, worldNormal);
    gl_FragColor = textureCube(u_texture, dir);
}