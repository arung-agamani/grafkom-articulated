#version 300 es
precision mediump float;

in vec2 v_texcoord;
in vec3 v_worldPosition;
in vec3 v_worldNormal;

uniform int mode;
uniform vec3 u_light_pos;
uniform sampler2D u_diffuse;
uniform sampler2D u_normal_map;
uniform sampler2D u_texture;

out vec4 outColor;

void main() {
    if(mode == 1){
        outColor = texture(u_texture, v_texcoord);
    }

    if(mode == 2){
        vec3 N = normalize(v_worldNormal);
        vec3 dp1 = dFdx(v_worldPosition);
        vec3 dp2 = dFdy(v_worldPosition);
        vec2 duv1 = dFdx(v_texcoord);
        vec2 duv2 = dFdy(v_texcoord);
        vec3 dp2perp = cross(dp2, N);
        vec3 dp1perp = cross(N, dp1);
        vec3  T       = dp2perp * duv1.x + dp1perp * duv2.x;
        vec3  B       = dp2perp * duv1.y + dp1perp * duv2.y;
        float invmax  = inversesqrt(max(dot(T, T), dot(B, B)));
        mat3  tm      = mat3(T * invmax, B * invmax, N);
        mat3  tbn_inv = mat3(vec3(tm[0].x, tm[1].x, tm[2].x), vec3(tm[0].y, tm[1].y, tm[2].y), vec3(tm[0].z, tm[1].z, tm[2].z));
        /*vec3 L = tbn_inv * normalize(u_light_pos - v_worldPosition);*/
        vec3 L = tbn_inv * normalize(vec3(0,0,0) - v_worldPosition);
        
        vec3 mapN = normalize(texture(u_normal_map, v_texcoord.st).xyz * 2.0 - 1.0);
        float kd = max(0.0, dot(mapN, L));

        vec3 color = texture(u_diffuse, v_texcoord.st).rgb;
        vec3 light_col = (0.0 + kd) * texture(u_texture, v_texcoord).xyz;
        outColor = vec4(clamp(light_col, 0.0, 1.0), 1.0);
    }
}