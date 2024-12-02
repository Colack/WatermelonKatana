function injectHTMLElement(file, element) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(element).innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}