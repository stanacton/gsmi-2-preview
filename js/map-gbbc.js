import {GBBCMapBase} from "./GBBCMapBase.js";
import {DataMapper} from "./DataMapper.js";
import {Regions} from "./Regions.js";
import {pressReleaseList} from "./common.js";

$(document)
    .ready(() => {
        pressReleaseList();

        const dataMapper = new DataMapper();
        const map = new GBBCMapBase({
            countryClickHandler: dataMapper.renderPanel
        })
        map.init();
        //$.getJSON("data/report.min.json",  (_data) => {
        $.getJSON("https://stanacton.github.io/gbbc-report-demo/data/report.min.json",  (_data) => {

            const report = _data;
            const data = {};
            report.forEach((x) => {
                data[x.iso] = {
                    fillKey: "hasValue",
                    region: x.region,
                    country: x
                }
            });
            map.setReportData(_data);
            map.setMapData(data);
            const regions = new Regions({
                hoverCountry: map.hilite,
                clickCountry: function(iso) {
                    map.hilite(iso);
                    dataMapper.renderPanel(data[iso].country)
                }
            });
            regions.setData(report);
        });
    });
