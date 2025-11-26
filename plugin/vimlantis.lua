-- Vimlantis plugin entry point
-- This file is automatically loaded by Neovim when the plugin is installed
-- It sets up the plugin with default configuration

-- Only load once
if vim.g.loaded_vimlantis then
  return
end
vim.g.loaded_vimlantis = 1

-- Auto-setup with default configuration
-- Users can still override by calling require('vimlantis').setup({...}) in their config
require('vimlantis').setup()
