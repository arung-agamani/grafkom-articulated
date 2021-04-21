#version 300 es

in vec4 a_pos;
in vec3 a_normal;
in vec2 a_texcoord;

uniform mat4 u_proj_mat;
uniform mat4 u_view;
uniform mat4 u_world;
uniform vec3 u_resolution;

out vec2 v_texcoord;
out vec3 v_worldPosition;
out vec3 v_worldNormal;

void main() {
    vec3 pos = (u_world * u_view * u_proj_mat * a_pos).xyz;
    vec3 a = pos / u_resolution;
    vec3 b = a * 2.0;
    vec3 c = b - 1.0;
    gl_Position = vec4(c, 1);

    v_worldPosition = (u_proj_mat * a_pos).xyz;
    v_worldNormal = mat3(u_proj_mat) * a_normal;
    v_texcoord = a_texcoord;
}