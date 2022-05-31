# 基本配置

关于 manjaro 的安装这里不再赘述了，安装的时候选择闭源驱动无脑下一步即可。

manjaro 我使用的是英文安装，这样可以避免 ~ 家目录中出现中文名称的子目录。

安装完成后，在系统设置、区域设置、语言中添加简体中文语言包，然后在区域选项中选择中文并重新注销即可将语言变更为中文。

![image-20220121213927056](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121213927056.png)

![image-20220121213946958](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121213946958.png)

manjaro 换源，执行以下命令：

```
$ sudo pacman-mirrors -c China
```

添加 archlinuxcn 源，获得更多的包：

```
$ sudo vi /etc/pacman.conf

[archlinuxcn]
SigLevel = Optional TrustAll
Server = https://mirrors.sjtug.sjtu.edu.cn/archlinux-cn/$arch
```

更新系统、软件：

```
$ sudo pacman -Syyu
```

下载 yay AUR 助手，后续更新系统、下载软件等均可以使用 yay 命令代替 pacman 命令：

```
$ sudo pacman -S yay
```

安装 base-devel，yay 命令构建包时会使用到：

```
$ sudo pacman -S base-devel
```

选择性下载常用终端工具：

```
$ sudo pacman -S tree python-pip neovim neofetch screenkey

# tree：玩 Linux 的朋友都知道该命令
# python-pip：Python 用户必备
# neovim：vim 党福音
# neofetch：查看系统信息
# screenkey：显示按下的键
```

将 nvim 设置别名为 vim：

```
$ nvim ~/.zshrc

alias vim="nvim"
```

退出后执行：

```
$ source ~/.zshrc
```

# 安装常用软件

## 输入法配置

安装中文输入法，选择 fcitx 输入法框架：

```
$ sudo pacman -S fcitx-im
$ sudo pacman -S fcitx-contigtool  # 如果 pacman 没下载到，可以在 manjaro 软件商店中手动下载
$ sudo pacman -S fcitx-googlepinyin
```

修改配置文件，开机启动 fcitx：

```
$ vim ~/xprofile

export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

修改配置文件，让程序使用 IM 模块：

```
$ vim ~/.pam_environment

GTK_IM_MODULE DEFAULT=fcitx
QT_IM_MODULE  DEFAULT=fcitx
XMODIFIERS    DEFAULT=@im=fcitx
```

注销当前用户，重新登录后在左下角的启动菜单中找到 fcitx 配置。

单击左下角的 + 号键，取消勾选仅显示当前语言，在下面输入框中搜索 google 并添加 google 拼音。

![image-20220121214251199](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121214251199.png)

不出意外的话，Ctrl + Space 已经能够切换输入法了。然后你可以打开配置项将上下翻页配置为 , 和 . 。

![image-20220121214347896](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121214347896.png)

## clash GUI

clash 是一款非常强大的上网神器，现在在 Linux 平台下也推出了 GUI 版本。

访问 githu ，选择 tar.gz 格式下载。

- [点我跳转](https://github.com/Fndroid/clash_for_windows_pkg/releases)

下载完成后，将其解压到 /usr/local 目录下：

```
$ sudo tar -xvf ~/Downloads/Clash.for.Windows-0.19.5-x64-linux.tar.gz -C /usr/local
$ sudo mv /usr/local/Clash\ for\ Windows-0.19.5-x64-linux /usr/local/clash
```

解压后，使用以下命令运行 clash，点击 proxies 添加订阅链接：

```
$ /usr/local/clash/cfw
```

点击 general 勾选 allow lan、tun mode、mixin、start with linux 等选项。

![image-20220121214416293](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121214416293.png)

在系统设置中，手动添加全局代理 127.0.0.1:7890。

![image-20220121214459511](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121214459511.png)

注意！Mozilla 系列软件是不会直接走系统代理的，如 firefox、thunderbird 等都需要在 settings 中使用手动设置代理。

![image-20220121214543935](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121214543935.png)

接下来添加终端代理，在 ~/.zshrc 中添加以下命令：

```
alias setproxy="export ALL_PROXY=socks5://127.0.0.1:7890; echo 'SET PROXY SUCCESS!!!'"
alias unsetproxy="unset ALL_PROXY; echo 'UNSET PROXY SUCCESS!!!'"
# 打开终端自动开启代理
setproxy
```

source 一下 zshrc 文件，并输入 setproxy 命令即可打开代理。

验证代理是否生效，可输入以下命令并观察请求是否先发送至 127.0.0.1:7890 处：

```
$ curl -vv http://www.youtube.com/
```

由于是 tar.gz 安装，所以安装完成后没有可视化的启动程序。

我们自建一个启动程序，在 ~/.local/share/applications 下新建以下文件，提前下载好一个 PNG 格式的 clash 图标放在安装目录下：

```
$ vim ~/.local/share/applications/clash.desktop

