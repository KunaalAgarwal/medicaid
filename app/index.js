import * as sdk from "../sdk.js"
//setting up graph layouts and getting necessary button ids
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

graphDivs.push(await sdk.plotNadacMed("CALCITRIOL 1 MCG/ML SOLUTION", drugTimeLayout));
showCurrentGraph();

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
        graphDivs.push(await sdk.plotUtilMap("00536105556"));
        graphDivs.push(await sdk.plotUtilTimeSeries(["24385005452"], drugUtilTime));
        graphDivs.push(await sdk.plotDrugUtilBar("00536105556", drugUtilState));
        graphDivs.push(await sdk.plotRateBar("Percentage Enrolled in Medicaid or Medicaid Expansion CHIP Programs for at least 90 Continuous Days with at Least 1 Preventive Dental Service: Ages 1 to 20"
            , "Percentage of Eligibles Who Received Preventive Dental Services: Ages 1 to 20", healthcareQualityBarLayout))
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
        currentGraphIndex = 0; // Reset to the first graph if at the end
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