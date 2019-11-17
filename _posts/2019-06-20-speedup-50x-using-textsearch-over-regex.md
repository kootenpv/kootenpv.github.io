---
layout: post
title: 50x Speedup of contractions library (based on regex) using TextSearch
subtitle: Embracing C wrappers
---

[Contractions](https://github.com/kootenpv/contractions) is a library that normalized language like `"he's"` to `"he is"`, and `"I'm"` to `"I am"`.

It was basically a bunch of regex. The slowdown becomes unbearable once you use multiple regexes; since it will be making multiple passes over the same text.

It's great to use libraries which solve exactly the problem you are facing.

In the case of `contractions`, I was able to simplify the code of my library from 120 lines to 90 by relying on [TextSearch](/2019-06-16-textsearch-an-NLP-library-for-fast-configurable-search).
Even more, it became possible to write an additional method that wasn't possible before with no effort.

Most impressively, it allowed a speed up of 50x.

### Benchmarks

This is loading some example data (easily available when you use scikit-learn):

```python
from sklearn.datasets import fetch_20newsgroups

categories = ["alt.atheism", "talk.religion.misc", "comp.graphics", "sci.space"]

newsgroups = fetch_20newsgroups(
    subset="train", remove=("headers", "footers", "quotes"), categories=categories
)
```

Using `contractions==0.0.18`, the timing is:

```python
from contractions import fix
for line in newsgroups.data:
    fix(line)
# Wall time: 5.04s
```

exactly the same code, but using `contractions>0.0.18` doing it 50 times in the same time:

```python
from contractions import fix

for _ in range(50):
    for line in newsgroups.data:
        fix(line)
# Wall time: 5.01s
```

I promise... no caching ¯\\_(ツ)_/¯
