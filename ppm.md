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
<input id="keyword" name="keyword" type="text" value="reddit" size="32" onchange="this.value = this.value.toLowerCase();">
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

const copyToClipboard = (function initClipboardText() {
  const id = 'copy-to-clipboard-helper';
  const element = document.getElementById(id);
  const textarea = element || document.createElement('textarea');

  if (!element) {
    textarea.id = id;
    // Place in top-left corner of screen regardless of scroll position.
    textarea.style.position = 'fixed';
    textarea.style.top = 0;
    textarea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textarea.style.width = '1px';
    textarea.style.height = '1px';

    // We don't need padding, reducing the size if it does flash render.
    textarea.style.padding = 0;

    // Clean up any borders.
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textarea.style.background = 'transparent';

    // Set to readonly to prevent mobile devices opening a keyboard when
    // text is .select()'ed.
    textarea.setAttribute('readonly', true);

    document.body.appendChild(textarea);
  }

  return function setClipboardText(text) {
    textarea.value = text;

    // iOS Safari blocks programmtic execCommand copying normally, without this hack.
    // https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const editable = textarea.contentEditable;
      textarea.contentEditable = true;
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      textarea.setSelectionRange(0, 999999);
      textarea.contentEditable = editable;
    } else {
      textarea.select();
    }

    try {
      return document.execCommand('copy');
    } catch (err) {
      return false;
    }
  };
}());

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
                                    out.innerHTML = 'Time: <b>'+t2+' ms</b><br>Master password input length: '+password.length+'<br><span style="color:cornflowerblue; font-weight:bold">Succesfully copied password.</span>';
                                    btn.disabled = false;
                                    btn.value = 'Calculate';
                                    copyToClipboard(res);
                                });
                     } catch(ex) {
                         out.innerHTML = '<span style="color:red">error: ' + ex.message + '</span>'; btn.disabled = false; btn.value = 'Calculate';
                     } }); };
</script>

<!-- end content -->

<p>No dependencies on any other party, this makes for a very safe password manager. Everytime the same strong password gets created based on your master password and a keyword (such as reddit or github).</p>

When a website wants you to create a new password: just increment (e.g. reddit1, reddit2). Easy.

<p>It will take 1 million macbook pros 1e19 years to find the password when it would be found at half of the possible time.</p>
