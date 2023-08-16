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
    parseDatasetUrl,
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
    getDownloadByDatasetId
} from './sdk/datastore.js';

import {
    getSearchFacets,
    getSearch
} from "./sdk/search.js";

import {
    getDatastoreQuerySql
} from "./sdk/sql.js"

import {
    endpointStore,
    getItems,
    clearCache
} from "./sdk/httpMethods.js"

import {
    getAllNdcObjs,
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    getMedData,
    getNadacInfo,
    plotNadacNdc,
    plotNadacMed
} from "./sdk/plot/nadac.js"

import {
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    getHealthcareMeasuresInfo,
    plotRateBar,
    plotRateTimeSeries
} from "./sdk/plot/healthcareMeasures.js"

import {
    getUtilData,
    getUtilDataTimeSeries,
    getDrugUtilDataBar,
    getUtilMapData,
    getUtilInfo,
    plotUtilTimeSeries,
    plotDrugUtilBar,
    plotUtilMap,
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
    getNDCsFromRxcui,
    getRxcuiFromNdc,
    getDiseaseIdMap,
    getRxcuiFromDisease,
    getDrugsFromDisease,
    getNdcsFromDisease,
    getRxcuiProperties
} from "./sdk/rxNorm.js"

import {
    getDrugContext
} from "./sdk/fda.js";

export {
    endpointStore,
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
    parseDatasetUrl,
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
    //sql
    getDatastoreQuerySql,
    //search
    getSearchFacets,
    getSearch,
    //plot
    Plotly,
    plot,
    getUniqueValues,
    //Nadac
    getAllNdcObjs,
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    getNadacInfo,
    plotNadacNdc,
    plotNadacMed,
    getMedData,
    //healthcare quality
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    getHealthcareMeasuresInfo,
    plotRateBar,
    plotRateTimeSeries,
    //drug utilization
    getUtilData,
    getUtilDataTimeSeries,
    getDrugUtilDataBar,
    getUtilMapData,
    getUtilInfo,
    plotUtilTimeSeries,
    plotDrugUtilBar,
    plotUtilMap,
    getDrugUtilDataXX,
    plotDrugUtilDataXX,
    //rxNorm
    getAllDiseases,
    getNDCsFromRxcui,
    getRxcuiFromNdc,
    getDiseaseIdMap,
    getRxcuiFromDisease,
    getDrugsFromDisease,
    getNdcsFromDisease,
    getRxcuiProperties,
    //fda
    getDrugContext
}

//initialize localforage
getSchemas().then();