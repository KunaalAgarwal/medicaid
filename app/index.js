import { plotNadacMed } from "../sdk/plot/nadac.js";
import { plotDrugUtil, plotDrugUtilBar } from "../sdk/plot/drugUtilization.js";

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
const prevButton = document.getElementById("prev")
const nextButton = document.getElementById("next")

//array to flip through graphs
const graphGenerators = [
    () => plotNadacMed(["24385005452"], drugTimeLayout),
    () => plotDrugUtil(["24385005452"], drugUtilTime),
    () => plotDrugUtilBar(["24385005452"], drugUtilState)
];

const graphDiv = document.getElementById("graph");
let currentGraphIndex = 0;

async function showCurrentGraph() {
    graphDiv.innerHTML = ""; // Clear the existing content
    const currentGraph = await graphGenerators[currentGraphIndex]();
    graphDiv.appendChild(currentGraph);
}

function next() {
    currentGraphIndex++;
    if (currentGraphIndex >= graphGenerators.length) {
        currentGraphIndex = 0; // Reset to the first graph if at the end
    }
    showCurrentGraph();
}

function prev() {
    currentGraphIndex--;
    if (currentGraphIndex < 0) {
        currentGraphIndex = graphGenerators.length - 1;
    }
    showCurrentGraph();
}

prevButton.addEventListener('click', prev);
nextButton.addEventListener('click', next);

showCurrentGraph();
