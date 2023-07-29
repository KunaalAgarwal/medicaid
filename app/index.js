import { plotNadacMed } from "../sdk/plot/nadac.js";
import {plotDrugUtil, plotDrugUtilBar, plotDrugUtilMap} from "../sdk/plot/drugUtilization.js";

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

const graphDivs = [];
const graphDiv = document.getElementById("graph");
async function generateGraphs() {
    try {
        graphDivs.push(await plotNadacMed(["24385005452"], drugTimeLayout));
        graphDivs.push(await plotDrugUtilMap("00536105556"));
        graphDivs.push(await plotDrugUtil(["24385005452"], drugUtilTime));
        graphDivs.push(await plotDrugUtilBar("00536105556", drugUtilState));
        graphDivs.forEach(graph => {
            graphDiv.appendChild(graph);
        })
        if (graphDivs.includes(undefined) || graphDivs.length === 0){
            location.reload();
        }
    } catch (error) {
        location.reload();
    }
}

await generateGraphs();
let currentGraphIndex = 0;
function showCurrentGraph() {
    // Hide all graph divs
    graphDivs.forEach((div, index) => {
        if (index === currentGraphIndex) {
            div.style.display = "block"; // Show the current graph div
        } else {
            div.style.display = "none"; // Hide other graph divs
        }
    });
}

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
