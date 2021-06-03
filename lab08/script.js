const ANIMATION_DELAY = 3200; // milliseconds

window.addEventListener('load', function() {
    loadNameCharacterByPath('./chen.svg', '#chen');
    setTimeout(function() { loadNameCharacterByPath('./feng.svg', '#feng'); }, ANIMATION_DELAY);
    setTimeout(function() { loadNameCharacterByPath('./ping.svg', '#ping'); }, ANIMATION_DELAY * 2);
});

function loadNameCharacterByPath(filePath, elementId) {
    d3.xml(filePath).then(function(data) {
        d3.select(elementId)
            .node()
            .append(data.documentElement);
    });
}