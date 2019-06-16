---
layout: post
title: textsearch - an NLP library for fast and configurable search
subtitle:
---

Speed and accuracy is everything in Natural Language Processing (NLP).
Some decide to go a "pure" Deep Learning route, but even when going in that direction, there are many situations in which you need a fast text searcher.
Sometimes you just are looking for, say, 10000 words in [bm]illions of texts (the more, the higher the relative gain compared to regex).

One of the libraries existing for that is [flashtext](https://github.com/vi3k6i5/flashtext). I suggest you read the article written by my friend [Vikash Singh](https://github.com/vi3k6i5) called "[Regex was taking 5 days to run. So I built a tool that did it in 15 minutes](https://www.freecodecamp.org/news/regex-was-taking-5-days-flashtext-does-it-in-15-minutes-55f04411025f/)".
I'm proud to have raised issues to his library, and he was very patient and he kept making it the awesome package that it is.

That said, I wanted to take the lessons learned there, and make a library having more options.
At the same time, I realized that he adapted the popular aho-corasick algorithm (historically what `grep` was built on!).
Instead, I found out someone had written an aho-corasick implementation in C with a python wrapper on top (called [pyahocorasick](https://github.com/WojciechMula/pyahocorasick)) - I went from there.

[textsearch](https://github.com/kootenpv/textsearch) was born.

### Introducing `textsearch`

The goal of [textsearch](https://github.com/kootenpv/textsearch) is to be the fastest when you need to quickly search and find multiple strings (and sometimes still some regex).
The trick to these algorithms is that regardless of how many words you are looking for, you only loop once over the text you are searching. This is what makes it efficient.
In case you're interested, read about trie data structures and the aho-corasick algorithm in particular.

Currently I am in the process of rewriting many packages to use this instead of regex (all having roughly a 30x speedup over the current code that's regex based):

- [contractions](https://github.com/kootenpv/contractions): Fixes contractions such as `you're` to you `are`
- [metadate](https://pypi.org/project/metadate): Finding dates in natural text
- [natura](https://github.com/kootenpv/natura): Find currencies / money in natural text as python objects
- [rebrand](https://github.com/kootenpv/rebrand): Refactor software using smart-cased string replacement

I am also writing a tokenizer - one that is at least 20x faster than any tokenizer I've seen in Python (nltk, spacy, segtok) and is much more configurable in a straight-forward manner!

I hope you will find it as fun to create modules / apps on top of this! If you want you can let me know and I will make sure to list your package here https://github.com/kootenpv/textsearch#showcase

### Basic usage example

```python
from textsearch import TextSearch
ts = TextSearch(case="ignore", returns="match")
words = ["hi", "bye"]
ts.add(words)
ts.findall("hi Pascal, bye")
# ["hi", "bye"]
```

For more, please have a look (perhaps even check out ;-)) the github repository [kootenpv/textsearch](https://github.com/kootenpv/textsearch).

I'll be posting benchmarks eventually, but in running benchmarks of a similar implementation in Go, textsearch had a comparable speed, and at the same time was more configurable.
It's also way faster (once you add the fancier options) than the equivalent in Java.
Compared to flashtext it changed from being 30% to 300% faster.
