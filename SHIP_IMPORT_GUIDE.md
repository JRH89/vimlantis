# 🏴‍☠️ Importing Your Pirate Ship from Blender

## Step 1: Export from Blender

1. **Create your awesome pirate ship in Blender**
   - Make it as detailed as you want!
   - Recommended size: ~5-10 units long (Blender units)
   - Origin point should be at the center-bottom of the ship

2. **Export as GLB/GLTF:**
   - File → Export → glTF 2.0 (.glb/.gltf)
   - **Settings:**
     - Format: `glTF Binary (.glb)` (recommended) or `glTF Separate (.gltf)`
     - Include: Selected Objects (or Visible Objects)
     - Transform: `+Y Up` (important!)
     - Geometry:
       - ✅ Apply Modifiers
       - ✅ UVs
       - ✅ Normals
       - ✅ Tangents (if using normal maps)
     - Materials: Export
     - Compression: Draco (optional, for smaller file size)

3. **Save the file:**
   - Save as: `pirate-ship.glb`
   - Location: `vimlantis/public/models/pirate-ship.glb`

## Step 2: Model Loader Code (I'll add this)

I'll create a `ModelLoader` class that loads your ship and replaces the current simple boat.

## Step 3: Integration

Once you have the `.glb` file, just drop it in `public/models/` and I'll:
- Load it with THREE.GLTFLoader
- Scale it appropriately
- Add it to the scene
- Make it sail smoothly
- Handle animations if your model has any!

## Tips for Your Ship Model

### Recommended Features:
- **Hull** - Main body of the ship
- **Sails** - Can be separate objects for animation
- **Mast(s)** - Vertical poles
- **Rigging** - Ropes (optional but cool)
- **Deck details** - Cannons, wheel, barrels, etc.
- **Flag** - Pirate flag! 🏴‍☠️

### Materials:
- Use PBR materials (Principled BSDF in Blender)
- Textures are supported (diffuse, normal, roughness, metallic)
- Keep textures reasonable size (2K max recommended)

### Performance:
- Aim for < 50K triangles for good performance
- Use texture atlases if possible
- Combine meshes where appropriate

### Pivot Point:
- Set origin to center-bottom of ship
- This makes positioning easier
- Ship will sit at water level automatically

## What I'm Handling (Ocean Shaders)

I've already created:
- ✅ **Realistic water shaders** with:
  - Wave displacement using simplex noise
  - Fresnel reflections (water shimmer)
  - Foam on wave peaks
  - Depth-based coloring
  - Sun specular highlights
  - Animated normals for dynamic lighting

The ocean will look AMAZING! 🌊✨

## File Structure

```
vimlantis/
├── public/
│   ├── models/
│   │   └── pirate-ship.glb     ← Your ship goes here!
│   ├── shaders/
│   │   ├── ocean-vertex.glsl   ← Ocean vertex shader (done!)
│   │   └── ocean-fragment.glsl ← Ocean fragment shader (done!)
│   ├── shader-loader.js        ← Shader loader (done!)
│   ├── model-loader.js         ← Model loader (I'll create this)
│   └── app.js                  ← Main app (will integrate ship)
```

## Next Steps

1. **You:** Create the pirate ship in Blender
2. **You:** Export as `pirate-ship.glb`
3. **You:** Drop it in `public/models/`
4. **Me:** Create the model loader
5. **Me:** Integrate it into the scene
6. **Us:** Admire the epic result! 🚢🌊

---

## Questions?

- **Can I use multiple models?** Yes! We can have different ship types
- **Animations?** Absolutely! Blender animations will work
- **Textures?** Yes, all PBR textures supported
- **How big?** Aim for 5-10 Blender units, I'll scale it in code
- **Materials?** Use Principled BSDF, it converts perfectly to Three.js

Let me know when you have the model ready! 🎨
