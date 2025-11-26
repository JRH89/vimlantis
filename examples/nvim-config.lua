-- Example Neovim configuration for Vimlantis
-- Place this in your init.lua or a separate config file

-- Using lazy.nvim
return {
  {
    'vimlantis',
    dir = 'c:/Users/Jared/Desktop/vimlantis',
    config = function()
      require('vimlantis').setup({
        port = 3000,
        auto_open_browser = true,
        minimap_size = 'medium',
        show_breadcrumbs = true,
        show_compass = true,
        show_minimap = true,
        ocean_theme = 'blue',
        boat_speed = 1.0,
      })
    end,
    keys = {
      { '<leader>vl', '<cmd>Vimlantis<cr>', desc = 'Open Vimlantis' },
      { '<leader>vc', '<cmd>VimlantisClose<cr>', desc = 'Close Vimlantis' },
      { '<leader>vt', '<cmd>VimlantisToggle<cr>', desc = 'Toggle Vimlantis' },
    },
  },
}

-- Or using packer.nvim:
--[[
use {
  'vimlantis',
  config = function()
    require('vimlantis').setup({
      port = 3000,
      auto_open_browser = true,
    })
  end
}
--]]

-- Or manual setup:
--[[
require('vimlantis').setup({
  port = 3000,
  auto_open_browser = true,
  ocean_theme = 'teal',
  boat_speed = 1.5,
})

-- Create keybindings
vim.keymap.set('n', '<leader>vl', '<cmd>Vimlantis<cr>', { desc = 'Open Vimlantis' })
vim.keymap.set('n', '<leader>vc', '<cmd>VimlantisClose<cr>', { desc = 'Close Vimlantis' })
vim.keymap.set('n', '<leader>vt', '<cmd>VimlantisToggle<cr>', { desc = 'Toggle Vimlantis' })
--]]
