window.addEventListener('load', function() {
    var treemapContainer = document.getElementById('treemap');
    document.getElementById('dropfile').addEventListener('dragover', function(event) {
        event.preventDefault();
    });
    document.getElementById('dropfile').addEventListener('drop', function(event) {
        event.preventDefault();
        var files = event.dataTransfer.files;
        if (files.length) {
            if (treemapContainer.innerHTML.length) {
                treemapContainer.innerHTML = '';
            }
            //讀取csv
            var fileReader = new FileReader();
            fileReader.onload = function() {
                loadData(fileReader.result, treemapContainer);
            };
            fileReader.readAsText(files[0]);
        }
    });
});

function loadData(fileText, treemapContainer) {
    var csvUri = 'data:text/plain;base64,' + get_base64_encode(fileText);
    d3.csv(csvUri, function(rows) { // update global variable `csvData`
        var jobData = rows.map(function(row) { // process salary data
            var salaryText = row['待遇'].replace(/,/g, ''); // remove all commas
            var firstDigitMatch = /[0-9]/.exec(salaryText);
            var salary = 0;
            for (var i = firstDigitMatch['index']; i < salaryText.length; ++i) {
                if (!(('0' <= salaryText[i] && salaryText[i] <= '9'))) { // break on non-digit
                    break;
                }
                salary = salary * 10 + (salaryText[i] - '0');
            }
            if (salary < 1000) { // convert hourly salary to monthly salary
                salary = salary * 8 * 5 * 4; // 8 hours/day, 5 days/week, 4 weeks/month
            }
            row['待遇'] = salary; // update salary data
            return row; // update row
        });
        var allBoss = getAllBoss(jobData);
        var d3Json = getD3Json(jobData, allBoss, getMapping(jobData, [0, 100]));
        treemapContainer.appendChild(mkSVG(treemapContainer, allBoss, d3Json));
    });
}

function get_base64_encode(text) {
    const KEY_STRING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var t, e, o, a, h, c;
    var result = '';
    var d = 0;
    text = get_utf8_encode(text);
    for (; d < text.length;) {
        o = (c = text.charCodeAt(d++)) >> 2;
        a = (3 & c) << 4 | (t = text.charCodeAt(d++)) >> 4;
        h = (15 & t) << 2 | (e = text.charCodeAt(d++)) >> 6;
        c = 63 & e;
        isNaN(t) ? h = c = 64 : isNaN(e) && (c = 64);
        result = result + KEY_STRING.charAt(o) + KEY_STRING.charAt(a) + KEY_STRING.charAt(h) + KEY_STRING.charAt(c);
    }
    return result;
}

function get_utf8_encode(text) {
    text = text.replace(/\r\n/g, '\n');
    var result = '';
    for (var i = 0; i < text.length; i++) {
        var o = text.charCodeAt(i);
        o < 128 ? result += String.fromCharCode(o) : (127 < o && o < 2048 ? result += String.fromCharCode(o >> 6 | 192) : (result += String.fromCharCode(o >> 12 | 224), result += String.fromCharCode(o >> 6 & 63 | 128)), result += String.fromCharCode(63 & o | 128));
    }
    return result;
}

function getAllBoss(jobData) {
    var allBoss = [];
    jobData.forEach(function(row) {
        const bossName = row['廠商'];
        if (allBoss.indexOf(bossName) === -1) {
            allBoss.push(bossName);
        }
    });
    return allBoss;
}

function getD3Json(jobData, allBoss, mapping) {
    var d3Json = {
        children: [],
        name: 'vis2021s'
    };
    for (var i = 0; i < allBoss.length; ++i) {
        d3Json.children.push({
            name: allBoss[i],
            children: []
        });
    }
    jobData.forEach(function(row) {
        const bossName = row['廠商'];
        const salary = row['待遇'];
        d3Json.children.find(element => element.name === bossName).children.push({
            jobName: row['職稱'],
            salary: salary,
            value: mapping[salary]
        });
    });
    return d3Json;
}

