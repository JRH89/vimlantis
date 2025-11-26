-- Vimlantis main module
local M = {}

-- Default configuration
M.config = {
  port = 3000,
  auto_open_browser = true,
  minimap_size = 'medium',
  show_breadcrumbs = true,
  show_compass = true,
  show_minimap = true,
  ocean_theme = 'blue',
  boat_speed = 1.5,
}

-- Server state
M.server_job_id = nil
M.server_running = false

-- Setup function
function M.setup(opts)
  M.config = vim.tbl_deep_extend('force', M.config, opts or {})
  
  -- Create user commands
  vim.api.nvim_create_user_command('Vimlantis', function()
    M.open()
  end, {})
  
  vim.api.nvim_create_user_command('VimlantisClose', function()
    M.close()
  end, {})
  
  vim.api.nvim_create_user_command('VimlantisToggle', function()
    M.toggle()
  end, {})
end

-- Get the plugin root directory
function M.get_plugin_root()
  -- Get the directory where this init.lua file is located
  local str = debug.getinfo(1, "S").source:sub(2)
  -- Go up two levels: lua/vimlantis/init.lua -> lua/vimlantis -> lua -> root
  local plugin_root = vim.fn.fnamemodify(str, ":h:h:h")
  return plugin_root
end

-- Start the web server
function M.start_server()
  if M.server_running then
    vim.notify('Vimlantis server is already running', vim.log.levels.INFO)
    return
  end
  
  local plugin_root = M.get_plugin_root()
  local server_path = plugin_root .. '/server/index.js'
  
  -- Check if Node.js is available
  if vim.fn.executable('node') == 0 then
    vim.notify('Node.js is not installed. Please install Node.js to use Vimlantis.', vim.log.levels.ERROR)
    return
  end
  
  -- Get Neovim server name for RPC
  local nvim_server = vim.v.servername
  
  -- Start the server
  local cmd = string.format('node %s --port %d --cwd %s', 
    vim.fn.shellescape(server_path),
    M.config.port,
    vim.fn.shellescape(vim.fn.getcwd())
  )
  
  -- Add Neovim server address if available
  if nvim_server and nvim_server ~= '' then
    cmd = cmd .. ' --nvim-server ' .. vim.fn.shellescape(nvim_server)
  end
  
  if M.config.auto_open_browser then
    cmd = cmd .. ' --open'
  end
  
  M.server_job_id = vim.fn.jobstart(cmd, {
    on_stdout = function(_, data)
      if data then
        for _, line in ipairs(data) do
          if line ~= '' then
            vim.notify('Vimlantis: ' .. line, vim.log.levels.INFO)
          end
        end
      end
    end,
    on_stderr = function(_, data)
      if data then
        for _, line in ipairs(data) do
          if line ~= '' then
            vim.notify('Vimlantis Error: ' .. line, vim.log.levels.ERROR)
          end
        end
      end
    end,
    on_exit = function()
      M.server_running = false
      M.server_job_id = nil
      vim.notify('Vimlantis server stopped', vim.log.levels.INFO)
    end,
  })
  
  if M.server_job_id > 0 then
    M.server_running = true
    vim.notify('Vimlantis server starting on port ' .. M.config.port, vim.log.levels.INFO)
  else
    vim.notify('Failed to start Vimlantis server', vim.log.levels.ERROR)
  end
end

-- Stop the web server
function M.stop_server()
  if not M.server_running then
    vim.notify('Vimlantis server is not running', vim.log.levels.INFO)
    return
  end
  
  if M.server_job_id then
    vim.fn.jobstop(M.server_job_id)
    M.server_job_id = nil
    M.server_running = false
  end
end

-- Open browser (Legacy/Manual)
function M.open_browser()
  local url = string.format('http://localhost:%d', M.config.port)
  local open_cmd
  
  if vim.fn.has('mac') == 1 then
    open_cmd = 'open'
  elseif vim.fn.has('unix') == 1 then
    open_cmd = 'xdg-open'
  elseif vim.fn.has('win32') == 1 then
    open_cmd = 'start'
  else
    vim.notify('Unable to detect OS to open browser', vim.log.levels.WARN)
    vim.notify('Please open: ' .. url, vim.log.levels.INFO)
    return
  end
  
  vim.fn.jobstart(string.format('%s %s', open_cmd, url), { detach = true })
end

-- Open Vimlantis
function M.open()
  if not M.server_running then
    M.start_server()
  else
    M.open_browser()
  end
end

-- Close Vimlantis
function M.close()
  M.stop_server()
end

-- Toggle Vimlantis
function M.toggle()
  if M.server_running then
    M.close()
  else
    M.open()
  end
end

return M
