console.log('Hello from inline');
if (window.location.href.match(/milky.com/)) {
    if (false && document) {
        console.log(document)
        var d = document.createElement('div');
        document.body.appendChild(d);
        d.style.position = 'fixed';
        d.style['z-index'] = 3000;
        d.style.top=0;
        d.style.left=0;
        d.style.width='100%';
        d.style.height='100%';
        d.style.color='yellow';
        d.style.opacity='1';
        d.style['background-color']= '#333';
        d.innerText = 'hello';
    }
    console.log('Hello this is scratch');

    console.log('doc starts as', document.body.innerHTML)
    document.write('hello');
    console.log('doc is now', document.body.innerHTML)
    setTimeout("window.location.href = 'http://milk.com';", 10000);
}