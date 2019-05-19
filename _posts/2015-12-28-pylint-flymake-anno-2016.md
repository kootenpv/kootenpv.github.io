---
layout: post
title: Pylint and Flymake Anno 2016
subtitle: No need for PEP8 checking / PyFlakes / PyChecker / Flake8
---

I noticed that pylint and flymake do not play so nicely in current Emacs.

I was fooled many times by thinking that I did get proper output that was workable for `flymake`, this turned out not to be `True`.

As I was trying to make the "squiggly" line look better for my [emacs-kooten-theme](https://github.com/kootenpv/emacs-kooten-theme), I noticed **all I was reporting were errors**; no warnings.
This is because flymake is certainly not expecting recent PyLint output.
Add onto this that when configuring flymake, it expects a single script (without commandline arguments).

Since I want an awesome Emacs environment, and also because I want to make [the EMacs Python environment "EMP"](https://github.com/kootenpv/emp) happen, I went on to solve the situation.

Shoutout to [elpy](https://github.com/jorgenschaefer/elpy) since elpy is just such a driving force for me to make this happen!

#### Result

After it was done, no more squiggly lines, distinguishable colors, and nice textual output:

[](/assets/pylint_flymake.png)

but that's getting ahead of things.

### The process

Here I describe the process of what came a long the way.

#### Nicely readable output

I started with an ideal format:

    [ERROR/WARNING/etc]: The problem description (symbollic-name)

Ideal because for me:

- Clear whether it is error/warning/etc
- Message should be near start, not floating somewhere after filename/linenumber
- No need for linenumber/filename; I already know the filename and linenumber
- I want the `symbollic-name` in case I want to disable it (and not some error-code)

I was determined to get this, but after a long time discovered that we need to give the filename and `line_number` to `flymake-mode`, since otherwise it is not possible to use `flymake-next-error`.

But I certainly did not want filename and linenumber to occur at the start.

In the end I settled with


    [ERROR/WARNING/etc] The problem description (symbollic-name) | filename:linenumber


that is:

    [CONVENTION] Missing function docstring (missing-docstring. | pyflymake.py:208

### flymake-mode

For those interested in my struggle, it took me a long time to understand why it is such a difficult problem with `flymake`.

It goes like this:

1. Lines come out from pyflymake.py or another executable

2. Line is matched against emacs `flymake-err-line-patterns`

3. If any of the regexps match the line

4. Then it uses `flymake-warning-predicate` regexp search to determine whether an `error` or a `warning` was found.

It is very unclear which rules are existing in `flymake-err-line-patterns`, they are just regexps without names!

The reason a regexp usually hits in the current state, is because out of many, one is defined with a very simple format:


    [^:]+:[0-9]+:.+

that is:

{% highlight emacs-lisp %}
[^:]+  - matching non ':', --> filename
:
[0-9]+ - matching numbers, --> linenumber
:
.+     - matching anything, --> problem_description
{% endhighlight emacs-lisp %}

Any characters not matching `:`, a `:`, `numbers 0-9` and then anything goes `.+`.

However, very crucial: it does not correctly determine error/warning. `flymake-warning-predicate` defined in `elpy-mode` is:


    "^[wW]arning"


I actually have not found any code in the python modes that have description messages starting with "warning" or "Warning", so yea...

And I not only wanted better output, but also need to conform to filename/linenumber.

So I added my own regexp to the situation, and my own "error category" checking:

{% highlight emacs-lisp %}
;; Pylint pattern catcher
(add-to-list 'flymake-err-line-patterns
             '("\\([^|]+\\)| \\([^:]+\\):\\([0-9]+\\)$"
               2 3 nil 1))
;; Warning checker: if not Error/Fatal
(setq flymake-warning-predicate "^.[^EF]")
{% endhighlight emacs-lisp %}

Note that the `2 3 nil 1` refer to indices for a pattern in `flymake-err-line-patterns`:

               2       3         nil                1
    regexp file-idx line-idx col-idx (optional) text-idx(optional)

I could test this stuff by using this snippet:

{% highlight emacs-lisp %}
(flymake-parse-line
 "[CONVENTION] Missing function docstring (missing-docstring) |
  pyflymake.py:208")
{% endhighlight emacs-lisp %}

### Other typecheckers

Also very interesting is that there are more checkers defined in `pyflymake.py`, which are well known. When you will be using `EMP`, only pylint will be neccessary.

The others are either going to run your actual script and be slow about it (PyChecker), or fast but not catch anything (PyFlakes), or an aggregation of subpar ones (Flake8).

Note that the title mentions no `PEP8` checking; rather, use yapf or autopep to guard `PEP8` for you bundled in EMP / elpy :)

### For you

I supposed the following code could be a fix for when you want to use `pylint`.

- Grab `pyflymake.py` from [https://github.com/kootenpv/emp](https://github.com/kootenpv/emp)
- Add the following code to your python part in `.emacs`:

{% highlight emacs-lisp %}
(add-hook 'elpy-mode-hook
 '(lambda ()
   (progn
    (add-to-list 'flymake-err-line-patterns '("\\([^|]+\\)| \\([^:]+\\):\\([0-9]+\\)$"
                                              2 3 nil 1))
    (set (make-local-variable 'flymake-warning-predicate) "^.[^EF]"))))
{% endhighlight emacs-lisp %}
