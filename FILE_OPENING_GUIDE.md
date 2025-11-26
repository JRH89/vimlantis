# 🎯 File Opening in Vimlantis

## Overview

Vimlantis now supports **intelligent file opening** that integrates with your IDE! When you click on a barrel (file) or lighthouse (folder) in the 3D ocean world, it opens directly in your editor.

## How It Works

### From Neovim (RPC Integration)

When you launch Vimlantis from within Neovim using `:Vimlantis`:

1. **Neovim passes its server address** to the Node.js backend via `--nvim-server` parameter
2. **Files clicked in the browser** send a request to the backend
3. **Backend uses Neovim RPC** to open the file in the **same Neovim instance**
4. **No new windows** - everything opens in your existing session!

**Commands used:**
- Files: `nvim --server <address> --remote "/path/to/file"`
- Folders: `nvim --server <address> --remote-send "<Esc>:cd /path<CR>:Explore<CR>"`

### From Terminal (Editor Detection)

When you run `vimlantis` from the command line:

1. **Auto-detects available editors** in this order:
   - nvim
   - vim
   - code (VS Code)
   - subl (Sublime Text)
   - atom

2. **Opens files** in the detected editor
3. **Falls back to system default** if no editor is found

## Configuration

### Environment Variables

```bash
# Set your preferred editor
export VIMLANTIS_EDITOR=code

# Or use the standard EDITOR variable
export EDITOR=nvim
```

### Command Line

```bash
# Specify editor when running
vimlantis --editor code

# Or use environment variable
VIMLANTIS_EDITOR=vim vimlantis
```

### From Neovim

No configuration needed! It automatically uses RPC when launched from Neovim.

## Examples

### VS Code Users

```bash
# Terminal
cd ~/my-project
VIMLANTIS_EDITOR=code vimlantis

# Now clicking files opens them in VS Code
# Clicking folders opens the folder in VS Code
```

### Neovim Users

```vim
" In Neovim
:Vimlantis

" Click any file in the 3D world
" → Opens in the same Neovim instance!
```

### Mixed Workflow

```bash
# Use different editors for different projects
cd ~/web-project
VIMLANTIS_EDITOR=code vimlantis

cd ~/vim-config
nvim  # Then :Vimlantis inside
```

## Folder Handling

### Neovim
- Changes directory: `:cd /path/to/folder`
- Opens file explorer: `:Explore`

### VS Code
- Opens folder in new/existing window: `code "/path/to/folder"`

### Other Editors
- Opens system file explorer at that location

## Troubleshooting

### Files don't open in Neovim

**Check if server name is available:**
```vim
:echo v:servername
```

If empty, start Neovim with a server name:
```bash
nvim --listen /tmp/nvim-server
```

### Wrong editor opens

**Set explicit editor:**
```bash
export VIMLANTIS_EDITOR=nvim
vimlantis
```

### Permission errors

**Check file permissions:**
```bash
ls -la /path/to/file
```

## Technical Details

### Server Arguments

```bash
node server/index.js \
  --port 3000 \
  --cwd /path/to/project \
  --nvim-server /tmp/nvim-server \  # Optional: for Neovim RPC
  --editor code \                    # Optional: force specific editor
  --open                             # Optional: auto-open browser
```

### API Endpoint

**POST /api/open**

Request:
```json
{
  "path": "src/main.js",
  "type": "file"
}
```

Response:
```json
{
  "success": true,
  "editor": "nvim"
}
```

### Editor Detection Logic

1. Check if `--nvim-server` was passed → Use Neovim RPC
2. Check `--editor` argument → Use specified editor
3. Check `VIMLANTIS_EDITOR` env var → Use that editor
4. Check `EDITOR` env var → Use that editor
5. Auto-detect available editors → Use first found
6. Fall back to system default → `open`/`start`/`xdg-open`

## Future Enhancements

- [ ] Support for more editors (Emacs, IntelliJ, etc.)
- [ ] Line number support (open file at specific line)
- [ ] Preview pane in the 3D world
- [ ] Recent files history
- [ ] Bookmarks/favorites

---

**Questions?** Open an issue on GitHub!
