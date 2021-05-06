const WIDTH = 6000;
const HEIGHT = 500;
const MARGIN = {
    top: 20,
    right: 160,
    bottom: 35,
    left: 30
};

d3.csv('data.csv', function(rows) {
    var languagesData = rows.map(function(row, rowIndex) {
        row['id'] = rowIndex; // add id
        return row; // update row
    });
    // Setup svg using Bostock's margin convention
    var BARS_TOTAL_WIDTH = WIDTH - MARGIN.left - MARGIN.right,
        BARS_TOTAL_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

    var svg = d3.select('body')
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .append('g')
        .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

    // Transpose the data into layers
    var dataset = d3.layout.stack()(['國文', '英文', '法文', '德文', '日文'].map(function(language) {
        return languagesData.map(function(d) {
            return { x: d['id'], y: +d[language] };
        });
    }));

    // Set x, y and colors
    var x = d3.scale.ordinal()
        .domain(dataset[0].map(function(d) { return d.x; }))
        .rangeRoundBands([10, BARS_TOTAL_WIDTH - 10], 0.02);

    var y = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) { return d3.max(d, function(d) { return d.y0 + d.y; }); })])
        .range([BARS_TOTAL_HEIGHT, 0]);

    var colors = ['#173f5f', '#20639b', '#3caea3', '#f6d55c', '#ed553b'];


    // Define and draw axes
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(5)
        .tickSize(-BARS_TOTAL_WIDTH, 0, 0)
        .tickFormat(function(d) { return d });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + BARS_TOTAL_HEIGHT + ')')
        .call(xAxis);


    // Create groups for each series, rects for each segment 
    var groups = svg.selectAll('g.cost')
        .data(dataset)
        .enter().append('g')
        .attr('class', 'cost')
        .style('fill', function(d, i) { return colors[i]; });

    var rect = groups.selectAll('rect')
        .data(function(d) { return d; })
        .enter()
        .append('rect')
        .attr('x', function(d) { return x(d.x); })
        .attr('y', function(d) { return y(d.y0 + d.y); })
        .attr('height', function(d) { return y(d.y0) - y(d.y0 + d.y); })
        .attr('width', x.rangeBand())
        .on('mouseover', function() { tooltip.style('display', null); })
        .on('mouseout', function() { tooltip.style('display', 'none'); })
        .on('mousemove', function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')');
            tooltip.select('text').text(d.y);
        });


    // Draw legend
    var legend = svg.selectAll('.legend')
        .data(colors)
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) { return 'translate(30,' + i * 19 + ')'; });

    legend.append('rect')
        .attr('x', BARS_TOTAL_WIDTH - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', function(d, i) { return colors.slice().reverse()[i]; });

    legend.append('text')
        .attr('x', BARS_TOTAL_WIDTH + 5)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')
        .text(function(d, i) {
            switch (i) {
                case 0:
                    return '日文';
                case 1:
                    return '德文';
                case 2:
                    return '法文';
                case 3:
                    return '英文';
                case 4:
                    return '國文';
            }
        });


    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    tooltip.append('rect')
        .attr('width', 30)
        .attr('height', 20)
        .attr('fill', 'white')
        .style('opacity', 0.5);

    tooltip.append('text')
        .attr('x', 15)
        .attr('dy', '1.2em')
        .style('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold');
});