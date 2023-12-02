const express = require("express");
const stream = require('stream');
const ExcelJS = require('exceljs');
const fs = require('fs');

const { MappingApplier } = require("../src/mapping_applier");
const { ExcelTable } = require('../src/excel.js');


const tableRoutes = express.Router();
const applier = new MappingApplier();


//const dbo = require("../db/conn");

//receive a mapping, return a excel table (in the form of a stream)
tableRoutes.route("/tables/download").post(async (req, res) => {
    let mappings = req.body.mappings;
    if (Array.isArray(mappings)) {
        const workbook = new ExcelJS.Workbook();
        for (var i=0;i<mappings.length;i++) {
            const table = await applier.table_from_mapping(mappings[i]);

            const resStream = new stream.PassThrough();
            await table.read(resStream);

            resStream.pipe(res);
        }
    } else {
        const table = await applier.table_from_mapping(mappings);

        const resStream = new stream.PassThrough();  
        await table.write(resStream);

        resStream.pipe(res);
    }
    
});

//receive a table, commit mapping
tableRoutes.route("/tables/upload").post(async (req, res) => {
    let table = new ExcelTable();
    const mapping = req.body.mapping;
    const stream = req.body.stream;
    await table.read(stream);

    const write_result = await applier.update_from_table(table, mapping);
    res.json(write_result);
  
})

module.exports = tableRoutes;

