treesitter spell check exception in TS and JS files?

I don't know if you have encountered this kind of problem, in `ts` or `js` files, some keywords will be wrongly marked in red.

I use `spellsitter` and set the `additional_vim_regex_highlighting` of `treesitter` to `false`, it gives the following (currently I only tested the `ts` and `js` files), which is surprising ..

`additional_vim_regex_highlighting` When set to `true` or manually typed `:set syntax=on`, spell checking will be correct.

How should I fix it?


There's an old saying, I don＇t have to use it, but you can't live without it. I think it says it well.

Also, I use multi-cursor operations more often than `<c-v>`, so I'd love to see it built in.

Although the `vim-visual-multi` plugin does a great job, it still has some flaws.

For example I can't press `<tab>` or `<s-tab>` to select my completion item after the completion menu appears, which is annoying...

If any of you encountered this problem and solved it then please let me know, thanks a lot...
