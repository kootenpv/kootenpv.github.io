---
layout: post
title: is_sql_injectable(domain)
subtitle: Or let's protect websites whose usernames are up for grabs
---

After wondering what OS Elliott is using in the show Mr. Robot, I found out of the Kali distribution: a distribution aimed at hacking.
Looking at youtube, it seems easy for "bad people" to do SQL injection. There is a 5 minute video demonstrating how.

So, in order to combat SQL injection, I thought it could be a nice project to write a bot that could:

- Search for websites that are potentially vulnerable to SQL injection
- For each, figure out whether they are probably injectable
- If they are, find email addresses on the domain (root, contact, info pages) to warn
- Send emails warning them of a potential hazard


The fun thing is that I'd combine methods that I use often in Python; crawling, extracting info, and sending emails.

Not all crawling is "bad"; crawling can be done to help!

Enumerate the steps/components

- Google search
- Find injectable websites
- Find emails to warn
- Send emails using yagmail

### Send emails using `yagmail`

In order

Full depth including code

{% highlight python %}
{% endhighlight %}

Conclusion