[Desktop Entry]
Type=Application
Name=Clash For Linux
Exec=/usr/local/clash/cfw
Icon=/usr/local/clash/clash.png
Terminal=false
Categories=program;InstantMessaging
```

## chrome

安装 chrome：

```
$ yay -S google-chrome
```

## 网易云音乐

安装网易云音乐：

```
$ sudo pacman -S netease-cloud-music
```

## WPS

安装 WPS：

```
$ yay -S ttf-wps-fonts wps-office-mui-zh-cn wps-office-mime-cn wps-office-cn
$ yay -S wps-office-fonts ttf-ms-fonts
```

## 百度网盘

安装百度网盘，选择第 2 个基于 electron 的版本：

```
$ yay -S baidunetdisk
```

## 微信

安装微信：

```
$ yay -S deepin-wine-wechat
```

个人遇到了 2 个 BUG，其一是微信字体会显示方框，解决办法参见下面链接中 3 楼给出的方案：

- [点我跳转](https://github.com/vufa/deepin-wine-wechat-arch/issues/94)

第二个 BUG 是微信运行时会显示：

程序 WeChatApp.exe 遇到严重问题需要关闭。我们对此造成的不便表示抱歉。

其实这个 BUG 不影响使用，但是看着心烦，解决办法是先运行如下命令：

```
/opt/apps/com.qq.weixin.deepin/files/run.sh winecfg
```

然后选择函数库选项卡，新增函数库顶替的输入框中中输入 wechatapp.exe ，点击右侧添加，选择新建好的 wechatapp.exe，点击编辑，选择停用即可。

![image-20220122232944589](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122232944589.png)

## QQ

安装 QQ：

```
$ yay -S deepin-wine-qq
```

## 腾讯会议

安装腾讯会议：

```
$ yay -S wemeet
```

目前版本有些小 BUG，但能忍受，将就使用吧。

## teamviewer

安装 teamviewer：

```
$ yay -S teamviewer
```

## 火焰截图

安装 flameshot：

```
$ sudo pacman -S flameshot
```

安装完成后需要配置快捷键，打开系统设置，快捷键，在右侧添加应用程序，自己定义一个快捷键：

![image-20220121214712441](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121214712441.png)

flameshort 默认就是开机启动，此外图片存放在 ~/Pictures 目录中。

## peek

安装 peek：

```
$ sudo pacman -S peek
```

不管是 Linux、Mac、Windows 上再也没有比 peek 录制 GIF 更简单的软件了，强烈推荐。

## Typora

Typora 最新版已经收费，可以在官网下载以前的版本并手动安装，下面是最后一个免费版本：

- [点我跳转](https://download.typora.io/linux/Typora-linux-x64-1.0.3.tar.gz)

下载完成后手动安装：

```
$ sudo tar -xvf ~/Downloads/Typora-linux-x64-1.0.3.tar.gz -C /usr/local
$ sudo mv /usr/local/bin/Typora-linux-x64 /usr/local/typora
```

添加可视化启动程序，在 ~/.local/share/applications 下新建以下文件，Typora 内部自己有 PNG 图片，所以不需要额外下载，直接复制粘贴以下内容即可：

```
$ vim ~/.local/share/applications/typora.desktop

