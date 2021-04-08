const MIN_SALARY_SCORE = 10;
const MAX_SALARY_SCORE = 100;

window.addEventListener('load', function() {
    var treemapContainer = document.getElementById('treemap');
    document.getElementById('dropfile').addEventListener('dragover', function(event) {
        event.preventDefault();
    });
    document.getElementById('dropfile').addEventListener('drop', function(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length) {
            if (treemapContainer.innerHTML.length) {
                treemapContainer.innerHTML = '';
            }
            //讀取csv
            var fileReader = new FileReader();
            fileReader.onload = function() {
                processJobData(fileReader.result, treemapContainer);
            };
            fileReader.readAsText(files[0]);
        }
    });
});

function processJobData(fileText, treemapContainer) {
    const csvUri = 'data:text/plain;base64,' + getEncodeBase64(fileText);
    d3.csv(csvUri, function(rows) {
        var jobData = rows.map(function(row) { // process salary data
            var salaryText = row['待遇'].replace(/,/g, ''); // remove all commas
            const firstDigitRegexMatch = /[0-9]/.exec(salaryText);
            var salary = 0;
            for (var i = firstDigitRegexMatch['index']; i < salaryText.length; ++i) {
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
        const employers = getEmployers(jobData);
        const d3Json = getD3Json(jobData, employers, getSalaryScoreMap(jobData, [MIN_SALARY_SCORE, MAX_SALARY_SCORE]));
        treemapContainer.appendChild(mkSVG(treemapContainer, employers, d3Json));
    });
}

function getEncodeBase64(text) {
    const KEY_STRING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var t, e, o, a, h, c;
    var result = '';
    var d = 0;
    text = getEncodeUtf8(text);
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

function getEncodeUtf8(text) {
    text = text.replace(/\r\n/g, '\n');
    var result = '';
    for (var i = 0; i < text.length; i++) {
        var o = text.charCodeAt(i);
        o < 128 ? result += String.fromCharCode(o) : (127 < o && o < 2048 ? result += String.fromCharCode(o >> 6 | 192) : (result += String.fromCharCode(o >> 12 | 224), result += String.fromCharCode(o >> 6 & 63 | 128)), result += String.fromCharCode(63 & o | 128));
    }
    return result;
}

function getEmployers(jobData) {
    var employers = [];
    jobData.forEach(function(row) {
        const employer = row['廠商'];
        if (employers.indexOf(employer) === -1) {
            employers.push(employer);
        }
    });
    return employers;
}

function getD3Json(jobData, employers, salaryScoreMap) {
    var d3Json = {
        children: [],
        name: 'vis2021s'
    };
    for (var i = 0; i < employers.length; ++i) {
        d3Json.children.push({
            name: employers[i],
            children: []
        });
    }
    jobData.forEach(function(row) {
        const salary = row['待遇'];
        d3Json.children.find(element => element.name === row['廠商']).children.push({
            jobName: row['職稱'],
            salary: salary,
            value: salaryScoreMap[salary] // must be `value` for d3 treemap
        });
    });
    return d3Json;
}

function getSalaryScoreMap(jobData, salaryScoreMapInterval) {
    var salaries = [];
    jobData.forEach(function(row) {
        salaries.push(row['待遇']);
    });
    salaries.sort();
    //數值映射公式
    //假設原本的區間為Omin~Omax，對應的區間為Nmin~Nmax
    //公式為Nmapping = [(Nmax-Nmin) / (Omax-Omin) * (O-Omin)] + Nmin
    var map = {};
    for (var i = 0; i < salaries.length; ++i) {
        var salary = salaries[i];
        map[salary] = ((salaryScoreMapInterval[1] - salaryScoreMapInterval[0]) / (salaries[salaries.length - 1] - salaries[0])) * (salary - salaries[0]) + salaryScoreMapInterval[0];
    }
    return map;
}

//產生SVG
function mkSVG(treemapContainer, bosses, data) {
    const treemap = document.createElement('div')

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };
    const height = treemapContainer.clientHeight - margin.top - margin.bottom;
    const width = treemapContainer.clientWidth - margin.left - margin.right;

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
        }) => '分數：' + data.value.toFixed(2))
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