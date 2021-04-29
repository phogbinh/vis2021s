const MAX_FREQUENCY_VALUE = 39;
const BAR_HEIGHT_SCALE = 15;

d3.text('data.csv').then(function(csvText) {
    var rows = d3.csvParseRows(csvText);
    var frequencyDiv = d3.select('body')
        .selectAll('div')
        .data(rows)
        .enter()
        .filter(function(row, index) {
            return index != 0;
        }) // ignore first row
        .append('div')
        .attr('class', 'frequency');
    frequencyDiv.append('div')
        .attr('class', 'frequency-value')
        .text(function(row) {
            return row[1] === '0' ? '' : row[1];
        });
    frequencyDiv.append('div')
        .attr('class', 'bar')
        .style('height', function(row) {
            return row[1] * BAR_HEIGHT_SCALE + 'px';
        })
        .style('background-color', function(row) {
            return 'rgba(255, 0, 0, ' + (row[1] / MAX_FREQUENCY_VALUE) + ')';
        });
});