[Desktop Entry]
Type=Application
Name=Typora
Exec=/usr/local/typora/Typora
Icon=/usr/local/typora/resources/assets/icon/icon_512x512@2x.png
Terminal=false
Categories=program;InstantMessaging
```

## Picgo

Typora 安装好后，再继续安装 picgo，可直接使用 yay 命令下载：

```
$ yay -S picgo-appimage
```

如果可以直接安装就直接使用。我这里自动安装出现了问题，所以又需要手动安装了。

先到 picgo 的 github 中下载 AppImage 后缀的包，然后双击安装即可。

- [点我跳转](https://github.com/Molunerfinn/PicGo/releases)

在 typora 中，设置图片上传服务：

![image-20220122141707838](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122141707838.png)

如果 picgo 图片上传失败，请将 COS 版本切换为 V5 再次尝试。

## virtualbox

安装 virtualbox：

```
# 查看内核版本
$ mhwd-kernel -li
Currently running: 5.15.12-1-MANJARO (linux515)
The following kernels are installed in your system:
   * linux515
# 安装 virtualbox 时注意下面的 515 替换成你的版本
$ sudo pacman -Syu virtualbox linux515-virtualbox-host-modules

# 查看 Virtualbox 版本
$ vboxmanage --version
6.1.30r148432

# 安装拓展包，选择跟 Virtualbox 版本号一致的
$ yay virtualbox-ext-oracle
```

## APIPost

后端开发人员必备的一款接口测试工具：

```
$ yay -S apipost
```

## 转换 deb 包

可能一些软件需要我们手动转换 deb 包后安装，这时候就需要 debtab 工具来转换。

安装 debtab：

```
$ sudo pacman -S debtap
```

更新 debtab：

```
$ sudo debtap -u
```

下载好待转换的 deb 包，将其转换，以下步骤一路回车即可：

```
$ sudo debtap ~/Downloads/包名.deb
```

安装转换后的包：

```
$ sudo pacman -U ~/Downloads/包名.pkg.tar.zst
```

# 搭建开发环境

## proxychains

不知为何，在 manjaro 终端中执行某些命令并不会进行代理。

所以这里安装了一款 proxychains 终端命令，他能够让后续命令强制走代理：

```
$ yay -S proxychains
```

安装完成后，需要进行配置：

```
$ sudo nvim /etc/proxychains.conf
```

直接按下大 G，编辑最后一行为你的代理 IP 和 PORT。

![image-20220121214948178](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121214948178.png)

后续如果要使用代理，只需要向下面这样做：

```
$ proxychains command
```

## git

配置 git 用户名、密码、代理 ：

```
$ git config --global user.name <用户名>
$ git config --global user.email <邮箱地址>
$ git config --global http.proxy socks5://127.0.0.1:7890
$ git config --global https.proxy socks5://127.0.0.1:7890
```

添加 SSH：

```
$ ssh-keygen # 疯狂回车
```

拷贝公钥 ~/.ssh/id_rsa.pub 中的内容，到 github 中添加 ssh keys 即可。

## oh my zsh

manjaro KDE 自带了 zsh，所以可以直接安装 oh my zsh：

```
$ proxychains wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | sh
```

安装完成后需要重新将自定义的 alias 命令重新加入：

```
# 自定义配置
alias vim="nvim"
alias setproxy="export ALL_PROXY=socks5://127.0.0.1:7890; echo 'SET PROXY SUCCESS!!!'"
alias unsetproxy="unset ALL_PROXY; echo 'UNSET PROXY SUCCESS!!!'"
# 打开终端自动开启代理
setproxy
```

更改一下默认 shell 为 zsh：

```
$ chsh -s /usr/bin/zsh
$ zsh
```

下载插件：

```
# 自动补全
$ git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions

# 语法高亮
$ git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting

