---
layout: post
title: Cool title
subtitle: Cool subtitle
---

**STATUS: PRE-ALPHA** -- did not check for bugs yet

![]({{site.url}}/assets/emacs.png)
![]({{site.url}}/assets/python.png)

[emp](https://github.com/kootenpv/emp)'s goal is to be a full environment for everything Python. It builds on top of [elpy](https://github.com/jorgenschaefer/elpy), and provides even more bindings.
It is a real attempt at convincing people to work with an Emacs environment for Python.
Most importantly, once you have started working with Emacs on one language, you can easily switch to another language and be perfectly comfortable (rather than having to learn a new IDE whwhich will most likely disappoint you).

For people it takes too long to setup their own Emacs environment for Python, which is why they'll try and give up.

The goal of emp is to take all the best development components available for Python, and combine it conveniently under Emacs.

The usual case is:

- Someone in the Emacs community finds out a new feature (himself or from another IDE)
- Implements it in Emacs,
- When it prooves useful and it is the best-of-their-kind, emp will want to integrate it.

Feel free to [make feature suggestions](https://github.com/kootenpv/emp/issues)!

Of course, as expected of Emacs, everything can be customized, so if you do not like a component you can exclude it.

Note that everything in Emacs is a bit different, so you'll have to watch some videos to get up to speed:

[Emacs Introduction and Demonstration by Howard Abrams](https://www.youtube.com/watch?v=B6jfrrwR10k)

### Screenshot

![]({{site.url}}/assets/python-screenshot.png)

### Installation

Depending on whether you already have Python and/or Emacs installed, this might vary.

I have provided some specific example instructions:

- [Ubuntu 15.10](https://github.com/kootenpv/emp/blob/master/ubuntu_install.md)
- [Fedora 23.10](https://github.com/kootenpv/emp/blob/master/fedora_install.md)

A general installation, however, goes as follows:

- Install Python (preferably 3, yes I'm a Python 3 fan)
- Install Emacs
- git clone https://github.com/kootenpv/emp/
- Run:

{% highlight bash %}
# Make backup of previous `.emacs` config if it exists, otherwise ignore error
mv ~/.emacs ~/.emacs_before_emp

# Tell .emacs where to find the emp emacs files
echo '(setq user-emacs-directory "/home/<YOURUSERNAME>/emp/")' > ~/.emacs
echo '(load (concat user-emacs-directory ".emacs.d/init.el"))' >> ~/.emacs
{% endhighlight bash %}

Now whenever you will open Emacs, it will be fully charged!

Below a list of features:

#### General features

- Easy to add packages (just add them in the list in "emp/init/emp-external-packages.el")

- Nice standard theme, easy to take another theme by using `M-x load-theme RET <theme-name>`, e.g.

  - [zenburn](http://wikemacs.org/wiki/File:Zenburn-theme.png)

  - [solarized-dark](http://wikemacs.org/wiki/File:Solarized-dark-theme.png)

  - [ubuntu](https://github.com/rocher/ubuntu-theme)

- Nice separation of functionality for init

- All Emacs benefits, among:

  - Great version control support by `magit` (emacs layer on top of git/svn etc)

  - Great local backups for file changes

  - electric-pair-mode: awareness for pairs of `()`, `''`, `""`, `[]` etc

  - Drag parens:

  e.g. print|asfdasdf --> print(|)asdfasdf --> print(asdfasdf|)

  - Undo tree using `undo-tree-visualize` rather than linear undos

  - Modes for everything; `markdown-mode`, `dockerfile-mode` and so on

  - Recently opened files using `C-c r`

  - Find file with autocomplete using `C-x C-f`


#### Python features

- Python optimized for Interactive (REPL)

    - Uses IPython

    - Timing after each execution

    - `C-0 C-<Return>` --> Set focus to an IPython instance and run code

    - `C-2 C-<Return>` --> Set focus to an IPython 2 instance and run code

    - `C-3 C-<Return>` --> Set focus to an IPython 3 instance and run code

    - `C-9 C-<Return>` --> Set focus to an IPyPy instance and run code

    - `C-<Return>` --> Run code in the focused instance

    - `C-<Return>` is smart; it runs either paragraphs, functions or classes (all with `C-<Return>`)

- `elpy` batteries included:

    - Optimized testing

    - Easy adding of imports using `C-c <Return>`

    - auto-completion from `jedi` (or `company`), result is dynamic completion

    - *No need to check for correctness of `PEP8`*; autopep8 / yapf for automatic formatting, on file-save

    - Imports ordered on save

- Best error reporting on the sideline, flymake & pylint + showing symbollic names for easy disabling

- `git-gutter` to see recent modifications in git repos
