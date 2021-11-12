Datamap.prototype.getOptions = function () {
    return this.options;
}

export class GBBCMapBase {
    map;
    throttleTimer;
    zoom;
    data;
    sidenav;
    renderInfo;
    report;
    scope;
    countryClickHandler;

    constructor(opts = {}) {
        this.scope = opts.scope;
        this.countryClickHandler = opts.countryClickHandler;
        this.initDefault()
    }

    initDefault() {
        const self = this;
        d3.select(window).on("resize", this.throttle.bind(self));
        this.zoom = d3.behavior.zoom()
            .duration(4000)
            .scaleExtent([1, 9])
            .on("zoom", this.move.bind(self));
    }

    getHeightWidth() {
        const width = document.getElementById('canvas').offsetWidth;
        const height = width / 2;
        return {
            height,
            width
    };
    }

    init(width, height) {
        const self = this;
        if (!width || !height) {
            const hw = this.getHeightWidth();
            width = hw.width;
            height = hw.height;
        }
        this.map = new Datamap({
            scope: this.scope,
            element: document.getElementById("canvas"),
            projection: "mercator",
            fills: {
                fill: '#fbad18',
                selected: "#fbad18",
                defaultFill: "#37466f",
                hasValue: "#17365f",
            },
            data: {},
            geographyConfig: {
                borderColor: "#035f9e",
                highlightFillColor: "#fbad18",
                popupTemplate: this.popup,
            },
            done: function (datamap) {
                datamap.svg.selectAll(".datamaps-subunit").on('click', self.handleClick.bind(self))
            },
            height: height,
            width: width,
        });
        // enable the zoom function.
        this.map.svg.call(this.zoom);
        this.addZoomButtons();
        //this.addUSAZoom();
    }

    hilite = (iso) => {
        const newData = {
            ...this.data
        };
        if (iso) {
            if (Array.isArray(iso)) {
                iso.forEach(x => {
                    newData[x] = {
                        fillKey: "selected"
                    };
                })
            } else {
                newData[iso] = {
                    fillKey: "selected"
                }
            }
        }

        this.map.updateChoropleth(newData);
    }

    handleClick(geography) {
        const country = this.report.find(x => x.iso === geography.id);
        if (!country) {
            return;
        }
        this.countryClickHandler(country);
    }

    throttle() {
        window.clearTimeout(this.throttleTimer);
        const self = this;
        this.throttleTimer = window.setTimeout(function () {
            self.redraw();
        }, 200);
    }

    redraw() {
        const width = document.getElementById('canvas').offsetWidth;
        const height = width / 2;
        d3.select('svg').remove();
        this.init(width, height);
        this.setMapData();
    }

    move() {
        if (!this.map) return;
        const map = this.map;
        const opts = map.getOptions();
        const g = map.svg.select("g");

        let t = d3.event.translate;
        let s = d3.event.scale;
        let h = opts.height / 4;
        let width = document.getElementById(opts.element.id).offsetWidth;
        let height = opts.height;

        t[0] = Math.min(
            (width / height) * (s - 1),
            Math.max(width * (1 - s), t[0])
        );

        t[1] = Math.min(
            h * (s - 1) + h * s,
            Math.max(height * (1 - s) - h * s, t[1])
        );

        this.zoom.translate(t);
        g.attr("transform", "translate(" + t + ")scale(" + s + ")");

        //adjust the country hover stroke width based on zoom level
        d3.selectAll(".country").style("stroke-width", 1.5 / s);
    }

    setMapData(data) {
        if (data) {
            this.data = data;
        }
        this.map.updateChoropleth({
            ...this.data
        });
    }