# zsh-vi-mod
$ git clone https://github.com/jeffreytse/zsh-vi-mode $ZSH_CUSTOM/plugins/zsh-vi-mode
```

打开 ~/.zshrc 找到 plugins 将它改成下面这样：

```
plugins=(
    git
    zsh-syntax-highlighting
    zsh-autosuggestions
    zsh-vi-mode
    colored-man-pages
)
```

打开 ~/.zshrc 文件，修改 ZSH_THEME，更多样式可参见 https://github.com/ohmyzsh/ohmyzsh/wiki/Themes：

```
ZSH_THEME="bira"
```

安装 autojump，终端目录跳转神器：

```
$ git clone git://github.com/joelthelion/autojump.git
$ cd autojump
$ ./install.py
$ cd ..
$ rm -rf autojump
```

打开 ~/.zshrc 在末尾添加：

```
[[ -s ~/.autojump/etc/profile.d/autojump.sh ]] && . ~/.autojump/etc/profile.d/autojump.sh
```

后续想跳转到之前所在目录，可直接按下 j tab 键来选择。

## NVM

个人会使用 Node.js 进行开发，所以需要安装 NVM 来方便管理多个 Node 版本。

下载 NVM：

```
$ sudo pacman -S nvm
```

创建 .nvm 目录：

```
$ mkdir ~/.nvm
```

在 ~/.zshrc 文件中添加下面的内容：

```
# nvm 配置
source /usr/share/nvm/init-nvm.sh
# 修改nvm下载源为taobao镜像源
export NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node
export NVM_IOJS_ORG_MIRROR=http://npm.taobao.org/mirrors/iojs
```

source 一下文件后开始下载 Node，个人会用 2 个版本的 Node：

```
$ nvm install --lts
$ nvm install 10.24.1
```

取别名：

```
$ nvm alias default 10.24.1
$ nvm alias new 16.13.2
```

## Golang

个人会使用 Golang 进行开发，所以下面会安装 Go 语言。

安装 Go 语言：

```
$ sudo pacman -S go
```

在 ~/.zshrc 中进行设置：

```
export GOROOT=/usr/lib/go/
export GO111MODULE=on
export GOPROXY="https://proxy.golang.org,direct"
export PATH=$PATH:$GOROOT/bin
```

## Python

个人会使用 Python 进行开发，manjaro 自带 Python3，而且版本非常新，所以下面会直接配置 Python 的虚拟环境。

安装 virtualenv 和 virtualenvwrapper：

```
$ pip3 install -i https://pypi.douban.com/simple virtualenv
$ pip3 install -i https://pypi.douban.com/simple virtualenvwrapper
```

创建虚拟环境目录：

```
$ mkdir ~/.virtualenvs
```

编辑 ~/.zshrc 文件，加入下面 2 行代码：

```
$ vim ~/.zshrc

export WORKON_HOME="~/.virtualenvs"
source ~/.local/bin/virtualenvwrapper.sh
```

source ~/.zshrc 文件后，修改 pip 源，创建 pip 配置文件文件并填入以下内容：

```
$ mkdir ~/.pip
$ vim ~/.pip/pip.conf

[global]
index-url = https://mirrors.aliyun.com/pypi/simple
```

## gitbook

安装 gitbook：

```
$ proxychains npm i -g gitbook-cli
```

## docsfiy

安装 docsfiy：

```
$ proxychains npm i -g docsify-cli
```

## vscode

安装 vscode:

```
$ yay -S visual-studio-code-bin
```

再下载一个 fire code 字体，开发人员最喜欢的字体没有之一：

```
$ yay -S ttf-fira-code
```

arch 系的 Linux 无法保存 vscode 里 github 的登录状态，需要下载一个插件进行解决：

```
$ yay -S qtkeychain gnome-keyring
```

## nvim

nvim 个人使用非常多，地表最强编辑器。

首先新建 nvim 的配置目录：

```
$ mkdir ~/.config/nvim
```

下载 vim-plug 插件：

```
$ curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs \
    https://gitee.com/c4pr1c3/vim-plug/raw/master/plug.vim
```

由于我经常会使用系统剪切板，但 nvim 的剪切板和系统剪切板不互通，所以还需要安装一个插件让 nvim 和系统的剪切板互通：

```
$ sudo pacman -S xsel
```

书写 nvim 的配置文件，以下是一些基础配置，可酌情修改：

```
$ vim ~/.config/nvim/init.vim

" ----- Plug -----
call plug#begin('~/.config/nvim/autoload/')
" 快速跳转
Plug 'easymotion/vim-easymotion'
" 包裹修改
Plug 'tpope/vim-surround'
" vim中文文档
Plug 'yianwillis/vimcdoc'
" 颜色插件
Plug 'theniceboy/vim-deus'
" 包裹修改
Plug 'tpope/vim-surround'
" 多光标模式操作
Plug 'mg979/vim-visual-multi', {'branch': 'master'}
" vim 切换
Plug 'vim-scripts/Toggle'
call plug#end()

