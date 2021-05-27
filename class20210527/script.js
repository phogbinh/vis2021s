const WIDTH = 960;
const HEIGHT = 540;

window.addEventListener('load', function() {
    var svg = d3.select('body')
        .append('svg')
        .attr('id', 'svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .style('border', '5px solid red');

    var dataset = [1, 2, 3, 4, 5];

    svg.selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('cx', function(d, i) {
            return (50 + i * 128);
        })
        .attr('cy', function() {
            return (HEIGHT / 2);
        })
        .attr('r', function(d) {
            return (d * 10);
        })
        .attr('fill', 'cyan')
        .attr('stroke', 'red')
        .attr('stroke-width', '5');

    // var dataset = [1, 2, 3, 4, 5];
    dataset = [1, 1, 1, 2, 2, 2, 2];

    var circles = svg.selectAll('circle')
        .data(dataset);

    // enter
    circles.enter()
        .append('circle')
        .attr('cx', function(d, i) {
            return (50 + i * 128);
        })
        .attr('cy', function() {
            return (HEIGHT / 2);
        })
        .attr('r', function(d) {
            return (d * 10);
        })
        .attr('fill', 'cyan')
        .attr('stroke', 'red')
        .attr('stroke-width', '5')
        .attr('opacity', '0')
        .transition()
        .duration(2000)
        .attr('opacity', '1');

    // update
    circles.merge(circles)
        .attr('r', function(d) {
            return (d * 10);
        });

    // exit
    circles.exit()
        .attr('opacity', '1')
        .transition()
        .duration(2000)
        .attr('opacity', '0')
        .remove();
});