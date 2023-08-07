import {
    getSchemas,
    getSpecificSchema,
    getSchemaItems,
    getAllDatasetUrls,
    getDatasetByTitleName,
    getDatasetByKeyword,
    getDatasetByDescription,
    getSchemaItemById,
    getDatasetById,
    getDatasetByDownloadUrl,
    parseDownloadLink,
    convertDatasetToDistributionId,
    convertDistributionToDatasetId,
    getDistributionByDownloadUrl,
    getDistributionById
} from './sdk/metastore.js';

import {
    postDatastoreQuery,
    getDatastoreImport,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset,
    getAllDataFromDistribution,
    getDownloadByDistributionId,
    getDownloadByDatasetId,
    createDownloadLink
} from './sdk/datastore.js';

import {
    getSearchFacets,
    getSearch
} from "./sdk/search.js";

import {
    getDatastoreQuerySql
} from "./sdk/sql.js"

import {
    getItems,
    clearCache,
    localforage
} from "./sdk/httpMethods.js"

import {
    getAllNdcObjs,
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    getMedData,
    parseSelectedMeds,
    filterSelectedMeds,
    plotNadacMed
} from "./sdk/plot/nadac.js"

import {
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    plotRateBar,
    plotRateTimeSeries
} from "./sdk/plot/healthcareMeasures.js"

import {
    getDrugUtilData,
    plotDrugUtil,
    plotDrugUtilBar,
    getDrugUtilDataBar,
    plotDrugUtilMap,
    getDrugUtilDataXX,
    plotDrugUtilDataXX
} from "./sdk/plot/drugUtilization.js"

import {
    getUniqueValues,
    plot,
    Plotly
} from "./sdk/plot/plot.js"

import {
    getAllDiseases,
    diseaseToDrugs
} from "./sdk/rxNorm.js"

export {
    localforage,
    getItems,
    clearCache,
    //metastore
    getSchemas,
    getSpecificSchema,
    getSchemaItems,
    getAllDatasetUrls,
    getDatasetByTitleName,
    getDatasetByKeyword,
    getDatasetByDescription,
    getSchemaItemById,
    getDatasetById,
    getDatasetByDownloadUrl,
    parseDownloadLink,
    convertDatasetToDistributionId,
    convertDistributionToDatasetId,
    getDistributionByDownloadUrl,
    getDistributionById,
    //datastore
    getDatastoreImport,
    postDatastoreQuery,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset,
    getAllDataFromDistribution,
    getDownloadByDistributionId,
    getDownloadByDatasetId,
    createDownloadLink,
    //sql
    getDatastoreQuerySql,
    //search
    getSearchFacets,
    getSearch,
    //plot
    getUniqueValues,
    getAllNdcObjs,
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    parseSelectedMeds,
    filterSelectedMeds,
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    getMedData,
    getDrugUtilData,
    getDrugUtilDataBar,
    plotNadacMed,
    plotRateBar,
    plotRateTimeSeries,
    plotDrugUtil,
    plotDrugUtilBar,
    plot,
    getDrugUtilDataXX,
    plotDrugUtilDataXX,
    Plotly,
    plotDrugUtilMap,
    //rxNorm
    getAllDiseases,
    diseaseToDrugs
}

//initialize localforage
getSchemas().then();