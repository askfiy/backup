# LSP

## 简介

LSP 全称为 Language Server Protocol。

LSP 提供了一些在日常开发中很常见的功能，如：

- 跳转定义
- 查找引用
- 帮助信息
- 查看签名
- 代码重构
- ...

现在 neovim 内置了 LSP 客户端，我们可以很方便的对其进行配置。

那么本章节我们将以 lua 为例，将 nv-minIDE 打造成一个简单的 Lua 开发工具。

## 插件

本次需要使用的插件如下，将以下内容复制粘贴到 ~/.config/nvim/lua/core/plugins.lua 文件的 packer_install_tbl 表中：

```
local packer_install_tbl = {
    ...
    -------------- BASIC ---------------
    ["nvim-lua/plenary.nvim"] = {},
    ...
    --------------- LSP ---------------
    ["neovim/nvim-lspconfig"] = {},
    ["jose-elias-alvarez/null-ls.nvim"] = {
        after = { "nvim-lspconfig" },
    },
    ["williamboman/nvim-lsp-installer"] = {
        after = { "nvim-lspconfig", "null-ls.nvim" },
    },
    ["j-hui/fidget.nvim"] = {
        after = { "nvim-lsp-installer" },
    },
    ["kosayoda/nvim-lightbulb"] = {
        after = { "nvim-lsp-installer" },
    },
}
```

复制粘贴完成后，输入 :PackerSync 命令，它将自动下载这些插件。

plenary.nvim 是 null-ls 以及其后面其它安装的某些插件的依赖插件。

nvim-lspconfig 是 LSP 基础插件，我们需要通过该插件来配置 neovim 内置 LSP 客户端如何与 LSP 服务器端通信。

null-ls 插件能够提供一些基于第三方工具的代码诊断、格式化等操作。诸如 eslint、prettier、pylint 等都可以通过该插件非常简单的进行配置并生效。

nvim-lsp-installer 是一款自动下载 LSP 服务器的插件，通过它能够让我们免去一些 LSP 服务器繁琐的安装步骤，非常推荐使用。通常，它依赖 git、npm 等一些外部的包管理器命令。除此之外你还需要下载一些命令行工具，如 unzip、wget 等，可参阅其 github 中的介绍安装这些依赖 ...

fidget.nvim 能够提示目前 LSP 服务器的工作状态。当我们打开一个文件时，LSP 服务器通常必须要分析完整个工作区域后才能正常工作，这需要花费一些时间来完成，而通过 fidget.nvim 插件我们可以很直观的看到 LSP 服务器还需多久才能做完准备工作。

nvim-lightbulb 插件在 LSP 的代码操作可用时会在行号列中显示一个小灯泡，如果你之前使用过 vscode，那么你应该知道这个功能。我们可以通过特定的函数调用代码操作，代码操作通常提供了一些 vsc 中快速修复的功能，如导入模块、忽略错误等等 ...

## 流程

LSP 的配置比较繁琐，首先我们可以将整个配置分为 3 个步骤：

- 下载 LSP 服务器
- 配置 LSP 客户端如何与 LSP 服务端交互
- 启动 LSP 服务器

下载和启动 LSP 服务器可以通过 nvim-lsp-installer 插件非常方便的做到。

而我们目前只将注意力放在如何配置 LSP 客户端与 LSP 服务端交互这一点上即可。

如果你不知道你所使用的语言有那些可用的 LSP 服务器，可以在下面这个链接中查询该语言可用的 LSP 服务器名称：

- https://github.com/williamboman/nvim-lsp-installer#available-lsps

通过访问以下链接，你可以看到不同语言的 LSP 服务器该如何配置：

- https://github.com/neovim/nvim-lspconfig/blob/master/doc/server_configurations.md

我们以 Lua 举例，通过第 1 个链接可以找到 Lua 的 LSP 服务名称名称为 sumneko_lua，再到第二个链接中搜索 sumneko_lua，即可看到它的配置。

