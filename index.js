(function () {
    document.getElementById("document")
        .addEventListener("change", handleFileSelect, false);

    function handleFileSelect(event) {
        const options = {
            styleMap: [
                "u => u"
            ]
        };
        readFileInputEventAsArrayBuffer(event, function (arrayBuffer) {
            mammoth.convertToHtml({arrayBuffer: arrayBuffer},options)
                .then(displayResult, function (error) {
                    console.error(error);
                });
        });
    }

    function displayResult(result) {
        if (!result.value) {
            document.getElementById("message").innerText = "File is empty.";
            document.getElementById("output").innerHTML = '';
            document.getElementById("clean-html").innerText = '';
            console.log('File is empty.')
        } else {
            const cleanHTML = clearHTML(result.value);
            document.getElementById("output").innerHTML = cleanHTML;
            document.getElementById("clean-html").innerText = cleanHTML;
            document.getElementById("message").innerText = "File successfully converted.";
            console.log('File successfully converted.')
        }
    }

    function readFileInputEventAsArrayBuffer(event, callback) {
        const file = event.target.files[0];

        const reader = new FileReader();

        reader.onload = function (loadEvent) {
            const arrayBuffer = loadEvent.target.result;
            callback(arrayBuffer);
        };

        reader.readAsArrayBuffer(file);
    }

    function clearHTML(rawHTML) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHTML, 'text/html');
        // Remove <p> tags in tables
        cleanUpTableCells(doc)

        // Clean up <p> tags wrapping inline elements
        cleanUpInlineElements(doc);

        return doc.body.innerHTML;
    }

    function cleanUpInlineElements(doc) {
        const paragraphs = doc.querySelectorAll("p");

        paragraphs.forEach(p => {
            const inlineElements = p.querySelectorAll("strong, em, s, span");

            if (inlineElements.length === 0 || p.childNodes.length > inlineElements.length) {
                return;
            }

            const fragment = document.createDocumentFragment();
            while (p.firstChild) {
                fragment.appendChild(p.firstChild);
            }
            p.replaceWith(fragment);
        });
    }

    function cleanUpTableCells(doc) {
        const tableCells = doc.querySelectorAll('table td, table th');

        tableCells.forEach(cell => {
            const paragraphs = cell.querySelectorAll('p');

            if (paragraphs.length > 0) {
                const fragment = document.createDocumentFragment();

                paragraphs.forEach((p, index) => {
                    while (p.firstChild) {
                        fragment.appendChild(p.firstChild);
                    }
                    if (index < paragraphs.length - 1) {
                        fragment.appendChild(document.createElement("br"));
                    }
                    p.remove();
                });

                cell.appendChild(fragment);
            }
        });
    }
})();
