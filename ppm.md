---
layout: page
title: PPM
subtitle: Pascal Password Manager
---
<!-- content! -->
<h1>ppm
<a href="https://github.com/{{ site.author.github }}/ppm" title="GitHub">
<span><i class="fa fa-github"></i></span>
</a>
</h1>

This is the password manager I use. Code safely runs only in the browser.

Python and Android versions are also available.

<h3>Generate password</h3>

<form onsubmit="calculate(); return false">
<p>
<label for="password" style="width: 100px;">Password:</label>
<input id="password" name="password" type="password" value="passwordpassword" size="32">
</p>
<p>
<label for="keyword" style="width: 100px;">Keyword:</label>
<input id="keyword" name="keyword" type="text" value="reddit" size="32">
</p>
<input class="btn js-textareacopybtn" type="submit" name="btn" value="Calculate" />
</form>
<div id="out" style="margin-top: 10px; padding: 10px 5px; color: #444; line-height: 1.5;">
<b>Credits for Scrypt implementation: <a href="https://github.com/dchest/scrypt-async-js">dchest/scrypt-async-js</a></b>
<script src="/js/scrypt.js"></script>
<script>
var f = document.forms[0];

function calculate() {

var btn = f.btn;
var out = document.querySelector('#out');

var password = f.password.value;
var keyword = f.keyword.value;

btn.disabled = true;
btn.value = 'Wait...';

  function copy(text) {
      var t = document.getElementById('t')
      t.innerHTML = text
      t.select()
      try {
        var successful = document.execCommand('copy')
        var msg = successful ? 'successfully' : 'unsuccessfully'
        console.log('text coppied ' + msg)
      } catch (err) {
        console.log('Unable to copy text')
      }
      t.innerHTML = ''
  }

window.setTimeout(function() {
                     try {
                         var t1 = (new Date()).getTime();
                         scrypt(password, keyword, {
                             logN: 15,
                             r: 8,
                             p: 1,
                             dkLen: 32,
                             interruptStep: 0,
                             encoding: "hex"
                         },
                                function(res) {
                                    var t2 = ((new Date()).getTime()-t1);
                                    out.innerHTML = 'Times: <b>'+t2+' ms</b><br>Master password input length: '+password.length+'<br><span style="color:cornflowerblue; font-weight:bold">Succesfully copied password.</span> <textarea id="t" style="position: absolute; left: 0; z-index: -900; width: 0px; height: 0px; border: none; opacity: 0">' + res + '</textarea>';
                                    btn.disabled = false;
                                    btn.value = 'Calculate';
                                    copy(res);
                                });
                     } catch(ex) {
                         out.innerHTML = '<span style="color:red">error: ' + ex.message + '</span>'; btn.disabled = false; btn.value = 'Calculate';
                     } }); };
</script>

<!-- end content -->

<p>No dependencies on any other party, this makes for a very safe password manager. Everytime the same strong password gets created based on your master password and a keyword (such as reddit or github).</p>

When a website wants you to create a new password: just increment (e.g. reddit1, reddit2). Easy.

<p>It will take 1 million macbook pros 1e19 years to find the password when it would be found at half of the possible time.</p>
