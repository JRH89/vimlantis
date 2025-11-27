#!/bin/bash

# Vimlantis Installation Script
# This script installs Vimlantis as a Neovim plugin

set -e

echo "🚢 Vimlantis Installation"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Attempt to install Node.js and npm on Debian/Ubuntu if missing
echo -e "${BLUE}Checking for Node.js...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Attempting to install via apt-get (Debian/Ubuntu)...${NC}"

    if command -v apt-get &> /dev/null; then
        echo -e "${BLUE}Running: sudo apt-get update && sudo apt-get install -y nodejs npm${NC}"
        sudo apt-get update
        sudo apt-get install -y nodejs npm || {
            echo -e "${RED}Failed to install Node.js/npm via apt-get.${NC}"
            echo "Please install Node.js (v16 or higher) manually from https://nodejs.org and re-run this script."
            exit 1
        }
    else
        echo -e "${RED}apt-get not found.${NC}"
        echo "Automatic install is only supported on Debian/Ubuntu via apt-get."
        echo "Please install Node.js (v16 or higher) manually from https://nodejs.org and re-run this script."
        exit 1
    fi
else
    echo -e "${GREEN}Node.js is already installed.${NC}"
fi

create_lazy_spec_file() {
    local lazy_plugins_dir="$NVIM_CONFIG_DIR/lua/plugins"
    local lazy_file="$lazy_plugins_dir/vimlantis.lua"

    echo ""
    echo -e "${BLUE}Configuring Lazy.nvim integration...${NC}"

    read -p "Create or update Lazy.nvim spec at $lazy_file? [Y/n]: " create_lazy_spec
    if [[ "$create_lazy_spec" =~ ^[Nn]$ ]]; then
        echo -e "${YELLOW}Skipping Lazy.nvim spec creation${NC}"
        return
    fi

    if [ ! -d "$lazy_plugins_dir" ]; then
        echo "Creating $lazy_plugins_dir..."
        mkdir -p "$lazy_plugins_dir"
    fi

    if [ -f "$lazy_file" ]; then
        local backup_file="${lazy_file}.bak.$(date +%s)"
        cp "$lazy_file" "$backup_file"
        echo -e "${YELLOW}Existing vimlantis.lua backed up to $backup_file${NC}"
    fi

    local local_plugin_path="${SCRIPT_DIR/#$HOME/~}"
    local escaped_path
    escaped_path=$(printf '%s' "$local_plugin_path" | sed 's/\\/\\\\/g; s/"/\\"/g')

    cat > "$lazy_file" << EOF
return {
  {
    -- Use the local path instead of cloning from GitHub
    dir = vim.fn.expand("${escaped_path}"),
    lazy = false, -- load immediately
    config = function()
      require("vimlantis").setup({
        port = 3000,
        auto_open_browser = true,
      })
    end,
    keys = {
      { "<leader>vl", "<cmd>Vimlantis<cr>", desc = "Open Vimlantis" },
      { "<leader>vc", "<cmd>VimlantisClose<cr>", desc = "Close Vimlantis" },
    },
  },
}
EOF

    echo -e "${GREEN}✓ Lazy.nvim spec created at $lazy_file${NC}"
    echo "Run ':Lazy sync' in Neovim to ensure Vimlantis is loaded."
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed even after attempting automatic installation.${NC}"
    echo "Please install Node.js (v16 or higher) from https://nodejs.org and re-run this script."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}Error: Node.js version 16 or higher is required${NC}"
    echo "Current version: $(node --version)"
    exit 1
fi

if ! command -v nvim &> /dev/null; then
    echo -e "${YELLOW}Warning: Neovim is not installed${NC}"
    echo "You can still use Vimlantis standalone, but you'll need Neovim for plugin functionality"
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Install npm dependencies
echo -e "${BLUE}Installing npm dependencies...${NC}"
cd "$SCRIPT_DIR"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Determine Neovim config directory
if [ -n "$XDG_CONFIG_HOME" ]; then
    NVIM_CONFIG_DIR="$XDG_CONFIG_HOME/nvim"
else
    NVIM_CONFIG_DIR="$HOME/.config/nvim"
fi

# Ask about plugin installation method
echo -e "${BLUE}How would you like to install the Neovim plugin?${NC}"
echo "1) Automatic Install (Recommended - No config needed)"
echo "2) Manual Setup (I'll configure it myself)"
echo "3) Skip plugin installation (Standalone use only)"
echo ""
read -p "Enter choice [1-3]: " INSTALL_CHOICE

