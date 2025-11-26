// Ocean Fragment Shader
// Realistic water with reflections, foam, and depth

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vElevation;

uniform float uTime;
uniform vec3 uWaterColorDeep;
uniform vec3 uWaterColorShallow;
uniform vec3 uFoamColor;
uniform vec3 uSunDirection;
uniform float uFoamThreshold;
uniform float uShininess;

void main() {
    // Normalize the normal
    vec3 normal = normalize(vNormal);
    
    // View direction (camera to fragment)
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    
    // Fresnel effect - water is more reflective at glancing angles
    float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 3.0);
    
    // Water depth simulation (based on elevation)
    float depth = 1.0 - clamp(vElevation * 0.5 + 0.5, 0.0, 1.0);
    
    // Mix deep and shallow water colors based on depth
    vec3 waterColor = mix(uWaterColorShallow, uWaterColorDeep, depth);
    
    // Add fresnel reflection (lighter at edges)
    vec3 skyColor = vec3(0.7, 0.85, 1.0); // Light blue sky reflection
    waterColor = mix(waterColor, skyColor, fresnel * 0.6);
    
    // Foam on wave peaks
    float foam = smoothstep(uFoamThreshold - 0.1, uFoamThreshold + 0.1, vElevation);
    waterColor = mix(waterColor, uFoamColor, foam * 0.8);
    
    // Sun specular highlights
    vec3 sunReflection = reflect(-uSunDirection, normal);
    float sunSpec = pow(max(dot(viewDirection, sunReflection), 0.0), uShininess);
    vec3 specular = vec3(1.0, 0.95, 0.8) * sunSpec;
    
    // Combine everything
    vec3 finalColor = waterColor + specular * 0.5;
    
    // Add slight transparency based on depth
    float alpha = 0.85 + depth * 0.15;
    
    gl_FragColor = vec4(finalColor, alpha);
}
