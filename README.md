# 🚢 Vimlantis

> Transform your Neovim project into an explorable 3D ocean world

Vimlantis is a Neovim plugin inspired by [Gitlantis](https://github.com/liltrendi/gitlantis) that transforms your codebase into an immersive 3D ocean environment. Navigate your files and folders by sailing a boat through a virtual sea!

## 🌊 Features

- 🚤 **Real-Time 3D Exploration** - Control a boat that sails across your project's sea
- 🗼 **Folders as Tall Lighthouses** - Each folder appears as an interactive lighthouse
- 🛟 **Files as Short Buoys** - Files appear as buoys you can click to open in Neovim
- 🗺️ **Immersive Minimap** - Overhead view relative to your boat position
- 🧭 **Comprehensive Compass** - Dynamic compass for navigation
- 🧵 **Breadcrumb Trails** - Never get lost with visual breadcrumbs
- ⚙️ **Configurable Settings** - Customize your experience via Lua config

## 🚀 Installation

### Using [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
  'vimlantis',
  dir = '/path/to/vimlantis',
  config = function()
    require('vimlantis').setup({
      -- Optional configuration
      port = 3000,
      auto_open_browser = true,
      minimap_size = 'medium',
      show_breadcrumbs = true,
    })
  end,
  keys = {
    { '<leader>vl', '<cmd>Vimlantis<cr>', desc = 'Open Vimlantis' },
  },
}
```

### Using [packer.nvim](https://github.com/wbthomason/packer.nvim)

```lua
use {
  'vimlantis',
  config = function()
    require('vimlantis').setup()
  end
}
```

## 🏃 Usage

1. Open Neovim in your project directory
2. Run `:Vimlantis` or press `<leader>vl`
3. A browser window will open with your 3D ocean world
4. Use WASD or arrow keys to navigate your boat
5. Click on buoys (files) or lighthouses (folders) to interact

### Keybindings

**In the 3D World:**
- `W/↑` - Move forward
- `S/↓` - Move backward
- `A/←` - Turn left
- `D/→` - Turn right
- `ESC` - Go back to parent directory
- `Click` - Open file/folder

**In Neovim:**
- `:Vimlantis` - Open Vimlantis
- `:VimlantisClose` - Close Vimlantis
- `:VimlantisToggle` - Toggle Vimlantis

## ⚙️ Configuration

```lua
require('vimlantis').setup({
  -- Server port (default: 3000)
  port = 3000,
  
  -- Auto-open browser when starting (default: true)
  auto_open_browser = true,
  
  -- Minimap size: 'small', 'medium', 'large' (default: 'medium')
  minimap_size = 'medium',
  
  -- Show breadcrumbs (default: true)
  show_breadcrumbs = true,
  
  -- Show compass (default: true)
  show_compass = true,
  
  -- Show minimap (default: true)
  show_minimap = true,
  
  -- Ocean color theme: 'blue', 'teal', 'purple', 'sunset' (default: 'blue')
  ocean_theme = 'blue',
  
  -- Boat speed multiplier (default: 1.0)
  boat_speed = 1.0,
})
```

## 🛠️ Technical Architecture

Vimlantis consists of two main components:

1. **Neovim Plugin (Lua)** - Handles file system scanning, RPC communication, and Neovim integration
2. **Web UI (Three.js)** - Renders the 3D ocean world and handles user interaction

Communication between components happens via HTTP/WebSocket for real-time updates.

## 📦 Requirements

- Neovim >= 0.8.0
- Node.js >= 16.0.0 (for the web server)
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🎗️ Support

If you find Vimlantis useful, consider:
- ⭐ Starring this repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing code

## 👨🏻‍💻 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

Vimlantis is inspired by [Gitlantis](https://github.com/liltrendi/gitlantis) by [Brian Njogu](https://brayo.co). 
Thank you Brian and Ayla Croft for the amazing idea! 🌊

## 🗺️ Roadmap

- [ ] Core 3D ocean rendering
- [ ] File/folder navigation
- [ ] Neovim integration
- [ ] Minimap, compass, breadcrumbs
- [ ] Configuration system
- [ ] Git integration (show git status on buoys/lighthouses)
- [ ] Search functionality
- [ ] Multiple ocean themes
- [ ] Performance optimizations
- [ ] Plugin manager integration
