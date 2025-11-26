// Shader Loader Utility
// Loads and compiles GLSL shaders

class ShaderLoader {
    static async loadShader(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load shader: ${url}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Shader loading error:', error);
            return null;
        }
    }

    static async loadOceanShaders() {
        const [vertexShader, fragmentShader] = await Promise.all([
            this.loadShader('shaders/ocean-vertex.glsl'),
            this.loadShader('shaders/ocean-fragment.glsl')
        ]);

        if (!vertexShader || !fragmentShader) {
            console.warn('Failed to load ocean shaders, using fallback');
            return null;
        }

        return {
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0.0 },
                uWaveStrength: { value: 0.8 },
                uWaveFrequency: { value: 0.15 },
                uWaterColorDeep: { value: new THREE.Color(0x1a5f8a) },
                uWaterColorShallow: { value: new THREE.Color(0x4db8e8) },
                uFoamColor: { value: new THREE.Color(0xffffff) },
                uSunDirection: { value: new THREE.Vector3(0.5, 1.0, 0.5).normalize() },
                uFoamThreshold: { value: 0.65 },
                uShininess: { value: 25.0 }
            }
        };
    }
}