你也可以直接 [点我跳转](https://github.com/neovim/nvim-lspconfig/blob/master/doc/server_configurations.md#sumneko_lua)：

```
require'lspconfig'.sumneko_lua.setup {
  settings = {
    Lua = {
      runtime = {
        -- Tell the language server which version of Lua you're using (most likely LuaJIT in the case of Neovim)
        version = 'LuaJIT',
      },
      diagnostics = {
        -- Get the language server to recognize the `vim` global
        globals = {'vim'},
      },
      workspace = {
        -- Make the server aware of Neovim runtime files
        library = vim.api.nvim_get_runtime_file("", true),
      },
      -- Do not send telemetry data containing a randomized but unique identifier
      telemetry = {
        enable = false,
      },
    },
  },
}
```

每一个 LSP 服务启动时不光会使用我们自己编写的配置文件，还会使用一些默认配置，我们可以在 nvim-lspconfig 插件的目录中看到这些默认配置。

packer 会将所有延迟加载的插件放在以下目录：

```
~/.local/share/nvim/site/pack/packer/opt
```

而未延迟加载的插件是在下面这个目录中：

```
~/.local/share/nvim/site/pack/packer/start
```

上面我们没有延迟加载 nvim-lspconfig，所以可以在 start 目录中找到该插件。

nvim-lspconfig 将所有默认配置存放在了 lua/lspconfig/server_configurations 目录下，所以你可以直接用以下命令查看到默认的 sumneko_lua 配置文件：

```
$ cat ~/.local/share/nvim/site/pack/packer/start/nvim-lspconfig/lua/lspconfig/server_configurations/sumneko_lua.lua
```

结果如下，这里只截取了一些非常重要的信息：

```
local util = require 'lspconfig.util'

local root_files = {
  '.luarc.json',
  '.luacheckrc',
  '.stylua.toml',
  'selene.toml',
}
return {
  default_config = {
    cmd = { 'lua-language-server' },
    filetypes = { 'lua' },
    root_dir = function(fname)
      return util.root_pattern(unpack(root_files))(fname) or util.find_git_ancestor(fname)
    end,
    single_file_support = true,
    log_level = vim.lsp.protocol.MessageType.Warning,
    settings = { Lua = { telemetry = { enable = false } } },
  },
  docs = {
    default_config = {
      root_dir = [[root_pattern(".luarc.json", ".luacheckrc", ".stylua.toml", "selene.toml", ".git")]],
    },
  },
}
```

注意！当你自己的配置文件中没有上面这些选项时，它将使用上面所展示的默认选项。

其中有几个非常重要的配置项，这里一定要说明一下：

- cmd ： 这是一个 table，可以携带参数。必须确保 table 索引 1 处的命令是可执行的，如果不可执行，那么证明该 LSP 服务器是不能启动的。
- filetypes ： 当匹配到这些文件类型时，LSP 服务器才会进入准备启动的状态
- root_dir ： 每个 LSP 服务器都需要一个特定的文件确定根目录，当成功匹配到了 root_files 中的文件时，LSP 服务器将会以工作区模式启动，你可以自己添加、删除这其中的匹配文件
- single_file_support ： 表明该 LSP 服务器是否支持以单文件模式启动，如果该 LSP 服务器不支持以单文件模式启动，则其只能在 filetypes 和 root_dir 中的文件被匹配时才会生效

单文件模式和工作区模式有何区别？

以 Python 举例，当以单文件模式启动 LSP 服务器时，LSP 服务器不能实时更新工作区状态，此时如果你创建了一个自定义模块并导入时，LSP 服务器其实是不会识别它的，这样开发者就会看见误报的警告信息。

而工作区模式是可以识别自定义模块的，简单概括来说，LSP 服务器以工作区模式启动效果肯定好于单文件模式启动。但问题是，工作区模式启动的条件有些苛刻，必须要匹配 root_dir 才行，所以这在某些情况下是一种弊端。

比如，我们只想快速的用 Python 写一个单文件的爬虫程序，如果没有单文件模式的支持，那么 LSP 服务器在没有匹配 root_dir 时是不会启动的，这代表我们不能获得代码智能分析提示，这非常让人郁闷。

有一些 LSP 服务器本身不支持单文件模式启动，比如 tsserver，对此我们可以将当前 neovim 所在目录确定为根目录，相关知识在本章节最后面会介绍到。

## 配置

说了这么多，也只是希望大家在今后使用时少踩坑，现在让我们开始配置。

首先书写 sumneko_lua 的配置文件。所有的 LSP 服务器配置文件我们都放在了 ~/.config/nvim/lua/configure/lsp 目录下。

创建 sumneko_lua.lua 文件：

```
$ touch ~/.config/nvim/lua/configure/lsp/sumneko_lua.lua
```

复制粘贴以下代码，这些代码都是在上面的网页链接以及默认配置中拷贝出来的：

```
-- https://github.com/sumneko/lua-language-server

local util = require("lspconfig.util")

local runtime_path = vim.split(package.path, ";")

table.insert(runtime_path, "lua/?.lua")
table.insert(runtime_path, "lua/?/init.lua")

local root_files = {
    ".luarc.json",
    ".luacheckrc",
    ".stylua.toml",
    "selene.toml",
}

local M = {}

M.lsp_config = {
    filetypes = { "lua" },
    single_file_support = true,
    -- cmd = { "lua-language-server", "--locale=zh-CN" },
    cmd = { "lua-language-server" },
    root_dir = function(fname)
        ---@diagnostic disable-next-line: deprecated
        return util.root_pattern(unpack(root_files))(fname) or util.find_git_ancestor(fname)
    end,
    log_level = 2,
    settings = {
        Lua = {
            runtime = {
                version = "LuaJIT",
                path = runtime_path,
            },
            diagnostics = {
                globals = { "vim" },
            },
            workspace = {
                library = vim.api.nvim_get_runtime_file("", true),
            },
            telemetry = {
                enable = false,
            },
        },
    },
}

return M
```

我们这里将最重要的 4 个默认配置（cmd、filetypes、root_dir、single_file_support）全部覆写一遍，这样做的好处是后续可以非常快速的更改 root_dir 的启动条件，也能直观的看到该 LSP 服务器启动需要那些条件。

其实上面的代码做的事情非常简单，你可以理解为我们自定义了一个模块，该模块返回了一个 table， 其中 lsp_config 键就是我们自己编写的 LSP 配置文件。

现在， 3 个步骤中我们做了 1 个，配置文件已经编写好了，如何安装和启动 LSP 服务器呢？

这就需要开始编写 nvim-lsp-installer 插件的配置文件了，在 ~/.config/nvim/configure/plugins/ 目录中创建 nv_nvim-lsp-installer.lua 文件：

```
$ touch ~/.config/nvim/lua/configure/plugins/nv_nvim-lsp-installer.lua
```

复制粘贴以下代码：

```
-- https://github.com/williamboman/nvim-lsp-installer

local mapping = require("core.mapping")

local M = {
    -- 加载的 LSP 配置文件列表
    language_servers_config = {
        sumneko_lua = require("configure.lsp.sumneko_lua"),
    },
}

function M.before() end

function M.load()
    local ok, m = pcall(require, "nvim-lsp-installer")
    if not ok then
        return
    end

    M.nvim_lsp_installer = m
    -- 由于我们需要通过 lspconfig 插件启动 LSP 服务器
    -- 所以这里将它导入进来
    M.lspconfig = require("lspconfig")

    -- 配置 nvim-lsp-installer，它只负责下载 LSP 服务器
    M.nvim_lsp_installer.setup({
        automatic_installation = true,
        ui = {
            icons = {
                server_installed = "",
                server_pending = "",
                server_uninstalled = "ﮊ",
            },
            keymaps = {
                toggle_server_expand = "<cr>",
                install_server = "i",
                update_server = "u",
                check_server_version = "c",
                update_all_servers = "U",
                check_outdated_servers = "C",
                uninstall_server = "X",
            },
        },
        github = {
	        -- 针对中国用户，如果 LSP 服务器下载太慢，可以使用下面的镜像站
            -- download_url_template = "https://hub.fastgit.xyz/%s/releases/download/%s/%s",
            download_url_template = "https://github.com/%s/releases/download/%s/%s",
        },
        max_concurrent_installers = 20,
    })
end

function M.after()
    -- 循环 LSP 服务器名称和配置
    for server_name, server_settings in pairs(M.language_servers_config) do
        local server_available, server = M.nvim_lsp_installer.get_server(server_name)
        -- 判断 LSP 服务器是否有效
        if server_available then
            -- 判断 LSP 服务器是否已下载
            -- 若未下载则自动下载
            ---@diagnostic disable-next-line: undefined-field
            if not server:is_installed() then
                vim.notify("Install Language Server: " .. server_name, "info", { title = "Language Server" })
                ---@diagnostic disable-next-line: undefined-field
                server:install()
            else
                -- 如果 LSP 服务器已经下载，则将配置文件导入
                local lsp_config = server_settings.lsp_config

                -- 为配置文件新增一些公用的配置
                lsp_config.flags = {
                    debounce_text_changes = 150,
                }

                -- 这是一个回调函数，在 LSP 服务器开始工作前会自动调用
                -- 在其内部我们调用了 M.public_attach_callbackfn 函数
                lsp_config.on_attach = function(client, bufnr)
                    M.public_attach_callbackfn(client, bufnr)
                end

                -- 启动 LSP 服务器
                M.lspconfig[server_name].setup(lsp_config)
            end
        end
    end
end

---@diagnostic disable-next-line: unused-local
function M.public_attach_callbackfn(client, bufnr)
    -- 在 LSP 服务器开始工作前，绑定好按键
    M.register_buffer_key(bufnr)
end

function M.register_buffer_key(bufnr)
    -- 以下这些按键只针对当前缓冲区生效
    mapping.register({
        {
            mode = { "n" },
            lhs = "<leader>ca",
            rhs = vim.lsp.buf.code_action,
            options = { silent = true, buffer = bufnr },
            description = "Show code action",
        },
        {
            mode = { "n" },
            lhs = "<leader>cn",
            rhs = vim.lsp.buf.rename,
            options = { silent = true, buffer = bufnr },
            description = "Variable renaming",
        },
        {
            mode = { "n" },
            lhs = "<leader>cf",
            rhs = vim.lsp.buf.formatting_sync,
            options = { silent = true, buffer = bufnr },
            description = "Format buffer",
        },
        {
            mode = { "n" },
            lhs = "gI",
            rhs = vim.lsp.buf.implementation,
            options = { silent = true, buffer = bufnr },
            description = "Go to implementations",
        },
        {
            mode = { "n" },
            lhs = "gD",
            rhs = vim.lsp.buf.type_definition,
            options = { silent = true, buffer = bufnr },
            description = "Go to type definitions",
        },
        {
            mode = { "n" },
            lhs = "gd",
            rhs = vim.lsp.buf.definition,
            options = { silent = true, buffer = bufnr },
            description = "Go to definitions",
        },
        {
            mode = { "n" },
            lhs = "gr",
            rhs = vim.lsp.buf.references,
            options = { silent = true, buffer = bufnr },
            description = "Go to references",
        },
        {
            mode = { "n" },
            lhs = "gh",
            rhs = vim.lsp.buf.hover,
            options = { silent = true, buffer = bufnr },
            description = "Show help information",
        },
        {
            mode = { "n" },
            lhs = "go",
            rhs = vim.diagnostic.setqflist,
            options = { silent = true, buffer = bufnr },
            description = "Show Workspace Diagnostics",
        },
        {
            mode = { "n" },
            lhs = "[g",
            rhs = vim.diagnostic.goto_prev,
            options = { silent = true, buffer = bufnr },
            description = "Jump to prev diagnostic",
        },
        {
            mode = { "n" },
            lhs = "]g",
            rhs = vim.diagnostic.goto_next,
            options = { silent = true, buffer = bufnr },
            description = "Jump to next diagnostic",
        },
        {
            mode = { "i" },
            lhs = "<c-j>",
            rhs = vim.lsp.buf.signature_help,
            options = { silent = true, buffer = bufnr },
            description = "Toggle signature help",
        },
    })
end

return M
```

现在当你重启 neovim 后，稍微等待一段时间后 LSP 服务器将成功被加载（等待的时间其实就是在做工作区分析）。

别看上面的代码多，其实整体流程非常简单：

1. 配置 nvim-lsp-installer 插件
2. 循环所有已经配置的 LSP 服务器和配置文件
3. 判断 LSP 服务器是否下载，若没下载则自动下载，若已下载则启动服务
4. 绑定按键，将按键注册到当前缓冲区

## 浮动窗口

现在，当你在 Normal 模式下按下 gh，或者 g] 以及 g[ 时可以看到它们这些浮动窗口的样式是没有边框的，根据个人喜好我决定为它添加一个边框（更详细的高亮组美化需要在后面几章中完成）。

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523230003.png)

