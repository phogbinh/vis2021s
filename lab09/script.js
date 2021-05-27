const WIDTH = 1280;
const HEIGHT = 720;

var myArray = [];
var svg;

function play() {
    document.getElementById('video').play();
    playSubtitle();
}

d3.text('chinese.srt').then(function(data) {
    var parsedCSV = d3.csvParseRows(data);

    var key;
    var begin;
    var end;
    var duration;
    var subtitle = '';
    d3.select('body')
        .data(parsedCSV)
        .enter()
        .text(function(d, i) {
            if (!isNaN(d) && d != '') {
                key = parseInt(d) - 1;
            } else if (d == '') {
                myArray.push({
                    'key': key,
                    'begin': begin,
                    'end': end,
                    'duration': end - begin,
                    'subtitle': subtitle
                });
                subtitle = '';
            } else if (d.length === 3) {
                var minute;
                var second;

                minute = parseInt(d[0][3]) * 10 + parseInt(d[0][4]);
                second = parseInt(d[0][6]) * 10 + parseInt(d[0][7]);
                begin = minute * 60 + second + parseInt(d[1][0]) / 10.0 + parseInt(d[1][1]) / 100.0;

                minute = parseInt(d[1][11]) * 10 + parseInt(d[1][12]);
                second = parseInt(d[1][14]) * 10 + parseInt(d[1][15]);
                end = minute * 60 + second + parseInt(d[2][0]) / 10.0 + parseInt(d[2][1]) / 100.0;
            } else {
                if (subtitle === '') {
                    subtitle = d[0];
                } else {
                    subtitle += d[0];
                }
            }
        });

    console.log(myArray);

    svg = d3.select('body')
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('viewbox', function() {
            return '0, 0, ' + WIDTH + ', ' + HEIGHT;
        });
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('fill', 'none')
        .attr('stroke', 'red');
});

function playSubtitle() {
    svg.selectAll('text')
        .data(myArray)
        .enter()
        .append('text')
        .text(function(d) {
            return d.subtitle;
        })
        .attr('font-size', '30pt')
        .attr('fill', 'black')
        .attr('stroke', function(d) {
            return d.subtitle.includes('迷失') ? 'red' : 'none';
        })
        .attr('x', WIDTH / 2)
        .attr('y', HEIGHT - 25)
        .attr('text-anchor', 'middle')
        .attr('opacity', 0)
        .transition()
        .delay(function(d) {
            return d.begin * 1000;
        })
        .duration(0)
        .attr('opacity', 1)
        .transition()
        .delay(function(d) {
            return d.duration * 1000;
        })
        .duration(function(d) {
            return d.subtitle.includes('迷失') ? 500 : 0;
        })
        .attr('opacity', 0);
}