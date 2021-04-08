var title = "treemap";

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
	
	var makeMapping = function(mappingRange){
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
	
	//將原有數值對應到較小的區間
	var mapping = makeMapping([20, 100])

    var d3json = {
        children: [],
        name: title
    }

	var layer = []
	//循環讀取所有的data
    csvData.forEach(function(d){
		//這邊讀取所有非分層的名稱，只要該名稱不是分層名字就加入子節點中
		//比如你想用 類別 作為分層名稱，那就把除了類別的名稱加入子節點	
		var list = []
		for(var k in d){
			if(k != key){
				list.push(k)
			}
		}
		
		//這邊將所有的分層名稱加入至layer陣列中
        layer.push(d[key])

        //以單位名稱作為分曾
        d3json.children.push({
            name: d[key],
            children: list.map(function(k){
                //代表每一個長方形的大小
				//如果直接以節點本身的數值計算長方形大小，可能會因為不同節點的數值差異過大
				//而導致有些長方形面積很大，有些很小，會有很多長方形湖在一起
                return {
                    name: k,
                    size: mapping[d[k]],
                    value: d[k]
                }
            })
        })
    })

    callback(d3json, layer)
}