在上面的按键绑定中，有以下 2 个按键会展示浮动窗口：

- gh -> 显示帮助信息
- &lt;c-j&gt; -> 显示签名信息（插入模式下）

除此之外，诊断跳转的 2 个按键也会展示浮动窗口，但是它们的配置是不一样的。

- [g -> 跳转到上一个诊断（当前 buffer 区域内）
- ]g -> 跳转到下一个诊断（当前 buffer 区域内）

先来配置帮助信息和签名信息的浮动窗口，我们需要在 LSP 启动配置中添加一个 header，告诉 neovim 当出现帮助或签名浮动窗口后应该为此窗口添加上一个边框。

除此之外，我们还需要为这 2 种浮动窗口添加上一个文件类型，在后续制作浮动窗口滚动时它们会派上用场。

首先，我们需要声明一个公共的 header 头，并将它们添加到每一个 LSP 服务器的配置文件中。

复制粘贴下面的 3 个自定义函数到 nv_nvim-lsp-installer.lua 中：

```
-- 设置浮动样式
function M.float_style_settings()
    -- Add file type for floating window
    M.lsp_handlers = {
        ["textDocument/hover"] = vim.lsp.with(M.lsp_hover, {
            border = "rounded",
            filetype = "lsp-hover",
        }),
        ["textDocument/signatureHelp"] = vim.lsp.with(M.lsp_signature_help, {
            border = "rounded",
            filetype = "lsp-signature-help",
        }),
    }
end

-- 为 lsp hover 添加文件类型
function M.lsp_hover(_, result, ctx, config)
    -- Add file type for LSP hover
    local bufnr, winner = vim.lsp.handlers.hover(_, result, ctx, config)
    if bufnr and winner then
        vim.api.nvim_buf_set_option(bufnr, "filetype", config.filetype)
        return bufnr, winner
    end
end

-- 为 lsp 签名帮助添加文件类型
function M.lsp_signature_help(_, result, ctx, config)
    -- Add file type for LSP signature help
    local bufnr, winner = vim.lsp.handlers.signature_help(_, result, ctx, config)
    if bufnr and winner then
        vim.api.nvim_buf_set_option(bufnr, "filetype", config.filetype)
        return bufnr, winner
    end
end
```

