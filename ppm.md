---
layout: page
title: PPM
subtitle: or ...
---
<!-- content! -->
<h1>ppm
<a href="https://github.com/{{ site.author.github }}/ppm" title="GitHub">
<span><i class="fa fa-github"></i></span>
</a>
</h1>
<form onsubmit="calculate(); return false">
<p>
<label for="password" style="width: 100px;">Password:</label>
<input id="password" name="password" type="password" value="password" size="32">
</p>
<p>
<label for="salt" style="width: 100px;">Salt:</label>
<input id="salt" name="salt" type="text" value="salt" size="32">
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
var salt = f.salt.value;

btn.disabled = true;
btn.value = 'Wait...';

window.setTimeout(function() {
try {
var t1 = (new Date()).getTime();
scrypt(password, salt, {
logN: 15,
r: 8,
p: 1,
dkLen: 32,
interruptStep: 0,
encoding: "hex"
},
function(res) {
var t2 = ((new Date()).getTime()-t1);
out.innerHTML = 'Time: <b>'+t2+' ms</b><br>Master password input length: '+password.length+'<br><span style="color:cornflowerblue; font-weight:bold">Succesfully copied password.</span> <textarea id="res">' + res + '</textarea>';
btn.disabled = false;
btn.value = 'Calculate';
var copyTextarea = document.querySelector('#res');
copyTextarea.select();

try {
var successful = document.execCommand('copy');
var msg = successful ? 'successful' : 'unsuccessful';
console.log('Copying text command was ' + msg);
copyTextarea.innerHTML = '';
copyTextarea.style.display = 'none';
} catch (err) {
console.log('Oops, unable to copy');
}

});
} catch(ex) {
out.innerHTML = '<span style="color:red">error: ' + ex.message + '</span>'; btn.disabled = false; btn.value = 'Calculate';
} }); };
</script>
<!-- end content -->
