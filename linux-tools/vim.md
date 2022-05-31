# vim 奇淫巧技：

## normal 模式

- q: ： 进入 ex 模式，按下 &lt;C-c&gt; 选择命令
- @: ： 运行上一次的 ex 命令
- ga ： 显示 ascii 码
- gf ： 跳转到目标文件
- gx ： 打开光标下的链接
- gj ： 折行向下移动
- gk ： 折行向上移动
- gm ： 折行向下移动
- gv ： 选择上一次 visual
- nG ： 跳转到指定行（n 代表行）
- '&lt; 和 '&gt; ： 光标跳转到上一次 visual 开始和结束的行
- shift-{ ： 快速跳转函数
- shift-} ： 快速跳转函数
- &lt;c-w&gt;p ： 跳转到上次光标所在的分屏
- &lt;c-w&gt;w ： 跳转窗口（可以聚焦到一些浮动窗口上）
- &lt;c-w&gt;x ： 交换 2 个分屏
- &lt;c-w&gt;t ： 到最上方的 split
- &lt;c-w&gt;b ： 到最下方的 split
- &lt;c-w&gt;&#124; ： 将当前分屏最大化
- &lt;c-w&gt;=; ： 重置分屏比例
- &lt;c-w&gt;+; ： 增大当前分屏
- &lt;c-w&gt;-; ： 缩小当前分屏
- &lt;c-g&gt;   ： 显示当前文件位置
- g&lt;c-g&gt;  ： 统计文件字数
- q[a-z] 录制宏后，可以用 q[A-Z] 为之前的 a-z 宏插入新动作
- @@            ： 运行上一次宏命令
- m[a-z]        ： 在当前文件中做标记（小写）
- m[A-Z]        ： 跨文件做标记（大写）
- '[a-zA-Z]     ： 跳转到标记处
- '0            ： 打开上次退出 vim 时的位置

## insert 模式

- &lt;c-m&gt; ： 换行
- &lt;c-j&gt; ： 换行
- &lt;c-y&gt; ： 复制上一行当前列的文字
- &lt;c-f&gt; ： 缩进（比 tab 智能，需要打开 autoindent 选项）
- &lt;c-u&gt; ： 删除一整行
- &lt;c-h&gt; ： 删除一个字符
- &lt;c-w&gt; ： 删除一个单词
- &lt;c-o&gt; ： 执行一次 normal 命令再回到插入模式
- &lt;c-x&gt;&lt;c-f&gt; ： 选择当前目录
- &lt;c-r&gt;+ ： 插入剪切板中的内容
- &lt;c-r&gt;= ： 在 cmd 中输入数学表达式，插入表达式结果
- &lt;c-x&gt;&lt;c-f&gt; ： 获取当前文件的父目录
- &lt;c-a&gt; ： 重复插入上一次 insert 模式下输入的内容
- &lt;c-@&gt; ： 重复插入上一次 insert 模式下输入的内容，然后退出 insert 模式

## command 模式

- &lt;c-f&gt; ： 进入 ex 模式
- &lt;c-r&gt;[0-9] ： 从系统剪切板获取内容
- &lt;c-r&gt;&lt;c-w&gt; ： 获取光标下的单词
- &lt;c-b&gt;  ： 到开头
- &lt;c-e&gt;  ： 到结尾
- &lt;c-left&gt; ： 向左一个单词
- &lt;c-right&gt; ： 向右一个单词
- &lt;c-w&gt;     ：删除左侧一个单词
- &lt;c-u&gt;     ： 清空命令行


## visual 模式

- o ： 掉头