现在公共的 header 是配置完成了，但是还没有调用它。

所以在 M.nvim_lsp_installer = m 这条语句下面调用一下它（nv_nvim-lsp-installer.lua 文件）：

```
M.nvim_lsp_installer = m

+ M.float_style_settings()

M.lspconfig = require("lspconfig")
```

然后在这个公共 header 需要在 LSP 服务器启动前放入配置文件里，我们找到 nv_nvim-lsp-installer.lua 文件，在下面的位置中复制上以下代码：

```
lsp_config.flags = {
    debounce_text_changes = 150,
}

+ -- 这里的意思是，如果服务器配置文件中单独设置了 heander，则将其与公用 header 合并
+ lsp_config.handlers = vim.tbl_extend("force", M.lsp_handlers, lsp_config.handlers or {})

lsp_config.on_attach = function(client, bufnr)
    M.public_attach_callbackfn(client, bufnr)
end
```

重启 neovim 后，帮助信息和签名信息应该已经具有了一个有边框的浮动窗口了（但它现在非常丑陋，不要嫌弃，后面会配置的很漂亮）。

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523161459.png)

好吧，添加一个美化之后的信息：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523235721.png)

好了，至此悬浮文档和签名帮助已经有浮动边框了。

诊断跳转的浮动边框设置比较简单，替换掉原有的 ]g 和 [g 的绑定映射即可：

```
{
    mode = { "n" },
    lhs = "[g",
    rhs = function()
        vim.diagnostic.goto_prev({ float = { border = "rounded" } })
    end,
    options = { silent = true, buffer = bufnr },
    description = "Jump to prev diagnostic",
},
{
    mode = { "n" },
    lhs = "]g",
    rhs = function()
        vim.diagnostic.goto_next({ float = { border = "rounded" } })
    end,
    options = { silent = true, buffer = bufnr },
    description = "Jump to next diagnostic",
},
```

图示：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523161429.png)

