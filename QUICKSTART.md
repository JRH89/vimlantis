# 🚢 Vimlantis Quick Start Guide

## Installation (2 minutes)

1. **Install dependencies:**
   ```bash
   cd vimlantis
   npm install
   ```

2. **Test standalone (without Neovim):**
   ```bash
   npm run dev
   # Open http://localhost:3000 in browser
   ```

3. **Add to Neovim (lazy.nvim):**
   ```lua
   {
     'vimlantis',
     dir = 'c:/Users/Jared/Desktop/vimlantis',
     config = function()
       require('vimlantis').setup()
     end,
     keys = {
       { '<leader>vl', '<cmd>Vimlantis<cr>', desc = 'Open Vimlantis' },
     },
   }
   ```

## Usage

### From Neovim
```vim
:Vimlantis        " Open Vimlantis
:VimlantisClose   " Close server
:VimlantisToggle  " Toggle on/off
```

### Controls
```
W/↑  - Forward
S/↓  - Backward  
A/←  - Turn Left
D/→  - Turn Right
ESC  - Go Back
Click - Open File/Folder
```

## Configuration

```lua
require('vimlantis').setup({
  port = 3000,              -- Change port
  auto_open_browser = true, -- Auto-open browser
  ocean_theme = 'blue',     -- 'blue', 'teal', 'purple', 'sunset'
  boat_speed = 1.0,         -- Speed multiplier
})
```

## Troubleshooting

**Server won't start:**
- Check Node.js is installed: `node --version`
- Check port 3000 is available
- Look for errors in `:messages`

**Browser doesn't open:**
- Manually open http://localhost:3000
- Check firewall settings

**3D world is black:**
- Check browser console for errors
- Try a different browser (Chrome recommended)
- Check WebGL support: https://get.webgl.org/

**Files don't open in Neovim:**
- This feature needs Neovim RPC integration (coming soon)
- Currently logs to browser console

## File Structure

```
vimlantis/
├── lua/vimlantis/init.lua    # Neovim plugin
├── server/index.js           # Web server
├── public/                   # Web UI
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── package.json
```

## Development

**Start server manually:**
```bash
node server/index.js --port 3000 --cwd /path/to/project
```

**Edit and reload:**
1. Make changes to files
2. Refresh browser (Ctrl+R)
3. For Neovim changes: `:Vimlantis` again

## Tips

- Use `⚙️` button in UI for settings
- Press `❓` to toggle help panel
- Hover over objects to see info
- Use breadcrumbs to jump to parent folders
- Compass shows your direction
- Minimap shows overhead view

## Next Steps

1. Try different ocean themes in settings
2. Adjust boat speed for your preference
3. Explore your codebase in 3D!
4. Star the repo if you like it ⭐

---

**Need help?** Open an issue on GitHub
**Want to contribute?** See CONTRIBUTING.md
