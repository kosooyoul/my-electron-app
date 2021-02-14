window.HanulseCollectionBox = function (collection) {
    var html = [
        '<div class="hanulse_collection-box diagram" data-entity="accounts" data-movable="accounts" style="width: 250px; height: 186px; position: absolute; left: 200px; top: 200px;">',
        '    <div data-entity="accounts" class="title" style="width: 250px; height: 36px; left: 0px; top: 0px;">',
        '        <div class="icon-collection"></div>',
        '        <span>accounts</span>',
        '        <span style="float: right; transition: transform 0.4s ease 0s;">▲</span>',
        '    </div>',
        '</div>'
    ].join("\n");

    var $element = $(html);

    // TODO

    this.get = function() {
        return $element;
    };
};

window.HanulseCollectionField = function (field) {
    var html = [
        '<div class="hanulse_collection-field field" data-entity="accounts" data-field="_id" data-movable="accounts._id" style="width: 250px; height: 25px; left: 0px; top: 36px;">',
        '    <div class="icon-none"></div>',
        '    <span>_id</span>',
        '    <span style="float: right;">NN</span>',
        '    <span style="float: right;">objectId</span>',
        '</div>',
    ].join("\n");

    var $element = $(html);

    // TODO

    this.get = function() {
        return $element;
    };
};