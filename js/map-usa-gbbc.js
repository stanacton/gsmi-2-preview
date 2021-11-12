import {GBBCMapBase} from "./GBBCMapBase.js";
import {DataMapper} from "./DataMapper.js";
import {StatesList} from "./States.js";
import {pressReleaseList} from "./common.js";

$(document)
    .ready(() => {
        pressReleaseList();
        const dataMapper = new DataMapper();
        const map = new GBBCMapBase({
            countryClickHandler: dataMapper.renderPanel,
            scope: 'usa'
        })
        map.init();
        $.getJSON("https://stanacton.github.io/gbbc-report-demo/data/report.min.json",  (_data) => {
            let report = _data.find(x => x.iso === "USA").states;
            const data = {};
            report.forEach((x) => {
                x.iso = x.id;
                data[x.iso] = {
                    fillKey: "hasValue",
                    country: x
                }
            });
            map.setReportData(report);
            map.setMapData(data);

            const regions = new StatesList({
                hoverCountry: map.hilite,
                clickCountry: function(iso) {
                    map.hilite(iso);
                    dataMapper.renderPanel(data[iso].country)
                }
            });
            regions.setData(report);
        });
    });
