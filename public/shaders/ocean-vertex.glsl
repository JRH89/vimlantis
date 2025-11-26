precision highp float;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vWaveHeight;

uniform float uTime;
uniform float uWaveStrength;
uniform float uWaveFrequency;

// Improved wave function with multiple octaves for natural look
float wave(vec2 position, float time) {
    float w = 0.0;
    
    // Large waves
    w += sin(position.x * 0.05 + time * 0.3) * 0.5;
    w += sin(position.y * 0.04 + time * 0.25) * 0.4;
    
    // Medium waves
    w += sin(position.x * 0.15 + position.y * 0.1 + time * 0.5) * 0.3;
    w += cos(position.x * 0.12 - position.y * 0.13 + time * 0.4) * 0.25;
    
    // Small ripples
    w += sin(position.x * 0.3 + position.y * 0.25 + time * 0.8) * 0.15;
    w += cos(position.x * 0.35 - position.y * 0.3 + time * 0.9) * 0.1;
    
    // Tiny details
    w += sin(position.x * 0.6 + position.y * 0.5 + time * 1.2) * 0.05;
    
    return w;
}

// Calculate normal from wave displacement
vec3 calculateNormal(vec2 position, float time, float delta) {
    float h = wave(position, time);
    float hx = wave(position + vec2(delta, 0.0), time);
    float hy = wave(position + vec2(0.0, delta), time);
    
    vec3 tangentX = normalize(vec3(delta, (hx - h) * uWaveStrength, 0.0));
    vec3 tangentY = normalize(vec3(0.0, (hy - h) * uWaveStrength, delta));
    
    return normalize(cross(tangentY, tangentX));
}

void main() {
    vUv = uv;
    
    // Calculate wave displacement
    vec2 pos = position.xy * uWaveFrequency;
    float waveValue = wave(pos, uTime);
    float displacement = waveValue * uWaveStrength;
    
    // Store normalized wave height for fragment shader (for foam and color variation)
    vWaveHeight = waveValue; // Keep raw wave value (-1 to 1 range)
    
    // Apply displacement
    vec3 newPosition = position;
    newPosition.z += displacement;
    
    // Calculate proper normal
    vNormal = calculateNormal(pos, uTime, 0.1);
    
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