    updateInfoUSA(country) {
        this.groupGovernmentBodies(country.governmentBodies)


        const results = _.groupBy(country.governmentBodies, x => x.governmentBodyName);
        let values = [];
        for (const [key, value] of Object.entries(results)) {
            const v = {
                governmentBodyName: key,
                values: value
            }
            values.push(v);
        }

        let bodies = $();
        values = _.sortBy(values, 'governmentBodyName')
        values.forEach(x => {
            bodies = bodies.add(this.nested(x));
        });

        $('#government-bodies').remove();

        const list = $('<ul class="collapsible"></ul>')
        const panel = $('<div id="government-bodies"></div>');

        list.html(bodies);
        panel.html(list);

        $('.info-panel').append(panel);
        $('.collapsible').collapsible();
    }

    nested(gb) {
        let sortByKey = 'typeOfAction';
        let governmentBodyName = gb.governmentBodyName;
        let isUSC = false;
        if (gb.governmentBodyName === "United States Congress") {
            sortByKey = "keyIssue";
            governmentBodyName = governmentBodyName + " - Bills";
            isUSC = true;
        }

        const ul = $("<ul class='collapsible'></ul>");
        const li = $('<li></li>');
        const body = $('<div class="collapsible-body"></div>')

        let bodies = $();
        const values = _.sortBy(gb.values, sortByKey)
        values.forEach(x => {
            const title = isUSC ? x.keyIssue : x.typeOfAction;
            bodies = bodies.add(this.renderInfo(x, title))
        });

        ul.html(bodies);
        li.append(`<div class="report-title collapsible-header"><i class="material-icons">arrow_right</i>  ${governmentBodyName}</div>`)
        body.html(ul);
        li.append(body);
        return li;
    }

    popup = (geo, data = {}) => {
        if (!data) {
            return ['<div class="hoverinfo"><strong>',
                geo.properties.name,
                ': No Report Data',
                '</strong></div>'].join('');
        }

        const country = data.country || {};
        country.dltSupportive = country.dltSupportive || "Unknown";
        country.governmentBodies = country.governmentBodies || [];

        return ['<div class="hoverinfo" style="position: absolute; left: 10px;">',
            '<span class="hover-item" id="name">', geo.properties.name, '</span>',
            '<span class="hover-item" id="dlt-supportive-hi">Click to view details</span>',
            '</div>'].join('');

    }

    groupGovernmentBodies(bodies = []) {
        const results = _.groupBy(bodies, 'governmentBodyName');
        let values = [];
        for (const [key, value] of Object.entries(results)) {
            const v = {
                governmentBodyName: key,
                values: value
            }
            values.push(v);
        }

        values = _.sortBy(values, 'governmentBodyName')
        return values;
    }

    setReportData(report) {
        this.report = report;
    }
    zoomScale = 1;
    addZoomButtons() {
        const self = this;
        const zoomIn = $('<a id="zoom-in" class="btn-floating btn-small waves-effect waves-light red"><i class="material-icons">add</i></a>')
        const zoomOut = $('<a id="zoom-out" class="btn-floating btn-small waves-effect waves-light red"><i class="material-icons">remove</i></a>')

        $('#canvas').append(zoomIn);
        $('#canvas').append(zoomOut);

        const scaleIncrement = 0.4;
        const scaleDuration = 500;
        zoomIn.on('click', function() {
            const svg = self.map.svg;
            const zoom = self.zoom;
            self.zoomScale += scaleIncrement;
            svg.transition().duration(scaleDuration)
                .call(zoom.scale(self.zoomScale).event);
        }.bind(this))
        zoomOut.on('click', function() {
            const svg = self.map.svg;
            const zoom = self.zoom;
            if (self.zoomScale >= 1 + scaleIncrement) {
                self.zoomScale -= scaleIncrement;
            }
            svg.transition().duration(scaleDuration)
                .call(zoom.scale(self.zoomScale).event);

        }.bind(this))

    }

    renderNested(data = [], parent) {
        parent = parent || $('<ul class="collapsible"></ul>');
        const lis = [];
        data.forEach(x => {
            if (!data.children || data.children.length === 1) {
                const infoPanel = this.renderInfo(data);
                lis.push(infoPanel);
            }
        })

        parent.append(lis);
        return parent;
    }
}
