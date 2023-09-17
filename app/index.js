import * as sdk from "../sdk.js"
// setting up graph layouts and getting necessary button ids
const drugTimeLayout = {
    title: {
        text: "National Average Drug Acquisition Cost" ,
    },
    xaxis: {
        title: {
            text: 'Year',
        },
    },
    yaxis: {
        title: {
            text: 'Per Unit Price ($USD)',
        }
    },
    width: 800
}
const drugUtilTime = {
    title: `NADAC Drug Utilization`,
    xaxis: {
        title: "Year",
        tickfont: { size: 14 },
        showgrid: true,
        zeroline: false
    },
    yaxis: {
        title: 'Total Amount Reimbursed ($)',
        titlefont: { size: 16 },
        tickfont: { size: 14 },
        showgrid: true,
        zeroline: false
    },
    yaxis2: {
        title: 'Number of Prescriptions',
        overlaying: 'y',
        side: 'right',
        titlefont: { size: 16 },
        tickfont: { size: 14 },
        showgrid: true,
        zeroline: false
    },
    legend: {
        x: 1,
        y: 0,
        xanchor: 'right',
        yanchor: 'bottom',
        bgcolor: 'rgba(255, 255, 255, 0.5)',
        bordercolor: '#000',
        borderwidth: 1,
        font: { size: 12 }
    }
}
const drugUtilState = {
    title: {
        text: "Drug Utilization By State",
        font: {
            size: 18
        }
    },
    yaxis: {
        title: {
            text: "Total Reimbursed ($)"
        }
    },
}
const healthcareQualityBarLayout = {
    title: {
        text: "Percentage with Preventative Dental Insurance",
        font: {
            size: 13
        }
    },
    yaxis: {
        title: {
            text: "Percent of Population (2020)"
        }
    },
}
const prevButton = document.getElementById("prev")
const nextButton = document.getElementById("next")

const graphDivs = [];
const graphDiv = document.getElementById("graph");
let currentGraphIndex = 0;

function showCurrentGraph() {
    // Hide all graph divs
    graphDivs.forEach((div, index) => {
        if (index === currentGraphIndex) {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    });
}
async function generateGraphs() {
    try {
        graphDivs.push(await sdk.plotNadacMed("CALCITRIOL 1 MCG/ML SOLUTION", drugTimeLayout));
        graphDivs.push(await sdk.plotUtilMap("TRULICITY ", {outliers: true, filter: "product_name", yAxis: "total_amount_reimbursed", year: "2022"}));
        graphDivs.push(await sdk.plotUtilTimeSeries("TRULICITY ", drugUtilTime, null, {yAxis: "total_amount_reimbursed", y2: "number_of_prescriptions", filter: "product_name"}));
        graphDivs.push(await sdk.plotDrugUtilBar("TRULICITY ", drugUtilState, null, {yAxis: "total_amount_reimbursed", year: '2022', filter: "product_name"}));
        graphDivs.push(await sdk.plotRateBar("Percentage who had a New Prescription for an Antipsychotic Medication and had Documentation of Psychosocial Care as First-Line Treatment: Ages 1 to 17"
            , "Use of First-Line Psychosocial Care for Children and Adolescents on Antipsychotics: Ages 1 to 17"
            , healthcareQualityBarLayout))
        graphDivs.forEach(graph => {
            graphDiv.appendChild(graph);
        })
    } catch (error){
        location.reload();
    }
}

await generateGraphs();
console.log(graphDivs);

async function next() {
    currentGraphIndex++;
    if (currentGraphIndex >= graphDivs.length) {
        currentGraphIndex = 0;
    }
    await showCurrentGraph();
}

async function prev() {
    currentGraphIndex--;
    if (currentGraphIndex < 0) {
        currentGraphIndex = graphDivs.length - 1;
    }
    await showCurrentGraph();
}

prevButton.addEventListener("click", prev);
nextButton.addEventListener("click", next);

showCurrentGraph();