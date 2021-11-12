export class Regions {
    opts;
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
    }

    setData(data) {
        const grouped = _.chain(data)
            .groupBy("region")
            .map((x, y) => {
                return {
                    name: y,
                    countries: x,
                }
            })
            .sortBy("name")
            .value();

        this.render(grouped);
    }

    render(data) {
        if (!data) return;
        const regionPanel = $("#region-panel");
        const itemCount = Math.floor(data.length / 3) + 1;
        const row = $('<div class="row"></div>');
        regionPanel.append(row);
        let col = $('<div class="col s12 m4"></div>')
        row.append(col);

        data.forEach((x, index) => {
            if (index !== 0 && index % itemCount === 0) {
                col = $('<div class="col s12 m4"></div>');
                row.append(col);
            }
            col.append(this.renderRegion(x));
        });

        $('.region-wrapper ul').css('display', 'none');
        $('.region-wrapper .region-title').on('click', function() {
            const parent = $(this).parent();
            const ul = $(this).next();
            ul.slideToggle(500, function() {
                if (ul.is(":visible")) {
                    parent.find('.arrow-down').show();
                    parent.find('.arrow-right').hide();
                } else {
                    parent.find('.arrow-down').hide();
                    parent.find('.arrow-right').show();
                }
            });
        });
        const self = this;
        $('.region-wrapper li').on('click', function() {
            self.opts.clickCountry($(this).data("iso"))
        });
        $('.region-wrapper li').hover( function() {
            self.opts.hoverCountry($(this).data("iso"))
        },function() {
            self.opts.hoverCountry(undefined);
        });
        $('.region-wrapper .region-title').hover( function() {
            self.opts.hoverCountry($(this).data("isos"))
        },function() {
            self.opts.hoverCountry(undefined);
        });
    }

    renderRegion(region) {
        let countries = region.countries || [];

        const isos = countries.map(x => {
            return '"' + x.iso + '"';
        });
        const isoData = "[" + isos.join(',') + "]";
        const regionEle = $('<div class="region-wrapper"></div>');
        regionEle.append('<div class="region-title" data-isos=\'' + isoData + '\' ><i class="material-icons arrow-right">chevron_right</i><i class="material-icons arrow-down">expand_more</i>' + region.name + '</div>');

        const ul = $('<ul class="country-list"></ul>');
        countries = _.sortBy(countries, 'name');
        countries.forEach((x, y) => {
            const li = (`<li data-iso="${x.iso}">${x.name}</li>`);
            ul.append(li);
        });

        regionEle.append(ul);
        return regionEle;
    }
}