function getMapping(jobData, mappingRange) {
    var flatten = []

    var correspondingMapping = {}

    //將所有數值取出置入faltten中
    for (var i = 0; i < jobData.length; i++) {
        for (var j in jobData[i]) {
            if (typeof jobData[i][j] == "number") {
                correspondingMapping[jobData[i][j]] = null
                flatten.push(jobData[i][j])
            }
        }
    }

    flatten = flatten.sort(function(a, b) {
            return a - b
        })
        //數值映射公式
        //假設原本的區間為Omin~Omax，對應的區間為Nmin~Nmax
        //公式為Nmapping = [(Nmax-Nmin) / (Omax-Omin) * (O-Omin)] + Nmin
    for (var k in correspondingMapping) {
        correspondingMapping[k] = ((mappingRange[1] - mappingRange[0]) / (flatten[flatten.length - 1] - flatten[0])) * (parseFloat(k) - flatten[0]) + mappingRange[0]
    }

    return correspondingMapping
}

//產生SVG
function mkSVG(container, bosses, data) {
    const treemap = document.createElement('div')

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };
    const height = container.clientHeight - margin.top - margin.bottom;
    const width = container.clientWidth - margin.left - margin.right;

    const svg = d3.select(treemap)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')

    //利用d3.hierarchy產生x y的資料
    const d3ds = d3.hierarchy(data).sum(({
        value
    }) => value)


    //設定svg位置
    d3.treemap()
        .size([width, height])
        .paddingTop(45)
        .paddingRight(15)
        .paddingInner(10)
        (d3ds)


    //設定指導教授顏色
    const color = d3.scaleOrdinal()
        .domain(bosses)
        .range(["#402D54", "#D18975", "#8FD175", "#ff66ff", "#ffb366", "#80ff80", "#d279a6", "#ff6633", "#6600ff", "#00bfff", "#53c653", "#ff8000"])

    //設定透明度，分數越低越透明
    const opacity = d3.scaleLinear()
        .domain([100, 0])
        .range([1, .1])

    //化長方形
    svg
        .selectAll('rectangle')
        .data(d3ds.leaves())
        .enter()
        .append('rect')
        .attr('x', ({
            x0
        }) => x0)
        .attr('y', ({
            y0
        }) => y0)
        .attr('width', ({
            x0,
            x1
        }) => x1 - x0)
        .attr('height', ({
            y0,
            y1
        }) => y1 - y0)
        .style('stroke', 'red')
        .style('fill', ({
            parent
        }) => color(parent.data.name))
        .style('opacity', (d) => opacity(d.data.value))


    //寫學生姓名
    svg
        .selectAll('studentNames')
        .data(d3ds.leaves())
        .enter()
        .append('text')
        .attr('x', ({
            x0
        }) => x0 + 1)
        .attr('y', ({
            y0
        }) => y0 + 20)
        .text(({
            data
        }) => '職稱：' + data.jobName)
        .attr('font-size', '1rem')
        .attr('fill', 'white')

    //寫學生分數
    svg
        .selectAll('studentScore')
        .data(d3ds.leaves())
        .enter()
        .append('text')
        .attr('x', ({
            x0
        }) => x0 + 1)
        .attr('y', ({
            y0
        }) => y0 + 35)
        .text(({
            data
        }) => data.value.toFixed(2))
        .attr('font-size', '.9rem')
        .attr('fill', 'white')

    svg
        .selectAll('studentSecond')
        .data(d3ds.leaves())
        .enter()
        .append('text')
        .attr('x', ({
            x0
        }) => x0 + 1)
        .attr('y', ({
            y0
        }) => y0 + 50)
        .text(({
            data
        }) => '月新：' + data.salary + '元')
        .attr('font-size', '.9rem')
        .attr('fill', 'white')

    svg
        .selectAll('labertory')
        .data(d3ds.descendants().filter(function(d) {
            return d.depth == 1
        }))
        .enter()
        .append('text')
        .attr('x', ({
            x0
        }) => x0 + 1)
        .attr('y', ({
            y0
        }) => y0 + 21)
        .text(({
            data
        }) => data.name)
        .attr('font-size', '1.1rem')
        .attr('fill', 'black')

    return treemap
}