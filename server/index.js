const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let port = 3000;
let cwd = process.cwd();
let editor = process.env.VIMLANTIS_EDITOR || process.env.EDITOR || 'auto';
let nvimServer = null; // Neovim server address for RPC

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--cwd' && args[i + 1]) {
    cwd = args[i + 1];
    i++;
  } else if (args[i] === '--editor' && args[i + 1]) {
    editor = args[i + 1];
    i++;
  } else if (args[i] === '--nvim-server' && args[i + 1]) {
    nvimServer = args[i + 1];
    editor = 'nvim-rpc'; // Force nvim RPC mode
    i++;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Helper function to detect available editor
function detectEditor() {
  const editors = [
    { name: 'nvim', command: 'nvim' },
    { name: 'vim', command: 'vim' },
    { name: 'code', command: 'code' },
    { name: 'subl', command: 'subl' },
    { name: 'atom', command: 'atom' },
  ];

  // Use 'where' on Windows, 'which' on Unix
  const whichCommand = process.platform === 'win32' ? 'where' : 'which';

  for (const ed of editors) {
    try {
      // Check if editor is available
      require('child_process').execSync(`${whichCommand} ${ed.command}`, { stdio: 'ignore' });
      console.log(`✓ Detected editor: ${ed.command}`);
      return ed.command;
    } catch (e) {
      // Editor not found, try next
    }
  }

  console.log('⚠ No editor detected, will use system default');
  return null;
}

// Helper function to open file in editor
function openInEditor(fullPath, isDirectory = false) {
  let command;
  const editorToUse = editor === 'auto' ? detectEditor() : editor;

  console.log(`\n📂 Opening ${isDirectory ? 'directory' : 'file'}: ${fullPath}`);
  console.log(`🔧 Editor setting: ${editor}`);
  console.log(`🎯 Using editor: ${editorToUse || 'system default'}`);

  // If Neovim RPC is available, use it
  if (editor === 'nvim-rpc' && nvimServer) {
    console.log(`Opening in Neovim via RPC: ${fullPath}`);

    if (isDirectory) {
      // For directories, use :Explore or :Oil
      command = `nvim --server ${nvimServer} --remote-send "<Esc>:cd ${fullPath}<CR>:Explore<CR>"`;
    } else {
      // For files, use :edit
      command = `nvim --server ${nvimServer} --remote "${fullPath}"`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening file in Neovim: ${error.message}`);
        console.log('Falling back to spawning new editor...');
        // Fallback to spawning new nvim instance
        exec(`nvim "${fullPath}"`, () => { });
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
    });
    return;
  }

  if (!editorToUse) {
    console.log('No editor detected, using system default');
    // Use system default
    switch (process.platform) {
      case 'darwin':
        command = `open "${fullPath}"`;
        break;
      case 'win32':
        command = `start "" "${fullPath}"`;
        break;
      default:
        command = `xdg-open "${fullPath}"`;
    }
  } else {
    // Use detected/specified editor
    if (isDirectory && editorToUse === 'code') {
      // VS Code can open directories
      command = `code "${fullPath}"`;
    } else if (isDirectory) {
      // For other editors, open file explorer
      switch (process.platform) {
        case 'darwin':
          command = `open "${fullPath}"`;
          break;
        case 'win32':
          command = `explorer "${fullPath}"`;
          break;
        default:
          command = `xdg-open "${fullPath}"`;
      }
    } else {
      // Open file in editor
      command = `${editorToUse} "${fullPath}"`;
    }
  }

  console.log(`💻 Executing: ${command}\n`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error opening file: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`✓ Command executed successfully`);
  });
}

// API endpoint to get file tree
app.get('/api/filetree', (req, res) => {
  try {
    const tree = buildFileTree(cwd);
    res.json(tree);
  } catch (error) {
    console.error('Error building file tree:', error);
    res.status(500).json({ error: 'Failed to build file tree' });
  }
});

// API endpoint to get file content
app.get('/api/file', (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Path parameter required' });
    }

    const fullPath = path.join(cwd, filePath);

    // Security check: ensure the path is within cwd
    if (!fullPath.startsWith(cwd)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ content, path: filePath });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// API endpoint to open file/folder in editor
app.post('/api/open', (req, res) => {
  const { path: filePath, type } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'Path required' });
  }

  const fullPath = path.resolve(path.join(cwd, filePath));
  const normalizedCwd = path.resolve(cwd);

  console.log(`\n🔍 Security check:`);
  console.log(`   CWD: ${normalizedCwd}`);
  console.log(`   Requested: ${filePath}`);
  console.log(`   Full path: ${fullPath}`);

  // Security check: ensure the path is within cwd (normalize for Windows)
  if (!fullPath.startsWith(normalizedCwd)) {
    console.error(`❌ Access denied - path outside cwd`);
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check if path exists
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    return res.status(404).json({ error: 'File not found' });
  }

  const isDirectory = type === 'directory' || fs.statSync(fullPath).isDirectory();

  // Open the file/folder
  openInEditor(fullPath, isDirectory);

  // Broadcast to all WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'open_file',
        path: filePath,
        fullPath: fullPath
      }));
    }
  });

  res.json({ success: true, editor: editor === 'auto' ? detectEditor() : editor });
});

// Build file tree recursively
function buildFileTree(dirPath, relativePath = '') {
  const items = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  // Ignore patterns
  const ignorePatterns = [
    /^\.git$/,
    /^node_modules$/,
    /^\.DS_Store$/,
    /^\.nvim$/,
    /^\.vscode$/,
    /^\.idea$/,
    /^dist$/,
    /^build$/,
    /^target$/,
    /^__pycache__$/,
    /\.pyc$/,
    /^\.next$/,
  ];

  for (const entry of entries) {
    // Skip ignored files/folders
    if (ignorePatterns.some(pattern => pattern.test(entry.name))) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const itemRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      const children = buildFileTree(fullPath, itemRelativePath);
      items.push({
        name: entry.name,
        path: itemRelativePath,
        type: 'directory',
        children: children
      });
    } else if (entry.isFile()) {
      items.push({
        name: entry.name,
        path: itemRelativePath,
        type: 'file'
      });
    }
  }

  return items;
}

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Vimlantis server running at http://localhost:${port}`);
  console.log(`Serving files from: ${cwd}`);

  // Open browser if requested
  if (args.includes('--open')) {
    const url = `http://localhost:${port}`;
    const { exec } = require('child_process');
    let command;

    switch (process.platform) {
      case 'darwin':
        command = `open "${url}"`;
        break;
      case 'win32':
        command = `start "${url}"`;
        break;
      default:
        command = `xdg-open "${url}"`;
    }

    console.log(`Opening browser: ${url}`);
    exec(command, (error) => {
      if (error) {
        console.error('Failed to open browser:', error);
      }
    });
  }
});

// Setup WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);

      // Handle different message types
      if (data.type === 'open_file') {
        // This would be handled by Neovim RPC in a full implementation
        console.log('Request to open file:', data.path);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
