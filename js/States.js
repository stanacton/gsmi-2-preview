export class StatesList {
    opts;
    groupedData;
    isMobile;
    constructor(opts = {}) {
        this.opts = {
            colCount: 3,
            hoverCountry: () => {},
            clickCountry: () => {},
        };

        this.opts = {
            ...this.opts,
            ...opts
        }

        this.isMobile = window.matchMedia("(max-width: 600px)").matches;

        $(window).resize(() => {
            this.reRender();
        });
    }

    reRender = () => {
        const isMobile = window.matchMedia("(max-width: 600px)").matches;
        if (this.isMobile !== isMobile) {
            this.isMobile = isMobile;
            $('.states-row').remove();
            this.render(this.groupedData);
        }
    }

    setData(data) {
        const grouped = _.chain(data)
            .sortBy("name")
            .value();
        this.groupedData = grouped;
        this.render(grouped);
    }

    render(data) {
        if (!data) return;
        const noCols =  this.isMobile ? 2 : 4;
        const statePanel = $("#state-panel");
        const itemCount = Math.floor(data.length / noCols) + 1;
        const row = $('<div class="row states-row"></div>');
        statePanel.append(row);
        let col = $('<div class="col m3 s6"></div>')
        row.append(col);

        data.forEach((x, index) => {
            if (index !== 0 && index % itemCount === 0) {
                col = $(`<div class="col m3 s6"></div>`);
                row.append(col);
            }
            col.append(this.renderState(x));
        });
        const self = this;
        $('.state-title').on('click', function(event) {
            self.opts.clickCountry($(this).data("iso"))
        });
        $('.state-title').hover(
            function(event) {
                self.opts.hoverCountry($(this).data("iso"))
            }, function() {
                self.opts.hoverCountry(undefined);
            })
    }

    renderState(state) {
        const stateEle = $('<div class="state-wrapper"></div>');
        stateEle.append(`<div class="state-title" data-iso="${state.iso}">${state.name}</div>`);
        return stateEle;
    }
}