再次声明 ... 你可能现在觉得很丑，但是不要在意。后面我们会设置高亮组让它们看起来很酷。

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523235812.png)

## 诊断图标

现在在行号列中，各种诊断级别是用字母代替的。

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523162441.png)

我们希望使用一些字符图标来代替单字符展示诊断。

首先你需要准备一些字符图标，我这里准备好了一份。

将以下代码复制粘贴到 utils/icons.lua 文件中：

```
local icons = {}

icons.diagnostics = {
    Error = " ",
    Warn = " ",
    Info = "ﬤ ",
    Hint = " ",
}

return icons
```

到 nv_nvim-lsp-installer.lua 文件中导入图标：

```
+ local icons = require("utils.icons")
local mapping = require("core.mapping")
```

然后需要添加一个新的函数 M.diagnostics_style_settings （nv_nvim-lsp-installer.lua 文件）：

```
function M.diagnostics_style_settings()
    -- 这里可以对诊断做一些配置，比如浮动信息的前缀
    -- 图标，是否在行号列中显示等等 ...
    vim.diagnostic.config({
        signs = true,
        underline = true,
        severity_sort = true,
        update_in_insert = false,
        float = { source = "always" },
        virtual_text = { prefix = "●", source = "always" },
    })

    -- 这里就是设定诊断图标了
    for tpe, icon in pairs(icons.diagnostics) do
        local hl = "DiagnosticSign" .. tpe
        vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = hl })
    end
end
```

再到 nv_nvim-lsp-installer.lua 文件中的 M.load 函数中调用刚刚新添加的函数：

```

M.float_style_settings()

+ M.diagnostics_style_settings()

M.lspconfig = require("lspconfig")
```

重启 neovim，现在你应该能看见诊断图标了。

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523162345.png)

## 签名切换

在插入模式下，如果你位于一个函数中按下 &lt;c-j&gt; 那么它会显示函数的签名，并提示当前应该输入的函数参数：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523163058.png)

现在，当你连续两次按下 &lt;c-j&gt;那么它会将光标移入到浮动窗口中。

这不是我喜欢的，我喜欢按下一次 &lt;c-j&gt; 它出现浮窗，再次按下后它应该关闭浮窗。

所以我们需要对 &lt;c-j&gt; 的行为做一些定制。

用以下代码替换掉原本的 &lt;c-j&gt;：

```
        {
            mode = { "i" },
            lhs = "<c-j>",
            rhs = function()
                -- 这个函数实现的事情非常简单
                -- 按下 <c-j> 后判定是否具有 filetype 是 lsp-signature-help 的浮动窗口
                -- 如果有就关闭，如果没有就调用 LSP 的签名帮助
                local wins = vim.api.nvim_list_wins()
                for _, win_id in ipairs(wins) do
                    local buf_id = vim.api.nvim_win_get_buf(win_id)
                    local ft = vim.api.nvim_buf_get_option(buf_id, "filetype")
                    if ft == "lsp-signature-help" then
                        vim.api.nvim_win_close(win_id, false)
                        return
                    end
                end
                vim.lsp.buf.signature_help()
            end,
            options = { silent = true, buffer = bufnr },
            description = "Toggle signature help",
        },
```

