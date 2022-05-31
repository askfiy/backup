# dwm

## 基础设置

### 准备工作

下载依赖：

```
yay -S xorg-xinit feh udisks2 udiskie pcmanfm
```

安装 nerd font 字体，选择 agave，我使用的是这个。

下载完成后解压并安装即可。

```
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v2.1.0/Agave.zip
```

下载其它依赖：

```
yay -S libxft-bgra
yay -S noto-fonts-emoji
```

将 udisks2 设置为开机自启动，这样能够自动识别插入的 U 盘：

```
sudo systemctl enable udisks2
```

### 安装 dwm

下载 dwm：

```
cd ~/Downloads/
git clone https://github.com/askfiy/dwm.git
```

我的 dwm 使用的 alacritty 终端：

```
yay -S alacritty-git
```

安装 dwm：

```
sudo make clean install
```

下载 st 和 dmenu 并安装：

```
$ git clone https://git.suckless.org/st
$ git clone https://git.suckless.org/dmenu
$ cd st
$ sudo make clean install
$ cd ../dmenu
$ sudo make clean install
```

### 配置启动脚本

在　 dwm.c 中我设定了 1 个脚本：

```
runAutostart(void) {
	system("cd ~/.dwm; ./autostart.sh &");
}
```

所以你可以在 ~ 目录下　 clone 一下脚本：
```
cd ~
git clone https://github.com/askfiy/dwm.git
```

### 启动 dwm

修改系统默认进入文字界面：

打开文件 /etc/default/grub，做如下修改：

```
sudo nvim /etc/default/grub

# GRUB_CMDLINE_LINUX_DEFAULT="quiet apparmor=1 security=apparmor udev.log_priority=3"
GRUB_CMDLINE_LINUX_DEFAULT="text"
```

执行命令：

```
$ sudo update-grub
```

修改启动等级：

```
$ systemctl set-default multi-user.target

// 如果想改回启动图形界面执行下面
$ systemctl set-default graphical.target
```

备份 ~/.xinitrc 文件：

```
mv ~/.xinitrc ~/.xinitrc.bak
```

拷贝一份 xinitrc 文件并做修改：

```
cp /etc/X11/xinit/xinitrc ~/.xinitrc
```

修改内容：

```

+ exec dwm

# 注释下面的
# twm &
# xclock -geometry 50x50-1+1 &
# xterm -geometry 80x50+494+51 &
# xterm -geometry 80x20+494-0 &
# exec xterm -geometry 80x66+0+0 -name login
```

重启后输入密码，即可进入 dwm：

```
reboot

startx
```

### dwm 介绍

dwm 配置文件 config.h 主要分为几个大块：

```
appearance：颜色、边框间距、字体等
tagging：标签区域设置
layout：布局相关
key definitions：按键区
```

按键介绍：

```
mod 键： Super（win）
```

默认按键：

```
super + p：打开 dmenu
super + shift + enter：打开终端（我这里设置的是 alacritty）
super + b：切换状态栏可见性
super + j：切换下一个 stack
super + k：切换上一个 stack
super + i：切换上一种平铺方式
super + d：切换下一种平铺方式
super + h：增加或减少 master 区域范围
super + l：增加或减少 master 区域范围
super + enter：将当前区域置为 master 区域（与原本 master 互换）
super + tab：将所有 tag 上的应用程序集中显示
super + shift + c：关闭当前 master 应用程序（已经改为 super+c）
super + t：切换默认布局
super + f：切换浮动布局
super + m：切换全屏布局
super + g：（自定义）切换网格布局
super + space：全屏当前程序
super + shift + space：将当前 master 下方程序缩小
super + 0：（自定义）：查看所有 tag
super + shift + 0：显示所有 tag
super + 数字：跳转到特定 tag
super + shift + 数字：带上当前 master 程序，跳转到指定的 tag
super + shift + q：（自定义）连按两次，退出 dwm
```

## 状态栏设置

```
yay -S dunst
yay -S notify-send # 有就不装了
yay -S calcurse
yay -S pamixer
yay -S nmclient
```