case $INSTALL_CHOICE in
    1)
        PLUGIN_DIR="$NVIM_CONFIG_DIR/pack/plugins/start/vimlantis"
        echo ""
        echo -e "${BLUE}Installing to: $PLUGIN_DIR${NC}"
        
        # Create plugin directory
        mkdir -p "$PLUGIN_DIR"
        
        # Copy plugin files
        echo "Copying plugin files..."
        cp -r "$SCRIPT_DIR/lua" "$PLUGIN_DIR/"
        cp -r "$SCRIPT_DIR/server" "$PLUGIN_DIR/"
        cp -r "$SCRIPT_DIR/public" "$PLUGIN_DIR/"
        cp -r "$SCRIPT_DIR/plugin" "$PLUGIN_DIR/"
        cp "$SCRIPT_DIR/package.json" "$PLUGIN_DIR/"
        cp "$SCRIPT_DIR/package-lock.json" "$PLUGIN_DIR/"
        
        # Install npm dependencies in the plugin directory
        echo "Installing dependencies in plugin directory..."
        cd "$PLUGIN_DIR"
        npm install --production
        
        echo -e "${GREEN}✓ Plugin installed to $PLUGIN_DIR${NC}"
        echo ""
        echo -e "${GREEN}The plugin will automatically load when you start Neovim!${NC}"
        echo "Just open Neovim and type: ${YELLOW}:Vimlantis${NC}"
        echo ""
        echo -e "${BLUE}Optional: Customize settings by adding this to your config:${NC}"
        echo ""
        echo -e "${YELLOW}require('vimlantis').setup({${NC}"
        echo -e "${YELLOW}  port = 3000,${NC}"
        echo -e "${YELLOW}  auto_open_browser = true,${NC}"
        echo -e "${YELLOW}}${NC}"
        echo ""

        # Offer Lazy.nvim integration
        if [ -d "$NVIM_CONFIG_DIR" ]; then
            create_lazy_spec_file
        fi
        ;;
    2)
        echo ""
        echo -e "${GREEN}Manual Setup Instructions:${NC}"
        echo ""
        echo "Add this to your Neovim config (e.g., ~/.config/nvim/init.lua):"
        echo ""
        echo -e "${YELLOW}-- Add Vimlantis to runtime path${NC}"
        echo "vim.opt.runtimepath:append('$SCRIPT_DIR')"
        echo ""
        echo -e "${YELLOW}-- Setup Vimlantis${NC}"
        echo "require('vimlantis').setup({"
        echo "  port = 3000,"
        echo "  auto_open_browser = true,"
        echo "})"
        echo ""
        echo -e "${YELLOW}-- Optional: Add keybindings${NC}"
        echo "vim.keymap.set('n', '<leader>vl', '<cmd>Vimlantis<cr>', { desc = 'Open Vimlantis' })"
        echo "vim.keymap.set('n', '<leader>vc', '<cmd>VimlantisClose<cr>', { desc = 'Close Vimlantis' })"
        echo ""
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Skipping plugin installation${NC}"
        echo "You can use Vimlantis in standalone mode with: npm run dev"
        echo ""
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Ask about creating a global command
echo ""
read -p "Create a global 'vimlantis' command? [y/N]: " CREATE_COMMAND

if [[ "$CREATE_COMMAND" =~ ^[Yy]$ ]]; then
    # Determine bin directory
    if [ -d "$HOME/.local/bin" ]; then
        BIN_DIR="$HOME/.local/bin"
    elif [ -d "$HOME/bin" ]; then
        BIN_DIR="$HOME/bin"
    else
        echo "Creating $HOME/.local/bin directory..."
        mkdir -p "$HOME/.local/bin"
        BIN_DIR="$HOME/.local/bin"
    fi
    
    COMMAND_PATH="$BIN_DIR/vimlantis"
    
    # Create the command script
    cat > "$COMMAND_PATH" << EOF
#!/bin/bash
# Vimlantis global command
# Save the current directory (where user runs the command)
CURRENT_DIR="\$(pwd)"
# Change to vimlantis directory to run the server
VIMLANTIS_DIR="$SCRIPT_DIR"
cd "\$VIMLANTIS_DIR"
# Run server with the user's current directory
node server/index.js --port 3000 --cwd "\$CURRENT_DIR" --open "\$@"
EOF
    
    chmod +x "$COMMAND_PATH"
    
    echo -e "${GREEN}✓ Created global command: $COMMAND_PATH${NC}"
    echo ""
    
    # Check if bin directory is in PATH
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        echo -e "${YELLOW}Note: $BIN_DIR is not in your PATH${NC}"
        echo "Add this to your ~/.bashrc or ~/.zshrc:"
        echo ""
        echo "export PATH=\"\$PATH:$BIN_DIR\""
        echo ""
    fi
    
    echo "You can now run 'vimlantis' from any directory to start the server"
fi

echo ""
echo -e "${GREEN}🎉 Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "  • Test standalone: cd $SCRIPT_DIR && npm run dev"
echo "  • Use in Neovim: Open nvim and run :Vimlantis"
echo "  • Read the docs: cat $SCRIPT_DIR/README.md"
echo ""
