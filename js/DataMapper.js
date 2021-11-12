export class DataMapper {
    sidenav;
    modal;
    constructor(opts = {}) {
        this.init();
    }
    init = () => {
        const sidebar = document.querySelectorAll(".sidenav")
        const instances = M.Sidenav.init(sidebar, {
            edge: 'right'
        });
        if (!instances || instances.length === 0) {
            console.log("There is an error with the report display");
            return;
        }

        const modalEle = document.getElementById("modal1");
        const modals = M.Modal.init(modalEle, {
            startingTop: '50%',
            endingTop: '5%'
        });

        this.sidenav = instances[0];
        this.modal = modals;
    }

    renderPanel = (entity) => {
        $("#country").text(entity.name);
        $("#region").text(entity.region);

        const data = entity.governmentBodies;
        const result = this.mapData(data);
        const ul = this.printUl(result);
        $('#government-bodies').remove();

        const panel = $('<div id="government-bodies"></div>');

        panel.html(ul);
        $('.info-panel').append(panel);


        const elements = document.querySelectorAll(".collapsible");
        const instances = M.Collapsible.init(elements, {
            onOpenEnd: this.toggleExpand,
            onCloseEnd: this.toggleExpand,
        });
        /*
                this.sidenav.open();
        */
        this.modal.open();
    }

    toggleExpand(li) {
        if ($(li).hasClass("active")) {
            $(li).find(".arrow-right").first().hide();
            $(li).find(".arrow-down").first().show();
        } else {
            $(li).find(".arrow-right").first().show();
            $(li).find(".arrow-down").first().hide();
        }
    }

    groupKeys = ['governmentBodyName','typeOfAction','keyIssue', 'date'];
    mapData = (data, level = 0) => {
        const groupKeys = this.groupKeys;
        const mapData = this.mapData;
        if (level >= groupKeys.length) return data;

        let groupByKey = groupKeys[level];
        level++;

        let results = _.groupBy(data, groupByKey);
        let values = [];

        for (const [key, value] of Object.entries(results)) {
            const v = {
                title: key,
                values: value
            }

            if (groupByKey === 'date' && value.length > 0) {
                console.log(groupByKey)
                v.isoDate = value[0].isoDate;
            }

            if (v.values.length > 1) {
                v.values = mapData(v.values, level);
            }

            values.push(v);
        }

        let sortKey = "title";
        if (groupByKey === "date") {
            sortKey = "isoDate";
        }

        values = _.sortBy(values, sortKey);
        return values;
    }

    printUl = (data) => {
        if (data && data.length > 0 && data[0].governmentBodyName) {
            return this.renderInfoPanel(data[0]);
        }
        const ul = $('<ul class="collapsible"></ul>');
        let joint = undefined;
        data.forEach(x => {
            if (x.title === "Joint") {
                joint = x;
                return;
            }
            this.renderLI(ul, x);
        });

        // put joint at the end
        if (joint) {
            this.renderLI(ul, joint);
        }
        return ul;
    }

    renderLI = (ul, x) => {
        if (!x.values) return;
        const li = $('<li></li>');
        const header = $(`<div class="collapsible-header report-title"><i class="material-icons arrow-right">arrow_right</i><i class="material-icons arrow-down">arrow_drop_down</i>${x.title}</div>`);
        const body = $(`<div class="collapsible-body"></div>`);
        const content = this.printUl(x.values);
        body.append(content);

        li.append(header);
        li.append(body);
        ul.append(li);
    }

    renderInfoPanel = (gb) => {
        let sources = [];
        if (gb.source) {
            sources = gb.source.split(';');
        }


        const reportDetails = $(`
                <div class="report-details">
                    <div class="section">
                        <span class="key">GOVERNMENT BODY</span>
                        <div class="value">${gb.governmentBodyName}</div>
                    </div>
                    <div class="section">
                        <span class="key">KEY ISSUE</span>
                        <div class="value">${gb.keyIssue}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="section">
                        <span class="key">TYPE OF ACTION (GUIDANCE, LAW, REGULATION, COURT CASE, ETC.)</span>
                        <div class="value">${gb.typeOfAction}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="section">
                        <span class="key">DRAFTED / PROPOSED / IN FORCE?</span>
                        <div class="value">${gb.status}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="section">
                        <span class="key">NEXT STEP</span>
                        <div class="value">${gb.nextStep}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="section">
                        <span class="key">SUMMARIES</span>
                        <div class="summary value">
                            ${gb.summaries2}
                        </div>
                    </div>
                    <div class="divider"></div>
                    <div class="section">
                        <span class="key">DATE</span>
                        <div class="value">${gb.date}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="section">
                        <span class="key">SOURCE</span>
                        <div class="value sources">
                         </div>
                    </div>

                </div>`);

            const sourcesDiv = $(reportDetails).find('.sources');

            sources.forEach(x => {
                const ele = $(`<div class="source-item">
                ${x}
                <a href="${x}" target="_blank"><i class="material-icons">launch</i></a></div>`);
                sourcesDiv.append(ele);
            })

            return reportDetails;
    }
}

