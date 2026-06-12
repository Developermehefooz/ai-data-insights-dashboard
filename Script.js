const fileInput = document.getElementById("csvFile");

let globalData = [];

let lineChartInstance = null;
let pieChartInstance = null;

fileInput.addEventListener("change", function(event){

    const file = event.target.files[0];

    if(!file) return;

    const fileName =
    file.name.toLowerCase();

    if(fileName.endsWith(".csv")){

        readCSV(file);

    }else if(fileName.endsWith(".xlsx")){

        readExcel(file);
    }

});

function readCSV(file){

    const reader = new FileReader();

    reader.onload = function(e){

        const csvText = e.target.result;

        const rows =
        csvText.trim().split("\n");

        const data =
        rows.map(row =>
            row.split(",")
        );

        processData(data);

    };

    reader.readAsText(file);
}

function readExcel(file){

    const reader = new FileReader();

    reader.onload = function(e){

        const workbook =
        XLSX.read(
            e.target.result,
            {type:"binary"}
        );

        const sheet =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

        const data =
        XLSX.utils.sheet_to_json(
            sheet,
            {header:1}
        );

        processData(data);

    };

    reader.readAsBinaryString(file);
}

function processData(data){

    globalData = data;

    document.getElementById("rows")
    .textContent =
    data.length - 1;

    document.getElementById("columns")
    .textContent =
    data[0].length;

    displayTable(data);

    calculateStats(data);

    createLineChart(data);

    createPieChart(data);
}

function displayTable(data){

    let html = "<table>";

    data.forEach((row,index)=>{

        html += "<tr>";

        row.forEach(cell=>{

            if(index === 0){

                html +=
                `<th>${cell}</th>`;

            }else{

                html +=
                `<td>${cell}</td>`;
            }

        });

        html += "</tr>";

    });

    html += "</table>";

    document.getElementById(
        "tableContainer"
    ).innerHTML = html;
}

function calculateStats(data){

    let html = "";

    let salaryColumn = [];

    for(let row=1;
        row<data.length;
        row++){

        const value =
        parseFloat(
            data[row][2]
        );

        if(!isNaN(value)){

            salaryColumn.push(value);
        }
    }

    const totalSales =
    salaryColumn.reduce(
        (a,b)=>a+b,
        0
    );

    const avgSales =
    totalSales /
    salaryColumn.length;

    document.getElementById(
        "totalSales"
    ).textContent =
    totalSales.toLocaleString();

    document.getElementById(
        "avgSales"
    ).textContent =
    avgSales.toFixed(2);

    const max =
    Math.max(...salaryColumn);

    const min =
    Math.min(...salaryColumn);

    html += `
    <div class="card">
        <h3>Salary Statistics</h3>

        <p>Total:
        ${totalSales.toLocaleString()}</p>

        <p>Average:
        ${avgSales.toFixed(2)}</p>

        <p>Maximum:
        ${max}</p>

        <p>Minimum:
        ${min}</p>
    </div>
    `;

    document.getElementById(
        "stats"
    ).innerHTML = html;
}

function createLineChart(data){

    const labels = [];

    const values = [];

    for(let i=1;
        i<data.length;
        i++){

        labels.push(
            data[i][0]
        );

        values.push(
            parseFloat(
                data[i][2]
            )
        );
    }

    if(lineChartInstance){

        lineChartInstance.destroy();
    }

    lineChartInstance =
    new Chart(

        document.getElementById(
            "lineChart"
        ),

        {
            type:"line",

            data:{

                labels:labels,

                datasets:[{

                    label:"Sales",

                    data:values,

                    tension:0.4
                }]
            },

            options:{

                responsive:true
            }
        }
    );
}

function createPieChart(data){

    const labels = [];

    const values = [];

    for(let i=1;
        i<data.length;
        i++){

        labels.push(
            data[i][0]
        );

        values.push(
            parseFloat(
                data[i][2]
            )
        );
    }

    if(pieChartInstance){

        pieChartInstance.destroy();
    }

    pieChartInstance =
    new Chart(

        document.getElementById(
            "pieChart"
        ),

        {
            type:"pie",

            data:{

                labels:labels,

                datasets:[{

                    data:values
                }]
            },

            options:{

                responsive:true
            }
        }
    );
}

document.getElementById(
    "search"
).addEventListener(
    "input",
    function(){

        const keyword =
        this.value
        .toLowerCase();

        const filtered =
        globalData.filter(
            row =>
            row.join(" ")
            .toLowerCase()
            .includes(keyword)
        );

        displayTable(filtered);
    }
);

document.getElementById(
    "downloadBtn"
).addEventListener(
    "click",
    function(){

        const csv =
        globalData
        .map(
            row =>
            row.join(",")
        )
        .join("\n");

        const blob =
        new Blob(
            [csv],
            {
                type:"text/csv"
            }
        );

        const link =
        document.createElement("a");

        link.href =
        URL.createObjectURL(
            blob
        );

        link.download =
        "export.csv";

        link.click();
    }
);

document.getElementById(
    "darkMode"
).addEventListener(
    "click",
    function(){

        document.body
        .classList
        .toggle("dark");
    }
);