"按键映射前缀: <leader>v。
let g:VM_maps = {}                 "取消默认按键映射。
let g:VM_maps['Find Under'] = 'gb' "进入多光标模式并选中光标下字符串。

" 使用系统剪切板
set clipboard^=unnamed,unnamedplus
" 始终都会加载的配置项
let mapleader = "\<space>"
set nobackup
set noswapfile

" 用H替换掉^
noremap H ^
" 用L替换掉$
noremap L $
" 前一个字和后一个字切换
noremap ge "_yiw:s/\(\%#\w\+\)\(\_W\+\)\(\w\+\)/\3\2\1/<CR><C-o>:noh<CR>
" 前一个词和后一个词切换
noremap gw xph

" 切换单词的反意，如将 true 改为 false
imap <C-T> <C-O>:call Toggle()<CR>
nmap gq :call Toggle()<CR>
vmap + <ESC>:call Toggle()<CR>

" 增加一个空行
nmap <leader>j o<Esc>
nmap <leader>k O<Esc>

" 自动切换输入法
autocmd InsertLeave * call Fcitx2en()
function! Fcitx2en()
    let s:input_status=system("fcitx-remote")
    if s:input_status==2
        let g:input_toggle=1
        let l:a=system("fcitx-remote -c")
    endif
endfunction

