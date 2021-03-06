const PLOT_WIDTH = 5000;
const PLOT_HEIGHT = 500;
const MARGIN = {
    top: 20,
    right: 160,
    bottom: 35,
    left: 30
};
const BARS_TOTAL_WIDTH = PLOT_WIDTH - MARGIN.left - MARGIN.right;
const BARS_TOTAL_HEIGHT = PLOT_HEIGHT - MARGIN.top - MARGIN.bottom;

d3.csv('data.csv', function(rows) {
    var languagesData = rows.map(function(row, rowIndex) {
        row['id'] = rowIndex; // add id
        return row; // update row
    });

    // Setup svg using Bostock's margin convention
    var svg = d3.select('body')
        .append('svg')
        .attr('width', PLOT_WIDTH)
        .attr('height', PLOT_HEIGHT)
        .append('g')
        .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

    // Transpose the data into layers
    var dataset = d3.layout.stack()(['國文', '英文', '法文', '德文', '日文'].map(function(language) {
        return languagesData.map(function(d) {
            return {
                x: d['id'],
                y: +d[language],
                attributeOne: d['屬性一'],
                attributeTwo: d['屬性二']
            };
        });
    }));

    // Set x, y and colors
    var x = d3.scale.ordinal()
        .domain(dataset[0].map(function(d) {
            return d.x;
        }))
        .rangeRoundBands([10, BARS_TOTAL_WIDTH - 10], 0.02);

    var y = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {
            return d3.max(d, function(d) {
                return d.y0 + d.y;
            });
        })])
        .range([BARS_TOTAL_HEIGHT, 0]);

    var colors = ['#173f5f', '#20639b', '#3caea3', '#f6d55c', '#ed553b'];


    // Define and draw axes
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(5)
        .tickSize(-BARS_TOTAL_WIDTH, 0, 0)
        .tickFormat(function(d) {
            return d;
        });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + BARS_TOTAL_HEIGHT + ')')
        .call(xAxis)
        .selectAll('text')
        .attr('transform', 'translate(-15, 5) rotate(-45)');


    // Create groups for each series, rects for each segment 
    var groups = svg.selectAll('g.cost')
        .data(dataset)
        .enter().append('g')
        .attr('class', 'cost')
        .style('fill', function(d, i) {
            return colors[i];
        });

    var rect = groups.selectAll('rect')
        .data(function(d) {
            return d;
        })
        .enter()
        .append('rect')
        .attr('x', function(d) {
            return x(d.x);
        })
        .attr('y', function(d) {
            return y(d.y0 + d.y);
        })
        .attr('rx', function(d) {
            return d['attributeOne'] === '1' ? '6' : '0';
        })
        .attr('height', function(d) {
            return y(d.y0) - y(d.y0 + d.y);
        })
        .attr('width', x.rangeBand())
        .style('opacity', function(d) {
            return d['attributeTwo'] === '0' ? '0.5' : '1';
        })
        .on('mouseover', function() {
            tooltip.style('display', null);
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
        })
        .on('mousemove', function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')');
            tooltip.select('text').text('值：' + d.y + ' | 屬性一：' + d['attributeOne'] + ' | 屬性二：' + d['attributeTwo']);
        });


    // Draw legend
    colors.unshift('#9932CC');
    colors.unshift('#9932CC');
    colors.unshift('rgb(153, 50, 204, 0.5)');
    colors.unshift('#9932CC');

    var legend = svg.selectAll('.legend')
        .data(colors)
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            return 'translate(30,' + i * 19 + ')';
        });

    legend.append('rect')
        .attr('x', BARS_TOTAL_WIDTH - 18)
        .attr('rx', function(d, i) {
            return i === 5 ? '6' : '0';
        })
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', function(d, i) {
            return colors.slice().reverse()[i];
        });

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
                case 5:
                    return '屬性一：1';
                case 6:
                    return '屬性一：2';
                case 7:
                    return '屬性二：0';
                case 8:
                    return '屬性二：1';
            }
        });


    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    tooltip.append('rect')
        .attr('width', 200)
        .attr('height', 20)
        .attr('fill', 'white')
        .style('opacity', 0.6);

    tooltip.append('text')
        .attr('x', 15)
        .attr('dy', '1.2em')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold');
});