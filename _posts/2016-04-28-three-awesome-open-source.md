---
layout: post
title: Three awesome Open-Source projects discovered
---

I've realised today that the following Open-Source Generic Command-Line tools (developed in Python) are great "lifehacks". Without further ado:

### Never lose a command: `bashhub`

The idea is that bashhub will store all the commands you use on any connected device, and you can use `bh <keyword>` to find back how you were _exactly_ supposed to use that [exotic tar command](https://xkcd.com/1168/). Now, without using google, you can obtain a valid tar command within 10 seconds. Use `bh tar` to find commands previously including `tar`.

Register to get an account and set it up from [bashhub.com](https://bashhub.com/). Also have a look at the [github repo](https://github.com/rcaloras/bashhub-client) (created by Ryan Caloras)

After installation, you will have `bashhub` as command available to handle bashhub itself, while `bh` can be used to query.

My `bashhub status` prints:

    Total Commands: 15838
    Total Sessions: 859

I also love the builtin update capability `bashhub update` which updates to the latest version.

Other than query for tar, you can ironically also use `bh` on itself (`bh bh`). This is an example of my last searches using bashhub:

    bh new
    bh solc
    bh geth
    bh /electron
    bh bup
    bh yagmail
    bh restore
    bh ssh

This is `Control-r` (reverse-search) on steroids!

### Smarter password manager: `visionary`

Recently I started making more complex passwords, resulting in having to restore my passwords more and more often. Counter-productive. It was time for a password manager, but I do not like external password managers. I do not like any organisation to hold all my passwords.

We do want our passwords to be strong, recoverable and easily available. [visionary](https://github.com/libeclipse/visionary) is building towards that (API will be coming for "easily available" password generation).

`visionary` deterministically generates the same password for the same source by utilizing the Scrypt algorithm. The password depends only on the strength of the algorithm (can be chosen), the master password and a keyword.
For example, to generate a password for facebook, you might use the keyword "facebook.com". If the keyword would be difficult (facebook123catsname), it'd be just like having to enter another password; beating the purpose. Since most people would use a similar keyword flavor, we cannot really see this keyword as an extra sense of security. However, it serves very well against brute force cross-domain password attacks. Using only a single character different between keywords create completely different 32 character passwords. Thus, when someone would obtain your password on one website, it cannot be related to a password on another website. So, in the end, we're left with a password manager that actually solely depends on the master password, and I'm fine with that. The only way people are going to get my strong master password is when my PC has been locally compromised. Even in the wrong hands, since this is not a big password manager yet, "obscurity" is another layer of defense :-)

Some of `visionary`'s code for illustrative purpose:

``` python
def generate(master_password, keyword, cost=2048, oLen=32):
    hashed = pyscrypt.hash (
        password = master_password.encode('utf-8'),
        salt = keyword.encode('utf-8'),
        N = cost,
        r = 1,
        p = 1,
        dkLen = 32
    )
    return codecs.encode(hashed, 'hex').decode('utf-8')[0:oLen]
```

Anyway, for more info and usage, you should read the [README on the github page]((https://github.com/libeclipse/visionary)). To get the basic idea:

Run `pip install visionarypm` for setup. Then run `vpm` to start. First choose Scrypt's strength. Then enter a master password and a key. The next time we have to get the password we just run the `vpm`, enter a master pasword and keyword, and end up with the same result as before.

### Highlevel backup: `bup`

Even though most my projects run through Git, I still feel much safer when my precious scripts / projects _not_ on git are still recoverable / accessible.
Luckily, I work simply from a single project folder (`~/projects`). Everything outside of that is not so interesting to me, though when Arch Linux becomes my main OS, I would consider using it for the `/etc/` (config) folder. It is easy to include multiple paths regardless.
Earlier on I've used both Dropbox and GDrive, but they lack an "ignore" file, or are too much focused on a single folder. I cringe whenever I see GDrive upload endlessly after I did another `npm install`, or when it's uploading some sklearn pickle.
After considering Dropbox, GDrive, Syncthing and BTSync, I'm glad to have stumbled upon `bup`.

`bup` is very efficient at using the good parts of git. It also handles binary data and large files by splitting them up. So, it does incremental updates really well, and we get versioning added in! For a complete talk by Zoran Zaric (the creator), [watch this video](https://www.youtube.com/watch?v=N5qj94B3WkE).

I have a script that I will run with cron every hour in the evening. I find the `bup` documentation lacking, but bits and pieces are certainly available on the internet. A great example script is available here for backing up to [External Disk and/or Raspberry Pi](https://debian-administration.org/users/kumanna/weblog/16).
You could of course also just backup to another PC in the network, or to some cloud storage. The example below intends to backup through SSH.

Note that you have to install `bup` on both machines, and have run `bup init` on both machines.
Specifically, I used:

    BUP_DIR=/home/pascal/MACBACKUP bup init

to initialize the `bup` directory in `MACBACKUP` -- the place where I will want to backup my Mac's files on the remote machine.

Locally, I just used `bup init` (defaulting to creating .bup in `~/.bup`).

Afterwards, it is then possible to start backing up. Here are the commands I use in my cron script:

``` bash
/usr/local/bin/bup index ~/projects --exclude-rx \.git --exclude-rx node_modules --exclude-rx \.hg --exclude-rx \.tox
/usr/local/bin/bup save -r archlan:MACBACKUP -n macbackup ~/projects
```

Note `bup` is prefixed by `/usr/local/bin/` since otherwise `bup` would not be found for the cron user.

Further explanation:

`bup index` will index the differences, where:

    ~/projects             # contains all the files to be included
    --exclude-rx ...       # will exlude any files where the regex matches

and `bup save` will then actually transfer the data:

    -r                     # signifying using remote through ssh
        archlan            # archlan is my ssh config, which expands to pascal@192.168.2.228
               :           # used in the ssh syntax: <username>@<remote-ip>:<folder-path>
                MACBACKUP  # the folder /home/pascal/MACBACKUP on my secondary machine


It also does great compression.

    Including git/node_modules: 24G
    Excluded: 19G
    Compressed into 7G

So now I have a great backup, which can be stored where we want, versioning, and efficient updates. Oh yea, you will want to restore. Use:

    bup restore -C ~/destination_folder macbackup/latest/

---

Hopefully you found these tools as useful as I have. Feel free to leave a comment below.
