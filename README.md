# Vimlantis

Transform any project into an explorable 3D ocean directly from Neovim.

![Vimlantis](https://raw.githubusercontent.com/JRH89/vimlantis/refs/heads/master/public/og.png)

## Inspired by
- **Ayla Croft (@aylacroft)**
- **[Gitlantis](https://github.com/liltrendi/gitlantis) created by @liltrendi.**

## Install (Neovim or LazyVim)

```bash
git clone https://github.com/jrh89/vimlantis.git
cd vimlantis
./install.sh
```

The script checks for Neovim + Node.js, installs dependencies, and wires the plugin into your config.

On Debian/Ubuntu systems, if Node.js is not installed, `install.sh` will try:

```bash
sudo apt-get update
sudo apt-get install -y nodejs npm
```

If `apt-get` is not available or the install fails, youll be asked to install Node.js (v16 or higher) manually from https://nodejs.org and re-run the script.

The script checks for Neovim + Node.js, installs dependencies, and wires the plugin into your config. When it finishes, open a project in Neovim (or LazyVim) and run:

```vim
:Vimlantis
```

That’s the whole flow: **clone → cd → install → :Vimlantis**.

## LazyVim specifics

LazyVim users follow the same three shell commands above. The installer can drop a plugin spec into `~/.config/nvim/lua/plugins/vimlantis.lua` for you, but here’s the snippet if you prefer to add it manually:

```lua
return {
  {
    'jrh89/vimlantis',
    config = function()
      require('vimlantis').setup()
    end,
    keys = {
      { '<leader>vl', '<cmd>Vimlantis<cr>', desc = 'Open Vimlantis' },
    },
  },
}
```

## Everyday usage

1. Open Neovim/LazyVim inside any repo.
2. Run `:Vimlantis` to launch the 3D view.
3. Sail to a barrel/lighthouse and click to open the file/folder back in Neovim.

Optional command palette:

- `:VimlantisClose` – stop the session
- `:VimlantisToggle` – reopen/close quickly

## Need help?

- ⭐ Star the repo and open issues for bugs/ideas.
- � Run `:Vimlantis` after reinstalling if things get out of sync.

Happy sailing, Pirates! 🌊
