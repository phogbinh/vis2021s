function dataLoader(csvText, callbackFunc) {
    var csvUri = 'data:text/plain;base64,' + Base64.encode(csvText);
    d3.csv(csvUri, function(rows) { // update global variable `csvData`
        csvData = rows.map(function(row) { // process salary data
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
        callbackFunc();
    });
}

function dataClassifier(key, callback) {
    var allBoss = getAllBoss();
    var d3Json = getD3Json(allBoss, getMapping([0, 100]));
    callback(allBoss, d3Json);
}

function getAllBoss() {
    var allBoss = [];
    csvData.forEach(function(row) {
        const bossName = row['廠商'];
        if (allBoss.indexOf(bossName) === -1) {
            allBoss.push(bossName);
        }
    });
    return allBoss;
}

function getD3Json(allBoss, mapping) {
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
    csvData.forEach(function(row) {
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

function getMapping(mappingRange) {
         var flatten = []
 
         var correspondingMapping = {}
 
         //將所有數值取出置入faltten中
         for(var i = 0; i<csvData.length; i++){
             for(var j in csvData[i]){
                 if(typeof csvData[i][j] == "number"){
                     correspondingMapping[csvData[i][j]] = null
                     flatten.push(csvData[i][j])
                 }
             }
         }
 
         flatten = flatten.sort(function(a,b){
             return a - b
         })
         //數值映射公式
         //假設原本的區間為Omin~Omax，對應的區間為Nmin~Nmax
         //公式為Nmapping = [(Nmax-Nmin) / (Omax-Omin) * (O-Omin)] + Nmin
         for(var k in correspondingMapping){
             correspondingMapping[k] = ((mappingRange[1] - mappingRange[0]) / (flatten[flatten.length - 1] - flatten[0])) * (parseFloat(k) - flatten[0]) + mappingRange[0]
         }
 
         return correspondingMapping
}