## 浮窗滚动

有的时候，帮助信息和签名帮助可能会很长，一页不能完全显示。

所以我们需要对帮助信息和签名帮助添加浮窗滚动的功能，将以下代码复制粘贴到 mapping.register 函数中：

```
        {
            mode = { "i", "n" },
            lhs = "<c-f>",
            rhs = function()
                local scroll_floating_filetype = { "lsp-signature-help", "lsp-hover" }
                -- 获取所有窗口
                local wins = vim.api.nvim_list_wins()

                for _, win_id in ipairs(wins) do
                    -- 获取窗口中的 buffer
                    local buf_id = vim.api.nvim_win_get_buf(win_id)
                    -- 获取窗口 buffer 的文件类型
                    local ft = vim.api.nvim_buf_get_option(buf_id, "filetype")

                    -- 判定窗口文件类型是否是 lsp-signature-help 或者 lsp-hover
                    if vim.tbl_contains(scroll_floating_filetype, ft) then
                        -- 获取当前窗口高度
                        local win_height = vim.api.nvim_win_get_height(win_id)
                        -- 获取当前光标所在行
                        local cursor_line = vim.api.nvim_win_get_cursor(win_id)[1]
                        -- 获取当前窗口中总共有多少行
                        ---@diagnostic disable-next-line: redundant-parameter
                        local buf_total_line = vim.fn.line("$", win_id)
                        -- 获取当前窗口中最后一行的行号
                        ---@diagnostic disable-next-line: redundant-parameter
                        local win_last_line = vim.fn.line("w$", win_id)

                        -- 如果窗口文字总行数等于窗口高度，代表不可滚动
                        if buf_total_line == win_height then
                            vim.api.nvim_echo({ { "Can't scroll down", "MoreMsg" } }, false, {})
                            return
                        end

                        -- 判定当前所在行是否小于窗口最后一行，如果是，则直接向下翻 1 页 + 5 行
                        if cursor_line < win_last_line then
                            vim.api.nvim_win_set_cursor(win_id, { win_last_line + 5, 0 })
                        -- 判定当前所在行 + 5 行是否大于窗口中总行数，如果大于则直接到最后一行
                        elseif cursor_line + 5 > buf_total_line then
                            vim.api.nvim_win_set_cursor(win_id, { win_last_line, 0 })
                        -- 否则说明当前光标没有在第一屏，也不会越界，向下走 5 行即可
                        else
                            vim.api.nvim_win_set_cursor(win_id, { cursor_line + 5, 0 })
                        end

                        return
                    end
                end
                -- 如果没有匹配到特定的浮动窗口，则执行默认的 <c-f> 命令
                local map = "<c-f>"
                local key = vim.api.nvim_replace_termcodes(map, true, false, true)
                vim.api.nvim_feedkeys(key, "n", true)
            end,
            options = { silent = true, buffer = bufnr },
            description = "Scroll down floating window",
        },
        {
            mode = { "i", "n" },
            lhs = "<c-b>",
            rhs = function()
                local scroll_floating_filetype = { "lsp-signature-help", "lsp-hover" }
                local wins = vim.api.nvim_list_wins()

                for _, win_id in ipairs(wins) do
                    local buf_id = vim.api.nvim_win_get_buf(win_id)
                    local ft = vim.api.nvim_buf_get_option(buf_id, "filetype")

                    if vim.tbl_contains(scroll_floating_filetype, ft) then
                        local win_height = vim.api.nvim_win_get_height(win_id)
                        local cursor_line = vim.api.nvim_win_get_cursor(win_id)[1]
                        ---@diagnostic disable-next-line: redundant-parameter
                        local buf_total_line = vim.fn.line("$", win_id)
                        ---@diagnostic disable-next-line: redundant-parameter
                        local win_first_line = vim.fn.line("w0", win_id)

                        if buf_total_line == win_height then
                            vim.api.nvim_echo({ { "Can't scroll up", "MoreMsg" } }, false, {})
                            return
                        end

                        if cursor_line > win_first_line then
                            vim.api.nvim_win_set_cursor(win_id, { win_first_line - 5, 0 })
                        elseif cursor_line - 5 < 1 then
                            vim.api.nvim_win_set_cursor(win_id, { 1, 0 })
                        else
                            vim.api.nvim_win_set_cursor(win_id, { cursor_line - 5, 0 })
                        end

                        return
                    end
                end

                local map = "<c-b>"
                local key = vim.api.nvim_replace_termcodes(map, true, false, true)
                vim.api.nvim_feedkeys(key, "n", true)
            end,
            options = { silent = true, buffer = bufnr },
            description = "Scroll up floating window",
        },
```

aksify 留：（好吧，这里我留下了一个隐藏的小 BUG，如果你改变了 neovim 预设的 scrolloff 值，浮窗滚动是会报错的，但 nv-minIDE 没有修改这个选项的默认值，所以直接使用是没问题的，如果你恰好报错了，可以尝试自己解决一下，或者直接问我 = =）。

