precision highp float;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vWaveHeight;

uniform float uTime;
uniform vec3 uWaterColorDeep;
uniform vec3 uWaterColorShallow;
uniform vec3 uFoamColor;
uniform vec3 uSunDirection;
uniform float uFoamThreshold;
uniform float uShininess;

void main() {
    // Normalize the interpolated normal
    vec3 normal = normalize(vNormal);
    
    // View direction (camera to fragment)
    vec3 viewDir = normalize(cameraPosition - vPosition);
    
    // Start with base ocean color - mix between deep and shallow based on wave height
    float heightFactor = clamp((vWaveHeight + 1.5) / 3.0, 0.0, 1.0);
    vec3 baseColor = mix(uWaterColorDeep, uWaterColorShallow, heightFactor);
    
    // Add basic lighting
    float diffuse = max(dot(normal, normalize(uSunDirection)), 0.2);
    vec3 litColor = baseColor * diffuse;
    
    // Add subtle specular
    vec3 halfDir = normalize(normalize(uSunDirection) + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), uShininess);
    litColor += vec3(0.9, 0.95, 1.0) * specular * 0.3;
    
    // Only add foam on the very highest peaks
    float foamAmount = smoothstep(0.9, 1.2, vWaveHeight);
    litColor = mix(litColor, uFoamColor, foamAmount * 0.5);
    
    gl_FragColor = vec4(litColor, 0.95);
}
