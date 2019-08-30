function loadContentForElement(elm) {
    var loc = $(elm).attr('image-src');
    $.getJSON(loc + '/description.json', function(desc) {
        if (desc.name != undefined) { 
            var titleElement = '<div class="description noselect">' + desc.name + '</div>';
            $(elm).append(titleElement);
        }
        $(elm).find('.description').click(function() {
            window.open('image-viewer.html?' + loc, '_self');
        });

        function loadImage(idx) {
            if (idx < 1) {
                return;
            }

            var path = loc + '/' + idx + '.jpg';
            $downloadImage = $('<img/>');
            $downloadImage.on('load', function() {
                $(elm).css('background-image', 'url(' + $(this).attr('src') + ')');
                if ($(elm).hasClass('image-fit')) {
                    $(elm).css('background-size', 'contain');
                } else {
                    $(elm).css('background-size', 'cover');
                }
                $(elm).css('background-repeat', 'no-repeat');
                if ($(elm).hasClass('fill-image')) {
                    $(elm).css('padding-bottom', (100.0 * this.height / this.width) + '%');
                }

                var position = $(elm).attr('image-pos');
                if (position == undefined || position.length < 1) {
                    position = 'center';
                }

                $(elm).css('background-position', position);


                if (this.width < $(elm).width() || this.height < $(elm).height()) {
                    loadImage(idx - 1);
                }
            });

            $downloadImage.attr('src', path);
        }

        loadImage(desc.levels);
    });
}

function loadSectionContentForElement(elm, elmIdx) {
    var $elm = $(elm);
    var loc = $elm.attr('content-src');
    $.getJSON(loc, function(desc) {
        var navId = loc;
        navId = navId.substr(navId.indexOf('/') + 1);
        navId = navId.substr(0, navId.lastIndexOf('.'));
        
        var navTitle = desc.title;
        if (navTitle == undefined) {
            navTitle = navId.charAt(0).toLocaleUpperCase() + navId.slice(1).toLocaleLowerCase();
        }
        
        var addedAnchor = false;
        if (desc.title != undefined) {
            var titleElement = $('<div class="content-title" id="' + navId + '">' + desc.title + '</div>');
            addedAnchor = true;
            
            var startColor = desc['color-start'];
            if (startColor != undefined) {
                titleElement.css('color', desc.color);

                var endColor = desc['color-end'];
                if (endColor == undefined) {
                    endColor = startColor;
                }

                titleElement.addClass('content-title-background');
                titleElement.css({
                    'background' : 'linear-gradient(70deg, ' + startColor + ',' + endColor + ')',
                    '-webkit-background-clip' : 'text',
                    '-webkit-text-fill-color' : 'transparent',
                    'background-clip' : "text",
                    'color' : 'transparent'
                });
            }

            var container = $('<div class="content-title-container"></div>');
            container.append(titleElement);
            $elm.append(container);
        }
        
        $('.nav-list').append('<div class="nav-list-item" index="'  + elmIdx + '" onclick="scrollToSection(\'' + navId + '\')">' + navTitle + '</div>');
        var sortedNavItems = $('.nav-list').children('.nav-list-item').sort(function(a, b) {
            var vA = a.getAttribute('index');
            var vB = b.getAttribute('index');
            return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
        });
        $('.nav-list').append(sortedNavItems);
        
        var content;
        if (addedAnchor) {
            content = $('<div class="content-container"></div>');
        } else {
            content = $('<div class="content-container" id="' + navId + '"></div>');
        }

        var items = desc.items;
        var arrayLength = items.length;
        for (var i = 0; i < arrayLength; i++) {
            var item = items[i];

            var elementContent;
            if (item.photo != undefined) {
                elementContent = '<div class="image-loader fill-image" image-src="' + item.photo + '"image-pos="top" ></div>';
            } else if (item.text != undefined) {
                elementContent = '<p>' + item.text + '</p>';
            }

            if (elementContent != undefined) {
                var itemElement = $('<div class="content-item"></div>');
                itemElement.append(elementContent);

                var startColor = item['color-start'];
                if (startColor != undefined) {
                    itemElement.css('color', 'white');

                    var endColor = item['color-end'];
                    if (endColor == undefined) {
                        endColor = startColor;
                    }

                    itemElement.css({
                        'background' : 'linear-gradient(70deg, ' + startColor + ',' + endColor + ')',
                    });
                }

                if (item.link != undefined) {
                    itemElement.addClass('content-item-link');
                    itemElement.addClass('content-item-bounce');


                    itemElement.click(function(item) {
                        return function() {
                            window.open(item.link, '_self');
                        }
                    } (item));
                } else if (item.photo != undefined) {
                    itemElement.addClass('content-item-bounce');
                }

                content.append(itemElement);
            }
        }

        $elm.append(content);
        $elm.find('.image-loader').each(function() {
            loadContentForElement(this);
        });
    });
}

function toggleNavList() {
    if ($('.nav-list').hasClass('visible')) {
        $('.nav-list').removeClass('visible');
    } else {
        $('.nav-list').addClass('visible');
    }
}

function scrollToSection(sec) {
    // Close the nav menu if it's open
    if ($('.nav-list').hasClass('visible')) {
        $('.nav-list').removeClass('visible');
    }
    
    var scroll = new SmoothScroll();
    var anchor = document.querySelector('#' + sec);
    scroll.animateScroll(anchor);
}

function scrollIndicatorClick() {
    $('.nav-list').children().first().trigger('click');
}

$(document).ready(function() {
    $('.image-loader').each(function() {
        loadContentForElement(this);
    });

    $('.content-loader').each(function(index) {
        loadSectionContentForElement(this, index);
    });

    setTimeout(function() {
        $('.title-container .subtitle').addClass('filled');
    }, 1500);

    setTimeout(function() {
        $('.nav-container').addClass('visible');
    }, 2500);
    
    $('.nav-button').on('click', toggleNavList);
});
