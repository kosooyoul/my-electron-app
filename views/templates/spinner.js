window.HanulseSpinner = function () {
    var html = [
        '<div class="hanulse_spinner" style="display: none;">',
        '    <div class="hanulse_spinner-piece-group">',
        '        <div class="hanulse_spinner-piece" style="border-left: 4px solid rgba(255, 0, 0, 1.0); animation-delay: 0.00s;"></div>',
        '        <div class="hanulse_spinner-piece" style="border-top: 4px solid rgba(255, 255, 0, 0.5); animation-delay: 0.05s;"></div>',
        '        <div class="hanulse_spinner-piece" style="border-right: 4px solid rgba(0, 255, 255, 0.5); animation-delay: 0.10s;"></div>',
        '        <div class="hanulse_spinner-piece" style="border-bottom: 4px solid rgba(255, 255, 255, 0.1); animation-delay: 0.15s;"></div>',
        '        <div class="hanulse_spinner-piece" style="border-left: 4px solid rgba(255, 0, 0, 0.5); animation-delay: 0.20s;"></div>',
        '        <div class="hanulse_spinner-piece" style="border-top: 4px solid rgba(255, 255, 255, 0.1); animation-delay: 0.25s;"></div>',
        '    </div>',
        '</div>'
    ].join("\n");

    var $element = $(html);

    this.get = function() {
        return $element;
    };

    this.show = function() {
        $element.fadeIn(200);
    };

    this.hide = function() {
        $element.fadeOut(400);
    };
};