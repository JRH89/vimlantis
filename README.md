# 🚢 Vimlantis

> Transform your Neovim project into an explorable 3D ocean world

Vimlantis is a Neovim plugin inspired by [Gitlantis](https://github.com/liltrendi/gitlantis) and Ayla Croft (@aylacroft) that transforms your codebase into an immersive 3D ocean environment. Navigate your files and folders by sailing a boat through a virtual sea!

## ⚡ TL;DR - Quick Start

```bash
# Clone and install
git clone https://github.com/jrh89/vimlantis.git
cd vimlantis
./install.sh
```

**That's it!** Type 'vimlantis' in the terminal from any project and sail the open seas.

---

## 🌊 Features

- 🚤 **Real-Time 3D Exploration** - Control a boat that sails across your project's sea
- 🗼 **Folders as Tall Lighthouses** - Each folder appears as an interactive lighthouse
- 🛟 **Files as Short Buoys** - Files appear as buoys you can click to open in Neovim
- 🗺️ **Immersive Minimap** - Overhead view relative to your boat position
- 🧭 **Comprehensive Compass** - Dynamic compass for navigation
- 🧵 **Breadcrumb Trails** - Never get lost with visual breadcrumbs
- ⚙️ **Configurable Settings** - Customize your experience via Lua config

## 🚀 Installation

### Prerequisites

You need these installed first:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org)
- **Neovim** (v0.8 or higher) - [Install guide](https://github.com/neovim/neovim/wiki/Installing-Neovim)

### Automated Installation (Recommended)

```bash
git clone https://github.com/jrh89/vimlantis.git
cd vimlantis
./install.sh
```

The installation script will:
- ✅ Check prerequisites (Node.js, Neovim)
- ✅ Install npm dependencies
- ✅ Install the plugin to Neovim (auto-loads!)
- ✅ Optionally create a global `vimlantis` command

**After installation, just open Neovim and run:**
```vim
:Vimlantis
```
(No configuration required!)

### Manual Installation

If you prefer to install manually:

**Step 1: Clone the Repository**

```bash
git clone https://github.com/jrh89/vimlantis.git
cd vimlantis
```

**Step 2: Install Dependencies**

```bash
npm install
```

That's it for the basic setup! Now choose how you want to use it:

---

### Option A: Test Without Neovim (Standalone)

Just want to see it in action first?

```bash
npm run dev
```

Then open your browser to **http://localhost:3000** and sail around! 🌊

---

### Option B: Install as Neovim Plugin

#### Using [lazy.nvim](https://github.com/folke/lazy.nvim) (Recommended)

Add this to your Neovim config (e.g., `~/.config/nvim/lua/plugins/vimlantis.lua`):

> Tip: `./install.sh` can now drop this file into `~/.config/nvim/lua/plugins/vimlantis.lua` for you during the Automatic Install flow—just accept the Lazy.nvim prompt when it appears.

```lua
return {
  {
    'jrh89/vimlantis',
    -- Or use local path during development:
    -- dir = '~/path/to/vimlantis',
    config = function()
      require('vimlantis').setup({
        port = 3000,
        auto_open_browser = true,
      })
    end,
    keys = {
      { '<leader>vl', '<cmd>Vimlantis<cr>', desc = 'Open Vimlantis' },
      { '<leader>vc', '<cmd>VimlantisClose<cr>', desc = 'Close Vimlantis' },
    },
  },
}
```

#### Using [packer.nvim](https://github.com/wbthomason/packer.nvim)

```lua
use {
  'jrh89/vimlantis',
  config = function()
    require('vimlantis').setup()
  end
}
```

#### Manual Setup (No Plugin Manager)

Add to your `init.lua`:

```lua
-- Add to runtimepath
vim.opt.runtimepath:append('~/path/to/vimlantis')

-- Setup
require('vimlantis').setup()

-- Keybindings
vim.keymap.set('n', '<leader>vl', '<cmd>Vimlantis<cr>', { desc = 'Open Vimlantis' })
```

---

## 🏃 Usage

### 1. From Neovim (Integrated)

1. Open Neovim in any project
2. Run `:Vimlantis`
3. The browser opens automatically!
4. **Click any buoy (file) or lighthouse (folder)** - it opens directly in your Neovim instance! 🎯

### 2. From Terminal (Universal / Any IDE)

You can use Vimlantis with **VS Code, Emacs, or any other editor** by running it from your terminal:

```bash
cd /path/to/your/project
vimlantis
```

This works for ANY project on your system! 🌍

**Customize your editor:**
```bash
# Use VS Code
VIMLANTIS_EDITOR=code vimlantis

# Use Vim
VIMLANTIS_EDITOR=vim vimlantis

# Use Sublime Text
VIMLANTIS_EDITOR=subl vimlantis
```

### How File Opening Works

- **From Neovim**: Files open in the **same Neovim instance** via RPC
- **From Terminal**: Files open in your preferred editor (auto-detected or configured)
- **Folders**: 
  - In Neovim: Opens `:Explore` in that directory
  - In VS Code: Opens the folder in VS Code
  - Other editors: Opens in file explorer

### Keybindings

**In the 3D World:**
- `W/↑` - Move forward
- `S/↓` - Move backward
- `A/←` - Turn left
- `D/→` - Turn right
- `ESC` - Go back to parent directory
- `Click` - Open file/folder **in your IDE**

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

- **Neovim** >= 0.8.0
- **Node.js** >= 16.0.0
- **Modern Browser** (Chrome, Firefox, Edge, Safari)
- **OS:** Linux, macOS, or Windows (WSL recommended)

## 🪟 Windows Support

Vimlantis works on Windows!

- **Via WSL (Recommended):** Follow the standard Linux installation instructions.
- **Via PowerShell/CMD:**
  1. Clone the repo
  2. Run `npm install`
  3. Manually add to your Neovim config (see Manual Installation)
  4. Use `npm run dev` for standalone mode

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

### ✅ Completed
- [x] Core 3D ocean rendering with realistic shaders
- [x] Natural scattered file/folder layout
- [x] Boat navigation with WASD controls
- [x] Neovim integration
- [x] Minimap, compass, breadcrumbs UI
- [x] Configuration system
- [x] Multiple ocean themes
- [x] Plugin manager support (lazy.nvim, packer)

### 🚧 In Progress
- [ ] Custom pirate ship model (Blender import)
- [ ] File opening in Neovim (RPC integration)
- [ ] Minimap object rendering

### 🔮 Future
- [ ] Git integration (show git status on buoys/lighthouses)
- [ ] Search functionality
- [ ] File preview on hover
- [ ] Performance optimizations for large codebases
- [ ] Telescope.nvim integration
- [ ] Multiple boat skins
- [ ] Weather effects (rain, storms)
- [ ] Day/night cycle
