const WIDTH = 1280;
const HEIGHT = 720;

var myArray = [];
var updateClock;

window.addEventListener('load', function() {
    document.getElementById('video').onended = function() {
        document.getElementById('play').style.display = 'inline';
        document.getElementById('video').style.display = 'none';
        var subtitle = document.getElementById('subtitle');
        while (subtitle.firstChild) {
            subtitle.removeChild(subtitle.firstChild);
        }
        subtitle.remove();
        clearInterval(updateClock);
    };

    d3.text('chinese.srt').then(function(data) {
        var parsedCSV = d3.csvParseRows(data);

        var key;
        var begin;
        var end;
        var subtitle = '';
        d3.select('body')
            .data(parsedCSV)
            .enter()
            .text(function(d) {
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

        d3.select('body')
            .append('svg')
            .attr('id', 'play')
            .attr('width', WIDTH)
            .attr('height', HEIGHT)
            .append('text')
            .text('播放')
            .attr('x', WIDTH / 2)
            .attr('y', HEIGHT / 2)
            .attr('font-size', '60pt')
            .on('click', function() {
                document.getElementById('play').style.display = 'none';
                document.getElementById('video').style.display = 'inline';
                document.getElementById('video').play();
                playSubtitle();
                playTime();
            });
    });
});

function playSubtitle() {
    d3.select('body')
        .append('svg')
        .attr('id', 'subtitle')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .selectAll('text')
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

function playTime() {
    var currentTime = 0;

    var duration = parseInt(document.getElementById('video').duration);

    updateClock = setInterval(() => {
        var clockCurrentTime = getClock(currentTime);
        var clockDuration = getClock(duration);
        d3.select('#subtitle')
            .append('text')
            .text(clockCurrentTime + ' / ' + clockDuration)
            .attr('x', WIDTH - 120)
            .attr('y', 42)
            .attr('opacity', 1)
            .transition()
            .delay(1000)
            .duration(0)
            .remove();
        ++currentTime;
    }, 1000);
}

function getClock(time) {
    if (time % 60 < 10) {
        return '0' + parseInt(time / 60) + ':' + '0' + time % 60;
    } else {
        return '0' + parseInt(time / 60) + ':' + time % 60;
    }
}