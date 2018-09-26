precision mediump float;  

attribute vec3 a_position;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewProjection;

#ifdef HAS_SKELETON_ANIMATION
    #include<skeleton_declare.vertex>
#endif

#ifdef HAS_PARTICLE_ANIMATOR
    #include<particle_declare.vertex>
#endif

varying vec3 v_worldPosition;

void main() 
{
    vec4 position = vec4(a_position, 1.0);
    #ifdef HAS_SKELETON_ANIMATION
        position = skeletonAnimation(position);
    #endif

    #ifdef HAS_PARTICLE_ANIMATOR
        position = particleAnimation(position);
    #endif

    vec4 worldPosition = u_modelMatrix * position;
    gl_Position = u_viewProjection * worldPosition;
    v_worldPosition = worldPosition.xyz;
}