" 显示行号
set number
" 设置相对行号
set relativenumber
" 设置行宽
set textwidth=80
" 设置自动换行
set wrap
" 是否显示状态栏
set laststatus=2
" 语法高亮
syntax on
" 支持鼠标
" set mouse=a
" 设置编码格式
set encoding=utf-8
" 启用256色
set t_Co=256
" 开启文件类型检查
filetype indent on
" 设置自动缩进
set autoindent
" 设置tab缩进数量
set tabstop=4
" 设置>>与<<的缩进数量
set shiftwidth=4
" 将缩进转换为空格
set expandtab
" 自动高亮匹配符号
set showmatch
" 自动高亮匹配搜索结果
set nohlsearch
" 开启逐行搜索，也就是说按下一次按键就继续一次搜索
set incsearch
" 开启类型检查
" set spell spelllang
" 开启命令补全
set wildmenu
" 多窗口下光标移动到其他窗口时自动切换工作目录
set autochdir
```

打开 vim ，按下冒号键，输入 PlugInstall 下载 vim 插件。

# 美化 KDE 桌面

## 结果展示

![image-20220123001510586](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220123001510586.png)

![image-20220123001645408](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220123001645408.png)

## osc-url

由于 manjaro 的系统设置是不走代理的，所以我们可以通过 osc-url 在 KDE Store https://store.kde.org/browse 中在线下载主题并自动安装。

先安装下面的内容：

```
$ sudo pacman -S qt5-base qt5-svg qt5-declarative qt5-quickcontrols
```

下载 ocs-url：[点我跳转](https://www.opendesktop.org/p/1136805/)

![image-20220121225129399](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220121225129399.png)

下载完成后手动安装：

```
$ sudo pacman -U ~/Downloads/ocs-url-3.1.0-1-x86_64.pkg.tar.xz
```

后续点击主题的 install 按钮后，会跳出是否打开 xdg-open，选择打开并安装主题就 OK 了。

也可以下载主题的压缩包，然后解压到下面的目录中：

```
~/.local/share/plasma/look-and-feel/  # 存放全局主题
~/.local/share/plasma/desktoptheme/   # 存放 plasma 主题
~/.local/share/plasma/plasmoids/      # 存放插件
~/.local/share/aurorae/themes/		  # 存放窗口装饰
~/.local/share/color-schemes/		  # 存放颜色
~/.local/share/icons/				  # 存放图标
~/.local/share/fonts/				  # 存放字体
~/.local/share/sddm/themes/			  # 欢迎屏幕
~/.local/share/backgrounds/			  # 壁纸
```

## 全局主题

全局主题使用的是 WhiteSur-dark。

https://www.pling.com/p/1400424

![image-20220122224512572](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122224512572.png)

下载完成后打开系统设置，外观，全局主题中应用：

![image-20220122225253967](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225253967.png)

## 应用程序风格

应用程序风格使用的系统自带的 Oxygen 轻氧。

![image-20220122225137840](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225137840.png)

# 视觉风格

视觉风格使用的是 ChromeOS：

https://www.pling.com/p/1354050

![image-20220122225110136](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225110136.png)

## 窗口装饰

窗口装饰使用的是 WhiteSur-Sharp-dark：

![image-20220122225054592](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225054592.png)

注意，标题栏上按钮位置可以拖动到左侧：

![image-20220122225940419](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225940419.png)

## 颜色设置

颜色使用的是 WhiteSur：

![image-20220122225035031](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225035031.png)

## 字体样式

字体使用的系统默认字体，当然你也可以选择其他字体使用：

![image-20220122225441696](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225441696.png)

## 图标样式

图标样式使用的是 WhiteSur-dark：

![image-20220122225903787](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225903787.png)

## 光标样式

光标样式使用的是 Volantes Cursors：

https://store.kde.org/p/1356095

![image-20220122225709085](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225709085.png)

## 欢迎屏幕

欢迎屏幕使用的是自带的 Breath Dark：

![image-20220122225831442](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122225831442.png)

## 特效相关

特效相关设置是在 工作区行为/桌面特效中。

![image-20220122230059115](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230059115.png)

![image-20220122230125231](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230125231.png)

![image-20220122230158463](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230158463.png)

![image-20220122230224769](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230224769.png)

![image-20220122230251818](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230251818.png)

## dock

下载 latte-dock：

```
sudo pacman -S latte-dock
```

启动 dock ：

```
latte-dock
```

删除 manjaro 面板菜单。

右击 dock 栏，配置 latte、选择布局编辑器，选择 extended。

![image-20220122150546765](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122150546765.png)

右击 dock 栏，编辑停靠栏、点击高级。

![image-20220122230451043](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230451043.png)

![image-20220122230523736](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230523736.png)

![image-20220122230542006](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230542006.png)

![image-20220122230602121](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230602121.png)

## 系统托盘

当打开一个应用之后，可以在 dock 栏中右击该应用的图标，然后将其固定在 dock 栏上。

我们还需要一个类似 MAC 系统的 launchpad 程序，可以右击 dock 栏然后添加部件，选择右边的 Get New Widgets：

![image-20220122230839478](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122230839478.png)

搜索 OSXLaunchpad 下载并添加，然后将它添加到 dock 栏上。

添加完成后，在 OSXLaunchpad 上单击右键，然后配置 OSXLaunchpad 向下面这样设置：

![image-20220122231217315](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122231217315.png)

图标可以搜索 ibus-typing-booster 并选择。

## 界面圆角

第三方的圆角插件 LightlyShaders，相较于内置的圆角插件来说它更美观。

https://github.com/a-parhom/LightlyShaders

按照 README 文档安装好后，到系统设置、工作区行为、桌面特效中打开 LightlyShaders 的设置项：

![image-20220122231448516](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122231448516.png)

## KDE 插件

最后推荐 1 个 KDE 的小插件， 翻译插件 Translator：

- https://store.kde.org/p/1395666

直接在顶部面板添加小部件中选中它并添加。

可以把内置应用 Yukauke 也添加到小部件中，然后在上方的面板中添加。

![image-20220122232053517](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/image-20220122232053517.png)

# pacman（yay）常用命令

记录一下 pacman 与 yay 的常用命令，都是通用的：

- Sy：从远程镜像获取软件包更新信息
- Syy：强制获取更新信息
- Syyu：更新软件包
- Sc：删除以下载的过时安装包
- Syyw：下载较新的软件包，但不安装
- Ss：从远程仓库中搜索软件包
- R：删除软件
- Rs：删除软件及其依赖文件
- Rns：删除软件和依赖文件及其配置文件
- Qe：显示用户安装的软件包
- Qq：不输出软件的版本信息
- Qn：显示从官方镜像中下载的软件
- Qm：显示从 AUR 中下载的软件
- Qdt：显示孤包
- Qs：显示本地库的包

最后常运行 -Syu 进行系统更新就行，太久不更新容易滚挂。
