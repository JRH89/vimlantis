const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Parse command line arguments
const args = process.argv.slice(2);
let port = 3000;
let cwd = process.cwd();

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--cwd' && args[i + 1]) {
    cwd = args[i + 1];
    i++;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

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

// API endpoint to open file in Neovim
app.post('/api/open', (req, res) => {
  const { path: filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'Path required' });
  }

  // Broadcast to all WebSocket clients to open the file
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'open_file',
        path: filePath
      }));
    }
  });

  res.json({ success: true });
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
