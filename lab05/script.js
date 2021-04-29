d3.text('data.csv').then(function(data) {
    var parsedCSV = d3.csvParseRows(data);
    d3.select('body')
      .selectAll('div')
      .data(parsedCSV)
      .enter()
      .append('div')
      .filter(function(d, i) { return(i != 0); }) // ignore first row
      .attr('class', 'bar')
      //.text(function(d) { return d[1]; })
      .style('height', function(d) {
          return(d[1] + 'px');
      });
});