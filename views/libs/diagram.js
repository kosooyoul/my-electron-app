window.ERDiagram = new (function() {
    /*
        Dragging (Relative; Zoom, Diagram)
        Follwer
        Inspector
        Diagram (Relative; Joins, Dragging)
        Joins (Relative; Diagram)
        Zoom (Relative; Dragging)
    */
    var entityCount = 0;
    var diagramZIndex = 0;

    var ONE = "ONE";
    var ZERO_OR_ONE = "ZERO_OR_ONE";
    var ZERO_OR_MANY = "ZERO_OR_MANY";


    function parsePixelNumber(px) {
        return Number(px.slice(0, -2)) || 0;
    }

    /*
        Dragging
    */
    function setDragging(name, $holder, $target, step, includeChild, ignoreZoom, boundSize) {
        var boundWidth = boundSize && boundSize.w || 0;
        var boundHeight = boundSize && boundSize.h || 0;

        var downed = false;
        var downedX = 0;
        var downedY = 0;

        var startX, targetX = parsePixelNumber($target.css("left"));
        var startY, targetY = parsePixelNumber($target.css("top"));

        var lastMovedX = 0;
        var lastMovedY = 0;
        var lastDeltaX = 0;
        var lastDeltaY = 0;
        var lastMovedTime = 0;

        var slidingInterval = null;

        notifyMoved(name, targetX, targetY);

        function notifyMoved(name, x, y) {
            notifyDragging(name, x, y, x + $target.width(), y + $target.height());

            if (!includeChild) return;

            var movableChildren = $target.find("[data-movable]");
            movableChildren.each(function(i) {
                var $child = movableChildren.eq(i);
                var name = $child.attr("data-movable");
                var childX = parsePixelNumber($child.css("left"));
                var childY = parsePixelNumber($child.css("top"));
                notifyDragging(name, x + childX, y + childY, x + childX + $child.width(), y + childY + $child.height());
            })
        }

        $(document).on("mousedown", function(evt) {
            var $evented = $(evt.target);

            if (evt.which != 1) {
                return;
            }

            if ($evented.is($holder) == false && $evented.parents().is($holder) == false) {
                return;
            }

            slidingInterval = clearInterval(slidingInterval);

            var zoomRatio = ignoreZoom? 1: (1 / zoom);

            downed = true;
            downedX = evt.pageX * zoomRatio;
            downedY = evt.pageY * zoomRatio;

            startX = targetX = parsePixelNumber($target.css("left"));
            startY = targetY = parsePixelNumber($target.css("top"));

            lastDeltaX = 0;
            lastDeltaY = 0;
            lastMovedX = 0;
            lastMovedY = 0;
            lastMovedTime = Date.now();
        });

        $(document).on("mousemove", function(evt) {
            if (downed == false) return;

            var zoomRatio = ignoreZoom? 1: (1 / zoom);
            var newMovedX = evt.pageX * zoomRatio - downedX;
            var newMovedY = evt.pageY * zoomRatio - downedY;
            lastDeltaX = newMovedX - lastMovedX;
            lastDeltaY = newMovedY - lastMovedY;
            lastMovedX = newMovedX;
            lastMovedY = newMovedY;
            lastMovedTime = Date.now();

            targetX = Math.round((startX + newMovedX) / step) * step;
            targetY = Math.round((startY + newMovedY) / step) * step;

            var targetWidth = $target.width();
            var targetHeight = $target.height();

            if (targetX < 0) targetX = 0;
            else if (targetX > boundWidth - targetWidth) targetX = boundWidth - targetWidth;
            if (targetY < 0) targetY = 0;
            else if (targetY > boundHeight - targetHeight) targetY = boundHeight - targetHeight;

            $target.css({"left": targetX, "top": targetY});
            notifyMoved(name, targetX, targetY);
        });

        $(document).on("mouseup", function(evt) {
            if (downed == false) return;

            downed = false;

            var elapsedTime = Date.now() - lastMovedTime;
            var vitality = 2 / Math.max(elapsedTime, 1)

            var targetWidth = $target.width();
            var targetHeight = $target.height();

            if (targetX < 0) targetX = 0;
            else if (targetX > boundWidth - targetWidth) targetX = boundWidth - targetWidth;
            if (targetY < 0) targetY = 0;
            else if (targetY > boundHeight - targetHeight) targetY = boundHeight - targetHeight;

            sliding(vitality);
        });

        function sliding(vitality) {
            if (slidingInterval) return;

            slidingInterval = setInterval(function() {
                targetX = Math.round((targetX + lastDeltaX * vitality) / step) * step;
                targetY = Math.round((targetY + lastDeltaY * vitality) / step) * step;

                var targetWidth = $target.width();
                var targetHeight = $target.height();

                if (targetX < 0 && lastDeltaX < 0) {
                    targetX = 0;
                    lastDeltaX = -lastDeltaX * 0.5;
                } else if (targetX > boundWidth - targetWidth && lastDeltaX > 0) {
                    targetX = boundWidth - targetWidth;
                    lastDeltaX = -lastDeltaX * 0.5;
                }

                if (targetY < 0 && lastDeltaY < 0) {
                    targetY = 0;
                    lastDeltaY = -lastDeltaY * 0.5;
                } else if (targetY > boundHeight - targetHeight && lastDeltaY > 0) {
                    targetY = boundHeight - targetHeight;
                    lastDeltaY = -lastDeltaY * 0.5;
                }

                $target.css({"left": targetX, "top": targetY});
                notifyMoved(name, targetX, targetY);

                vitality *= 0.9
                if (vitality < 0.0001) {
                    slidingInterval = clearInterval(slidingInterval);
                    return;
                }
            }, 1000 / 60);
        }
    }
    
    /*
        Inspector
    */
   /*
    function updateInspectorEntity(name, fields) {
        $(".entity .entity-name span").text(name);
        $(".entity .list").children().remove();

        for (var i = 0; i < fields.length; i++) {
            var p = $("<p>").text(fields[i].key);
            var s = $("<span>").text(fields[i].types.join(" | ")).css({"float": "right", "margin": "0px 12px"})
            var n = $("<span>").text(!fields[i].nullable? "NN": "").css({"float": "right", "margin": "0px 12px"})
            $(".entity .list").append(p);
            p.append(n);
            p.append(s);
        }
    }
    */

    var objectIds = {};
    var objectRefIds = {};

    /*
        Diagram
    */
    this.createDiagram = function(name, fields) {
        var $diaground = $(".diaground");

        var diagramTitleHeight = 36;
        var diagramFieldHeight = 25;
        var diagramWidth = 250;
        var diagramHeight = diagramTitleHeight + diagramFieldHeight * fields.length;

        var $diagram = $("<div>");
        $diagram.attr("data-entity", name);
        $diagram.attr("data-movable", name);

        $diagram.addClass("diagram");
        $diagram.css({"width": diagramWidth, "height": diagramHeight});
        $diagram.css({"position": "absolute", "left": (entityCount % 5) * 400 + parseInt(entityCount / 5) * 25 + 200, "top": parseInt(entityCount / 5) * 250 + 200});
        entityCount++;
        $diagram.on("mousedown", function() {
            $(".diagram.focused").removeClass("focused");
            $diagram.addClass("focused");
            $diagram.css("z-index", ++diagramZIndex);

            // Inspector
            // updateInspectorEntity(name, fields);
        })
        $diaground.append($diagram);

        var $title = $("<div>");
        $title.attr("data-entity", name);

        $title.addClass("title");
        $title.css({"width": diagramWidth, "height": diagramTitleHeight, "left": "0px", "top": "0px"});

        $title.append($("<div>").addClass("icon-collection"));
        $title.append($("<span>").text(name));

        var $collapser = $("<span>").css({"float": "right", "transition": "transform 0.4s"}).text("▲");
        var collapsingFunction = function() {
            $diagram.toggleClass("collapsed");
            if ($diagram.is(".collapsed")) {
                $collapser.css({"transform": "rotate(180deg)"});
                $diagram.css({"height": diagramTitleHeight});
            } else {
                $collapser.css({"transform": "rotate(0deg)"});
                $diagram.css({"height": diagramHeight});
            }
        };
        $collapser.on("click", collapsingFunction);
        $title.on("dblclick", collapsingFunction);
        $title.append($collapser);
        $diagram.append($title);

        fields.forEach(function(field, index) {
            var $field = $("<div>");
            $field.attr("data-entity", name);
            $field.attr("data-field", field.key);
            $field.attr("data-movable", name + "." + field.key);

            $field.addClass("field");
            $field.css({"width": diagramWidth, "height": diagramFieldHeight,  "left": "0px", "top": diagramTitleHeight + diagramFieldHeight * index});
            if (field.unique) {
                $field.append($("<div>").addClass("icon-uniquekey"));
            } else if (field.index) {
                $field.append($("<div>").addClass("icon-indexkey"));
            } else {
                $field.append($("<div>").addClass("icon-none"));
            }
            $field.append($("<span>").text(field.key));
            if (!field.nullable) {
                $field.append($("<span>").css({"float": "right"}).text("NN"));
            }
            $field.append($("<span>").css({"float": "right"}).text(field.types.join(" | ")));
            $field.on("dblclick", function() {
                $(".fielddialog .name").text(name);
                $(".fielddialog .key").text(field.key);
                $(".fielddialog .types").text(field.types);
                $(".fielddialog .index").text(!!field.index);
                $(".fielddialog .unique").text(!!field.unique);
                $(".fielddialog .nullable").text(!!field.nullable);
                $(".fielddialog").show();
            })

            $diagram.append($field);

            if (field.samples) {
                if (field.key == "_id") {
                    field.samples.forEach(function(id) {
                        objectIds[id] = name + "." + field.key;
                    })
                }
                if(field.types.includes("objectId")) {
                    field.samples.forEach(function(id) {
                        objectRefIds[id] = objectRefIds[id] || [];
                        objectRefIds[id].push(name + "." + field.key);
                    })
                }
            }
        })

        setDragging(name, $title, $diagram, 1, true, false, {w: 5000, h: 3000});
    }

    /*
        Dragging
    */
    var movingPositions = {};
    var movingListener = {};

    function notifyDragging(name, l, t, r, b) {
        movingPositions[name] = movingPositions[name] || {l: 0, t: 0, r: 0, b: 0};
        movingPositions[name].l = l;
        movingPositions[name].t = t;
        movingPositions[name].r = r;
        movingPositions[name].b = b;

        (movingListener[name] || []).forEach(function(callback) {
            callback(name, l, t, r, b);
        });
    }

    function listenDragging(name, callback) {
        movingListener[name] = movingListener[name] || [];
        movingListener[name].push(callback);

        if (movingPositions[name]) {
            callback(name, movingPositions[name].l, movingPositions[name].t, movingPositions[name].r, movingPositions[name].b);
        }
    }

    function unlistenDragging(name, callback) {
        movingListener[name] = (movingListener[name] || []).filter(function(func) {
            return func != callback;
        });
    }

    /*
        Joins
    */
    function createJoin(fromName, toName, fromCount, toCount) {
        // var SVG_LINE = [
        // 	'<svg width="1" height="1" viewbox="0 0 2 2" style="position: absolute; overflow: visible;">',
        // 	'	<path class="line" stroke="black" fill="transparent" stroke-width="8" d="m 0 0" stroke-linejoin="round"/>',
        // 	'	<path class="line" stroke="white" fill="transparent" stroke-width="4" d="m 0 0" stroke-linejoin="round"/>',
        // 	'	<circle class="line-from-dot" fill="white" stroke="black" stroke-width="2" r="8" cx="0" cy="0" style="pointer-events: all;"/>',
        // 	'	<circle class="line-to-dot" fill="white" stroke="black" stroke-width="2" r="8" cx="0" cy="0" style="pointer-events: all;"/>',
        // 	'	<text class="line-from-text" fill="white" x="0" y="0" text-anchor="middle" font-size="32" font-weight="bold" stroke="black" stroke-width="2">N</text>',
        // 	'	<text class="line-to-text" fill="white" x="0" y="0" text-anchor="middle" font-size="32" font-weight="bold" stroke="black" stroke-width="2">N</text>',
        // 	'</svg>'
        // ].join('\n');
        var SVG_LINE = [
            '<svg width="1" height="1" viewbox="0 0 2 2" style="position: absolute; overflow: visible;">',
            '	<path class="line hoverable" stroke="rgba(200, 200, 200, 0.4)" fill="transparent" stroke-width="10" d="m 0 0" stroke-linejoin="round"/>',
            '	<path class="line" stroke="black" fill="transparent" stroke-width="2" d="m 0 0" stroke-linejoin="round"/>',
            '	<circle class="line-from-dot" fill="white" stroke="black" stroke-width="2" r="8" cx="0" cy="0" style="pointer-events: all;"/>',
            '	<circle class="line-to-dot" fill="white" stroke="black" stroke-width="2" r="8" cx="0" cy="0" style="pointer-events: all;"/>',
            '	<text class="line-from-text" fill="black" x="0" y="0" text-anchor="middle" font-size="24">N</text>',
            '	<text class="line-to-text" fill="black" x="0" y="0" text-anchor="middle" font-size="24">N</text>',
            '</svg>'
        ].join('\n');

        var $overground = $(".overground");

        var $svg = $(SVG_LINE);
        var $line = $svg.find(".line");
        var $lineFromDot = $svg.find(".line-from-dot");
        var $lineToDot = $svg.find(".line-to-dot");
        var $lineFromText = $svg.find(".line-from-text");
        var $lineToText = $svg.find(".line-to-text");
        $overground.append($svg);

        $line.on("dblclick", function() {
            $(".joindialog").show();
            $(".joindialog .join").text(fromName + "(" + fromCount + ")" + " -> " + toName + "(" + toCount + ")");
        })

        if (fromCount == ONE) {
            $lineFromText.text("1");
        } else if (fromCount == ZERO_OR_ONE) {
            $lineFromText.text("0 | 1");
        } else if (fromCount == ZERO_OR_MANY) {
            $lineFromText.text("0...M");
        }

        if (toCount == ONE) {
            $lineToText.text("1");
        } else if (toCount == ZERO_OR_ONE) {
            $lineToText.text("0 | 1");
        } else if (toCount == ZERO_OR_MANY) {
            $lineToText.text("0...M");
        }

        var al = 0, bl = 0;
        var at = 0, bt = 0;
        var ar = 0, br = 0;
        var ab = 0, bb = 0;

        listenDragging(fromName, function(name, l, t, r, b) {
            al = l * 2;
            at = t * 2;
            ar = r * 2;
            ab = b * 2;

            updatePath();
        });

        listenDragging(toName, function(name, l, t, r, b) {
            bl = l * 2;
            bt = t * 2;
            br = r * 2;
            bb = b * 2;

            updatePath();
        });

        function updatePath() {
            // A가 B의 왼쪽에
            if (ar + 72 * 2 <= bl) {
                // A가 B의 위쪽에
                // if (ab < bt) {
                    // Case 1-1
                    // $line.attr("d", [
                    // 	"m", ar, (ab + at) / 2,
                    // 	"l", bl - ar + (br - bl) / 2, 0,
                    // 	"l", 0, bt - ab + (ab - at) / 2
                    // ].join(" "));

                    // Case 1-1(R)
                    // $line.attr("d", [
                    // 	"m", (al + ar) / 2, ab,
                    // 	"l", 0, bt - ab + (bb - bt) / 2,
                    // 	"l", bl - ar + (ar - al) / 2, 0
                    // ].join(" "));
                    // return;
                // }

                // A가 B의 아래쪽에
                // if (at > bb) {
                    // Case 1-2
                    // $line.attr("d", [
                    // 	"m", ar, (ab + at) / 2,
                    // 	"l", bl - ar + (br - bl) / 2, 0,
                    // 	"l", 0, bb - at - (ab - at) / 2
                    // ].join(" "));

                    // Case 1-2(R)
                    // $line.attr("d", [
                    // 	"m", (ar + al) / 2, at,
                    // 	"l", 0, bb - at - (bb - bt) / 2,
                    // 	"l", bl - ar + (ar - al) / 2, 0
                    // ].join(" "));
                    // return;
                // }

                // Case 1(S)
                $line.attr("d", [
                    "m", ar, (ab + at) / 2,
                    "l", (bl - ar) / 2, 0,
                    "l", 0, (bt + bb - at - ab) / 2,
                    "l", (bl - ar) / 2, 0
                ].join(" "));
                $lineFromDot.attr({"cx": ar, "cy": (ab + at) / 2});
                $lineToDot.attr({"cx": bl, "cy": (bb + bt) / 2});
                $lineFromText.attr({"x": ar + 36, "y": (ab + at) / 2 - 12});
                $lineToText.attr({"x": bl - 36, "y": (bb + bt) / 2 - 12});
                return;
            }

            // A가 B의 오른쪽에
            if (al >= br + 72 * 2) {
                // A가 B의 위쪽에
                // if (ab < bt) {
                    // Case 2-1
                    // $line.attr("d", [
                    // 	"m", br, (bb + bt) / 2,
                    // 	"l", al - br + (ar - al) / 2, 0,
                    // 	"l", 0, ab - bt - (bb - bt) / 2
                    // ].join(" "));
                    // return;
                // }

                // A가 B의 아래쪽에
                // if (at > bb) {
                    // Case 2-2
                    // $line.attr("d", [
                    // 	"m", br, (bb + bt) / 2,
                    // 	"l", al - br + (ar - al) / 2, 0,
                    // 	"l", 0, at - bb + (bb - bt) / 2
                    // ].join(" "));
                    // return;
                // }

                // Case 2(S)
                $line.attr("d", [
                    "m", al, (ab + at) / 2,
                    "l", (br - al) / 2, 0,
                    "l", 0, (bt + bb - at - ab) / 2,
                    "l", (br - al) / 2, 0
                ].join(" "));
                $lineFromDot.attr({"cx": al, "cy": (ab + at) / 2});
                $lineToDot.attr({"cx": br, "cy": (bb + bt) / 2});
                $lineFromText.attr({"x": al - 36, "y": (ab + at) / 2 - 12});
                $lineToText.attr({"x": br + 36, "y": (bb + bt) / 2 - 12});
                return;
            }

            // A가 B의 가운데 왼편에
            if (al + ar < bl + br) {
                // Case 3(C)
                $line.attr("d", [
                    "m", al, (ab + at) / 2,
                    "l", -72, 0,
                    "l", 0, (bt + bb - at - ab) / 2,
                    "l", bl - al + 72, 0
                ].join(" "));
                $lineFromDot.attr({"cx": al, "cy": (ab + at) / 2});
                $lineToDot.attr({"cx": bl, "cy": (bb + bt) / 2});
                $lineFromText.attr({"x": al - 36, "y": (ab + at) / 2 - 12});
                $lineToText.attr({"x": bl - 36, "y": (bb + bt) / 2 - 12});
                return;
            }

            // A가 B의 가운데 오른편에
            if (al + ar >= bl + br) {
                // Case 4(C)
                $line.attr("d", [
                    "m", ar, (ab + at) / 2,
                    "l", 72, 0,
                    "l", 0, (bt + bb - at - ab) / 2,
                    "l", br - ar - 72, 0
                ].join(" "));
                $lineFromDot.attr({"cx": ar, "cy": (ab + at) / 2});
                $lineToDot.attr({"cx": br, "cy": (bb + bt) / 2});
                $lineFromText.attr({"x": ar + 36, "y": (ab + at) / 2 - 12});
                $lineToText.attr({"x": br + 36, "y": (bb + bt) / 2 - 12});
                return;
            }

            // $line.attr("d", ["m", ax, ay, "l", (ux - ax) / 2, 0, "l", 0, uy - ay, "l", (ux - ax) / 2, 0].join(" "));

            $line.attr("d", "");
        }
    }

    /*
        Follower
    */
   /*
    function createFollower(name, $element) {
        var $overground = $(".overground");
        $overground.append($element);

        var ax = 0;
        var ay = 0;

        listenDragging(name, function(name, x, y) {
            ax = x;
            ay = y;
            $element.css({
                "left": ax,
                "top": ay
            });
        });

        // setInterval(function() {
        // 	var currentX = parsePixelNumber($element.css("left"));
        // 	var currentY = parsePixelNumber($element.css("top"));
        // 	$element.css({
        // 		"left": currentX + (ax - currentX) * 0.2,
        // 		"top": currentY + (ay - currentY) * 0.2
        // 	});
        // }, 1000 / 60)
    }
    */

    /*
        Joins
    */
    this.initializeJoins = function() {
        var joinsCount = {};
        var joins = {};
        Object.keys(objectRefIds).forEach(function(id) {
            var idName = objectIds[id];
            var names = objectRefIds[id];
            if (idName && names.length >= 2) {
                names.forEach(function(name) {
                    if (name != idName) {
                        if (!joins[idName + "->" + name]) {
                            joins[idName + "->" + name] = {
                                "from": idName,
                                "to": name
                            };
                            joinsCount[idName] = (joinsCount[idName] || 0) + 1;
                        }
                    }
                })
            }
        })
        Object.keys(joins).forEach(function(key) {
            var join = joins[key];
            createJoin(join.from, join.to, ONE, ZERO_OR_MANY);

            // Follower
            // if (joinsCount[join.from] > 2) {
            //     var $star = $("<div>");
            //     $star.css({"position": "absolute", "width": "12px", "height": "12px", "background-image": "url(./res/icons/stared.png)", "background-size": "contain", "border-radius": "5px", "margin-left": "-6px", "margin-top": "-6px"});
            //     createFollower(join.from, $star);
            // }
        });
    }

    /*
        Zoom
    */
    var groundZoomLevel = 10;
    var zoom = 1.0;

    function zoomInGround() {
        if (groundZoomLevel < 20) {
            groundZoomLevel += 1

            zoom = groundZoomLevel * 0.1;
            $('.ground').css({'transform': 'scale(' + zoom + ')'});
            $('.ground-wrap').css({'width': $('.ground').width() * zoom, 'height': $('.ground').height() * zoom});

            $('.zoom').text(zoom.toFixed(1));
        }
    }

    function zoomOutGround() {
        if (groundZoomLevel > 1) {
            groundZoomLevel -= 1

            zoom = groundZoomLevel * 0.1;
            $('.ground').css({'transform': 'scale(' + zoom + ')'});
            $('.ground-wrap').css({'width': $('.ground').width() * zoom, 'height': $('.ground').height() * zoom});

            $('.zoom').text(zoom.toFixed(1));
        }
    }
})();