至此，LSP 的基本功能算是做完了。

## null-ls

null-ls 的配置很简单，我们这里配置一个 Lua 语言的格式化工具。

首先你需要下载安装 stylua 工具，在依赖一章节中，我们已经安装它了。

然后在到 configure/plugins 目录里新建 nv_null-ls.lua 文件，复制粘贴以下代码：

```
-- https://github.com/jose-elias-alvarez/null-ls.nvim

local M = {}

function M.before() end

function M.load()
    local ok, m = pcall(require, "null-ls")
    if not ok then
        return
    end

    M.null_ls = m
    M.null_ls.setup({
        sources = {
            M.null_ls.builtins.formatting.stylua.with({
                extra_args = {
                    "--indent-type=Spaces",
                    "--indent-width=4",
                },
            }),
        },
    })
end

function M.after() end

return M
```

如果你是前端开发者，那么 prettier 格式化程序你应该会很熟悉，首先确保 prettier 是可被执行的，然后再到 null-ls 的配置文件中添加它：

```
M.null_ls.setup({
        sources = {
            ...
            M.null_ls.builtins.formatting.prettier,
            ...
        }
    }
)
```

如果想指定参数，可以参照 stylua 的配置，只需要添加 with 以及 extra_args 即可，这里不再重复赘述了。

除此之外，null-ls 还支持其它很多第三方工具的集成。

参见其 github，不光有代码格式化工具、还有一些诊断工具也是支持的，比如 eslint、pylint 等，配置都和上面差不多，非常简单。

## 选择格式化程序

在上面我们为 Lua 文件配置了 stylua 格式化工具。

但是 Lua 的 LSP 服务器本身也是支持格式化的，所以当你按下 &lt;leader&gt;cf 后，它会询问你使用哪一个格式化工具。

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523231050.png)

这很烦人，我们需要屏蔽掉它。

最好的办法就是在 LSP 配置里的 on_attach 回调函数中告诉 LSP 服务器我不需要你的格式化。

但这会出现一个问题，因为我们的 on_attach 回调函数是所有语言服务器通用的，如果直接在 on_attach 中声明不需要语言服务器本身的格式化时，这意味着其它所有配置的 LSP 服务器自带的格式化程序都将失效。

注意观察 on_attach 回调函数：

```
lsp_config.on_attach = function(client, bufnr)
    -- 这个是公用的按键绑定函数
    M.public_attach_callbackfn(client, bufnr)
end
```

我们是否可以为每一个 LSP 服务器定义一个私有的 on_attach 方法呢？答案是可行的。

将 LSP 服务器私有的 on_attach 回调函数放在公有的 public_attach_callbackfn 函数后执行，如果两者设置有冲突的话那么 LSP 服务器私有的 on_attach 回调函数中的设置会覆盖掉 M.public_attach_callbackfn 公有回调函数中的设置。

好了，开始实施，首先在 lsp/sumneko_lua.lua 文件中添加如下代码：

```
local M = {}

+ M.private_attach_callbackfn = function(client, bufnr)
+    -- disable sumneko format
+    client.resolved_capabilities.document_formatting = false
+    client.resolved_capabilities.document_range_formatting = false
+ end

M.lsp_config =  {
        ...
}
```

然后再到 configure/plugins/nv_nvim-lsp-installer.lua 文件中新增如下代码：

```
else
    -- If it has been downloaded, it can be used directly
    local lsp_config = server_settings.lsp_config
+   local private_attach_callbackfn = server_settings.private_attach_callbackfn

    lsp_config.flags = {
        debounce_text_changes = 150,
    }

    -- Merge public headers with private headers
    lsp_config.handlers = vim.tbl_extend("force", M.lsp_handlers, lsp_config.handlers or {})

    lsp_config.on_attach = function(client, bufnr)
        M.public_attach_callbackfn(client, bufnr)
+       private_attach_callbackfn(client, bufnr)
    end

    -- Start LSP server
    M.lspconfig[server_name].setup(lsp_config)
end
```

大功告成，这样我们保证了每一个 LSP 服务器都能够互不影响，且拥有私有的 on_attach 回调函数，重启 neovim 后再次按下 &lt;leader&gt;cf 格式化后，它将直接使用 stylua 进行格式化。

## fidget

fidget 的配置非常简单，首先在 configure/plugins 目录下创建 nv_fidget.lua 文件：

```
$ touch ~/.config/nvim/lua/configure/plugins/nv_fidget.lua
```

复制粘贴以下代码即可（注意，后面有高亮组配置，在安装完主题后我们会对默认高亮组做一些更改）：

```
-- https://github.com/j-hui/fidget.nvim

local M = {}

function M.before() end

function M.load()
    local ok, m = pcall(require, "fidget")
    if not ok then
        return
    end

    M.fidget = m
    M.fidget.setup({
        window = {
            -- Window transparent
            blend = 0,
        },
    })
end

function M.after() end

return M
```

