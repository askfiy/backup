# packer

## 简介

packer 是一款由 Lua 语言编写的 neovim 插件管理器。

它最大的优点是支持结构化配置，能够以非常简单的办法实现延迟加载。

你可以 [点我](https://github.com/wbthomason/packer.nvim) 访问 packer 的 github 获得更多信息。

## 使用

packer 的使用非常简单，首先 clone 它：

```
git clone --depth 1 https://github.com/wbthomason/packer.nvim\
 ~/.local/share/nvim/site/pack/packer/start/packer.nvim
```

然后我们可以到 ~/.config/nvim/lua/core/plugins.lua 文件中书写以下代码下载插件（注意，这里先不要粘贴它，因为我们后面会对 packer 做封装）：

```
return require("packer").startup(function()
    -- 第一个插件
    use "wbthomason/packer.nvim"

    -- 第二个插件
    use {
            "askfiy/nvim-picgo",   -- 插件地址
            as = "picgo",          -- 给插件取别名
            opt = true,            -- 是否可选
            cmd = {"UploadImage"}, -- 执行以下命令时才会加载插件
            setup = function()     -- 插件加载前执行的代码
                print("before ..")
            end,
            config = function()    -- 插件加载完成后执行的代码
                print("load ..")
            end
    }

    -- 第三个插件
    use {
         "nvim-treesitter/nvim-treesitter",
         run = ":TSUpdate", -- 插件下载或更新后自动运行的代码
         commit = "96cdf2937491fbc", -- 使用体定提交记录的插件
    }
end)
```

packer 为 neovim 的命令行提供了一些命令，其实只需要记住下面这一条即可：

```
:PackerSync -- 下载、更新、删除插件
```

要删除插件，只需要在 ~/.config/nvim/lua/core/plugins.lua 文件中注释掉插件再运行以上命令就好。



## 延迟加载

packer 支持延迟加载插件，所谓延迟加载就是在特定的情况下才加载该插件。

这意味着使用 packer 管理 neovim 插件时，neovim 并不会因为插件数量的增多而变得臃肿不堪。

下面是一些延迟加载的例子，多个延迟加载的条件可以组合在一起，只有所有条件满足时才加载该插件：

```
    use {
       "askfiy/test-plugin",
       -- 当 plugin1 和 plugin2 加载完成后才加载该插件
       after = {"plugin1", "plugin2"},
       -- 运行 :Test1 或 :Test2 时才加载该插件
       cmd = {"Test1", "Test2"},
       -- 打开 python 文件或 lua 文件时加载该插件
       ft = {"python", "lua"},
       -- 按下以下任意一个按键时才加载该插件
       keys = {"<leader>pt", "<leader>pr"},
       -- 当以下任意一个事件被触发时才加载该插件
       event = {"BufEnter" },
       -- 当执行以下任意一个函数时才加载该插件
       fn = {"test#fn1", "test#fn2"},
       -- 当使用 require 加载以下任意模块时才加载该插件
       module = {"test-plugin"},
    }
```

后面我们会为 nv-minIDE 的所有插件做延迟加载，力求在 50 毫秒内启动 neovim。

## 自动加载配置文件

我们可以注意到 packer 对每一个插件的加载都提供了 2 个 hooks，分别是 setup 和 config。

它们可以是函数：

```
use {
    "askfiy/test-plugin",
    setup = function()
        print("before ..")
        require("configure/plugins/nv_test-plugin").before()
    end,
    config = function()
        print("load ..")
        require("configure/plugins/nv_test-plugin").load()
    end
}
```

也可以是字符串：

```
use {
    "askfiy/test-plugin",
    setup = "require('configure/plugins/nv_test-plugin').before",
    config = "require('configure/plugins/nv_test-plugin').load"
}
```

当插件很多时，你可能会看到下面这样的情形：

```

use {
    "askfiy/test-plugin1",
    setup = "require('configure/plugins/nv_test-plugin1').before",
    config = "require('configure/plugins/nv_test-plugin1').load()"
}


use {
    "askfiy/test-plugin2",
    setup = "require('configure/plugins/nv_test-plugin2').before()",
    config = "require('configure/plugins/nv_test-plugin2').load()"
}


use {
    "askfiy/test-plugin3",
    setup = "require('configure/plugins/nv_test-plugin3').before()",
    config = "require('configure/plugins/nv_test-plugin3').load()"
}
```

我们的目录规划中是将所有插件配置文件存放在 lua/configure/plugins 目录下。

所以我们可以自己编写一个函数，让他判断 lua/configure/plugins 目录下是否具有插件的配置文件，如果有则自动加载。

## Packer 的封装

每一个插件都需要使用 use，这很麻烦。我们可以对 packer 做一些封装。

伪代码如下所示：

```
插件列表 = {
    ["插件地址"] = {
        延迟加载项目 ...
    },
    ["插件地址"] = {
        延迟加载项目 ...
    },
    ["插件地址"] = {
        延迟加载项目 ...
    },
}

循环插件列表的 key 和 value
    插件配置 = {插件key, value} 的合并
    判断是否在 lua/configure/plugins 中存在插件配置文件
    如果存在
        插件配置.setup = "插件配置文件中的 before 函数"
        插件配置.config = "插件配置文件中的 load 函数 和 after 函数"
    use(插件配置)
```

## 插件的加载顺序

注意，在选定的 32 个插件中，有某些插件是由 viml 编写的。 而大部分所选定的插件都是由 Lua 编写的。

viml 插件编写的配置不需要在 hooks config 中处理，这样会造成一些 lazy load 的问题。

而是应该放在 hooks setup 中处理。

我们可以在插件配置中手动定义一个 key 来判断插件的类型。

```
插件列表 = {
    ["插件地址"] = {
        ptp = viml,   -- plugin type 的缩写
        延迟加载项目 ...
    },
    ["插件地址"] = {
        延迟加载项目 ...
    },
    ["插件地址"] = {
        延迟加载项目 ...
    },
}
```

伪代码也需要做出一些更改：

```
循环插件列表的 key 和 value
    插件配置 = {插件key, value} 的合并
    判断是否在 lua/configure/plugins 中存在插件配置文件
    如果存在
        判断插件类型是否是 viml
           是：
                插件配置.setup = "插件配置文件中的 entrance 函数"
           不是：
               插件配置.setup = "插件配置文件中的 before 函数"
               插件配置.config = "插件配置文件中的 load 函数 和 after 函数"
    use(插件配置)
```

## 插件配置文件

现在，viml 编写的插件配置文件模板是：

```
local M = {}

function M.entrance()
    配置选项
end

return M
```

Lua 编写的插件配置文件模板是：

```
local M = {}

function M.before() end

function M.load()
    local ok, m = pcall(require, "m")
    if not ok then
        return
    end

    M.m = m
    M.m.setup({config})
end

function M.after() end

return M
```

## plugins.lua

先编写 plugins.lua 文件的代码，复制粘贴以下内容。

```
-- 先导入 options 用户设置文件，后面可能会用到
local options = require("core.options")
local path = require("utils.api.path")

local packer_install_tbl = {
    ["wbthomason/packer.nvim"] = {},
}

-- 检查是否下载了 Packer，如果没有则自动下载
Packer_bootstrap = (function()
    local packer_install_path = path.join(vim.fn.stdpath("data"), "site/pack/packer/start/packer.nvim")
    ---@diagnostic disable-next-line: missing-parameter
    if vim.fn.empty(vim.fn.glob(packer_install_path)) > 0 then
        local rtp_addition = string.format("%s/site/pack/*/start/*", vim.fn.stdpath("data"))
        vim.notify("Please wait ...\nInstalling packer package manager ...", "info", { title = "Packer" })
        if not string.find(vim.o.runtimepath, rtp_addition) then
            vim.o.runtimepath = string.format("%s,%s", rtp_addition, vim.o.runtimepath)
        end
        return vim.fn.system({
            "git",
            "clone",
            "--depth",
            "1",
            "https://github.com/wbthomason/packer.nvim",
            packer_install_path,
        })
    end
end)()

local packer = require("packer")

-- 如果你访问 github 太慢，可以替换成镜像源
packer.init({
    git = {
        -- For Chinese users, if the download is slow, you can switch to the github mirror source
        -- replace : https://hub.fastgit.xyz/%s
        default_url_format = "https://github.com/%s",
    },
})

packer.startup({
    function(use)
        for plug_name, plug_config in pairs(packer_install_tbl) do
            -- 定义新的插件配置文件，其实就是将 key 和 value 合并了
            local plug_options = vim.tbl_extend("force", { plug_name }, plug_config)

            -- 这里就是插件配置文件在磁盘中的路径，以 nv_ 开头，比如插件名称是 test_plugin
            -- 那么它的配置文件名称就是 nv_test_plugin.lua，注意是全小写的
            local plug_filename = plug_options.as or string.match(plug_name, "/([%w-_]+).?")
            local load_disk_path = path.join("configure", "plugins", string.format("nv_%s", plug_filename:lower()))
            local file_disk_path = path.join(vim.fn.stdpath("config"), "lua", string.format("%s.lua", load_disk_path))

            -- 查看磁盘中该文件是否存在
            if path.is_exists(file_disk_path) then
                -- 判断插件类型
                if plug_config.ptp == "viml" then
                    plug_options.setup = string.format("require('%s').entrance()", load_disk_path)
                else
                    plug_options.setup = string.format("require('%s').before()", load_disk_path)
                    plug_options.config = string.format(
                        [[
                        require('%s').load()
                        require('%s').after()
                        ]],
                        load_disk_path,
                        load_disk_path
                    )
                end
            end
            use(plug_options)
        end
        if Packer_bootstrap then
            -- 第一次打开 neovim 时自动下载插件
            packer.sync()
        end
    end,
    -- 使用浮动窗口预览 packer 中插件的下载信息
    config = { display = { open_fn = require("packer.util").float } },
})

-- 创建一个自动命令，如果该文件被更改，则重新生成编译文件
local packer_user_config = vim.api.nvim_create_augroup("packer_user_config", { clear = true })

vim.api.nvim_create_autocmd({ "BufWritePre" }, {
    pattern = { "plugins.lua" },
    callback = function()
        vim.cmd("source <afile>")
        vim.cmd("PackerCompile")
        vim.pretty_print("Recompile plugins successify...")
    end,
    group = packer_user_config,
})

return packer
```



## 安装第一个插件

说了这么多不如动手实操一次，首先安装自动括号补全插件。

在 plugins.lua 的 packer_install_tbl 表中添加以下代码，我将它归类到了代码编辑插件类中，该插件会在进入插入模式后加载：

```
local packer_install_tbl = {
    ["wbthomason/packer.nvim"] = {},
	 ----------- Code Editor -----------
    ["windwp/nvim-autopairs"] = { -- autocomplete parentheses
        event = { "InsertEnter" },
    },
}
```

在 configure/plugins 目录中新建 nv_nvim-autopairs.lua 文件，填入以下配置：

```
-- https://github.com/windwp/nvim-autopairs

local M = {}

function M.before() end

function M.load()
    local ok, m = pcall(require, "nvim-autopairs")
    if not ok then
        return
    end

    M.nvim_autopairs = m
    M.nvim_autopairs.setup()
end

function M.after() end

return M
```

重启 neovim 完成后在命令行输入 :PackerSync 即可完成安装。

