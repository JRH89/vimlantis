# Installation Fix Summary

## Problems Identified

1. **No automated installation process** - Users had to manually figure out where to put files
2. **Files scattered in home directory** - No clear installation location
3. **Command not working from project directories** - Plugin wasn't properly installed in Neovim's runtime path

## Solution Implemented

Created `install.sh` - a comprehensive installation script that:

### ✅ Fixes the Installation Issues

1. **Proper Plugin Installation**
   - Option 1: Manual setup with clear instructions
   - Option 2: Automatic installation to `~/.config/nvim/pack/plugins/start/vimlantis`
   - Option 3: Standalone use only

2. **Global Command (Optional)**
   - Creates a `vimlantis` command in `~/.local/bin/` (or `~/bin/`)
   - Works from any directory
   - Properly passes the current working directory to the server

3. **Prerequisite Checking**
   - Verifies Node.js is installed (v16+)
   - Checks for Neovim installation
   - Provides helpful error messages

4. **Clean Installation**
   - All files stay in the project directory OR
   - Get properly copied to Neovim's plugin directory
   - No more scattered files in home directory

## How It Works

### For Neovim Plugin Use:

```bash
cd vimlantis
./install.sh
# Choose option 2 for automatic plugin installation
```

The script will:
1. Install npm dependencies in the project directory
2. Copy necessary files to `~/.config/nvim/pack/plugins/start/vimlantis/`
3. Install production dependencies there
4. Provide setup instructions

### For Global Command:

When you choose to create a global command, it creates:
```bash
~/.local/bin/vimlantis
```

This script:
- Changes to the vimlantis project directory
- Runs the server with the current working directory
- Works from any project folder

### For Standalone Use:

```bash
cd vimlantis
./install.sh
# Choose option 3
npm run dev
```

## Updated Documentation

Updated the following files to reference the new installation script:
- `README.md` - Added automated installation as the recommended method
- `QUICKSTART.md` - Updated to use `./install.sh` first

## Usage After Installation

### Option 1: From Neovim
```vim
:Vimlantis
```

### Option 2: Global Command
```bash
cd /any/project
vimlantis
```

### Option 3: Standalone
```bash
cd /path/to/vimlantis
npm run dev
```

## Benefits

✅ No more files scattered in home directory  
✅ Clear installation options  
✅ Works from any project directory (with global command)  
✅ Proper Neovim plugin integration  
✅ Helpful error messages and guidance  
✅ Respects XDG standards (`$XDG_CONFIG_HOME`)