重启 neovim 后它应该会在右下角提示当前 LSP 服务器的加载进度。

看不清除没关系，是因为我们还没有使用任何主题，后面会解决。

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523232051.png)

更改亮点之后：

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220524000205.png)

## nvim-lightbulb

nvim-lightbulb 的配置很简单。

在 configure/plugins 目录下创建 nv_nvim-lightbulb.lua 文件：

```
$ touch ~/.config/nvim/lua/configure/plugins/nv_nvim-lightbulb.lua
```

复制粘贴以下代码：

```
-- https://github.com/kosayoda/nvim-lightbulb

local icons = require("utils.icons")

local M = {}

function M.before() end

function M.load()
    local ok, m = pcall(require, "nvim-lightbulb")
    if not ok then
        return
    end

    M.nvim_lightbulb = m
    -- Only enable display in symbol column
    M.nvim_lightbulb.setup({
        ignore = {},
        sign = {
            enabled = true,
            priority = 15,
        },
        float = {
            enabled = false,
            text = icons.lsp_hover.Action,
            win_opts = {},
        },
        virtual_text = {
            enabled = false,
            text = icons.lsp_hover.Action,
            hl_mode = "replace",
        },
        status_text = {
            enabled = false,
            text = icons.lsp_hover.Action,
            text_unavailable = "",
        },
    })
end

function M.after()
    -- Set the highlight in the symbol column
    vim.fn.sign_define(
        "LightBulbSign",
        { text = icons.lsp_hover.Action, texthl = "DiagnosticSignWarn", linehl = "", numhl = "" }
    )

    -- Create an autocommand that displays a small light bulb when code actions are available
    vim.api.nvim_create_autocmd({ "CursorHold", "CursorHoldI" }, {
        pattern = { "*" },
        callback = function()
            require("nvim-lightbulb").update_lightbulb()
        end,
    })
end

return M
```

然后到 utils/icons.lua 文件中复制粘贴以下代码：

```

local icons = {}

+ icons.lsp_hover = {
+     Action = "💡",
+ }
```

重启 neovim 后，如果代码操作可用它应该会在行号栏中出现一个小灯泡。

![](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/20220523232846.png)

它所做的事情无非就是在 lsp code action 可用时，将小灯泡的标志放入到行号栏。

此外，当你的光标移除 lsp code action 的范围时取消掉小灯泡的显示，所以你可以看见上面创建了一个 autocmd 的自动事件。



## 添加新的根目录

如果你添加了一些新的 LSP 配置，但这些 LSP 服务器又不支持单文件模式启动那么该怎么快速启动呢？

以 tsserver 为例：

```
M.lsp_config = {
    cmd = { "typescript-language-server", "--stdio" },
    root_dir = function(fname)
        return util.root_pattern("tsconfig.json")(fname)
            or util.root_pattern("package.json", "jsconfig.json", ".git")(fname)
            -- 在 root_dir 里最后一行新增这条代码即可
            -- 如果上面的条件都不满足，则使用当前路径作为 LSP 服务器的启动根路径
            or vim.fn.getcwd()
    end,
    init_options = {
        hostInfo = "neovim",
    },
}
```

如果你想配置更多的 LSP 服务器，可参照 [askfiy/nvim](https://github.com/askfiy/nvim) 中关于 LSP 服务器的配置。
这里不再一一举例。



## 本节结束语

诊断符号这些你其实可以用 [tami5/lspsaga](https://github.com/tami5/lspsaga.nvim) 这款插件来完成。

而查看签名帮助你也可以用 [ray-x/lsp_signature_help](https://github.com/ray-x/lsp_signature.nvim) 这款插件来完成。

但我更愿意自己编写简单的函数来做同样的事情，因为我不需要重新定义 [tami5/lspsaga](https://github.com/tami5/lspsaga.nvim) 里各种高亮组（这款插件默认各种诊断级别的颜色是不一样的，而我喜欢统一风格的颜色，但是重新定义它们很麻烦） 。

而 [ray-x/lsp_signature_help](https://github.com/ray-x/lsp_signature.nvim) 这款插件目前不支持浮窗滚动，而且有很多其它花里胡哨的功能，我不喜欢，所以我没用它们。

好吧，我算是将我所有知道的 LSP 相关的知识都写在这里了。

它可能看起来比较杂乱，但是多看几遍应该能看懂。

最后，看在作者这么用心且无私分享的份上，麻烦点个关注或者在 github 上点个小星星吧。

接下来我也会持续分享各种干货知识。

如果你碰见 LSP 相关配置问题，你可以百度搜索（但很大概率搜索不到，哈哈哈），你也可以直接加我的 QQ 群提问，群号是 978088231，欢迎大家一起吹水。

最后 ... 感谢大家阅读。
