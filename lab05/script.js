d3.text('data.csv').then(function(data) {
    var parsedCSV = d3.csvParseRows(data);
    d3.select('body')
      .selectAll('div')
      .data(parsedCSV)
      .enter()
      .filter(function(d, i) { return(i != 0); }) // ignore first row
      .append('div')
      .attr('class', 'bar')
      .text(function(d) { return d[1]; })
      .style('height', function(d) {
          return(d[1] * 20 + 'px');
      });
});