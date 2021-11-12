
export function _pressReleaseList(ulSelector) {
    $(ulSelector).css('display', 'none');
    $('.expander').on('click', function(event) {
        event.preventDefault();

        const parent = $(this).parent();
        const ul = ($(parent).find("ul"));

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
}

export function pressReleaseList() {
  _pressReleaseList(".gsmi-report-wrapper .header-content ul");
}
