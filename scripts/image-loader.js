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


                var pixelRatio = window.devicePixelRatio;
                if (this.width < ($(elm).width() * pixelRatio) || this.height < ($(elm).height() * pixelRatio)) {
                    loadImage(idx - 1);
                }
            });

            $downloadImage.attr('src', path);
        }

        loadImage(desc.levels);
    });
}

function parsePanel(elm) {
    var background = $('<div class="panel-background"></div>');
    background.append($('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style="position: absolute; left: 0; top: 0%; mix-blend-mode: soft-light;"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="20%" style="stop-color:rgb(180,180,180);stop-opacity:0.8" /><stop offset="80%" style="stop-color:rgb(255,255,255);stop-opacity:0" /></linearGradient></defs><path  fill="url(#grad1)" d="M0,128L26.7,149.3C53.3,171,107,213,160,213.3C213.3,213,267,171,320,154.7C373.3,139,427,149,480,170.7C533.3,192,587,224,640,213.3C693.3,203,747,149,800,112C853.3,75,907,53,960,74.7C1013.3,96,1067,160,1120,197.3C1173.3,235,1227,245,1280,234.7C1333.3,224,1387,192,1413,176L1440,160L1440,320L1413.3,320C1386.7,320,1333,320,1280,320C1226.7,320,1173,320,1120,320C1066.7,320,1013,320,960,320C906.7,320,853,320,800,320C746.7,320,693,320,640,320C586.7,320,533,320,480,320C426.7,320,373,320,320,320C266.7,320,213,320,160,320C106.7,320,53,320,27,320L0,320Z"></path></svg>'));
     background.append($('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style="position: absolute; left: 0; top: 10%; mix-blend-mode: soft-light;"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="20%" style="stop-color:rgb(180,180,180);stop-opacity:0.8" /><stop offset="80%" style="stop-color:rgb(255,255,255);stop-opacity:0" /></linearGradient></defs><path  fill="url(#grad1)"  d="M0,320L26.7,272C53.3,224,107,128,160,90.7C213.3,53,267,75,320,74.7C373.3,75,427,53,480,64C533.3,75,587,117,640,128C693.3,139,747,117,800,144C853.3,171,907,245,960,234.7C1013.3,224,1067,128,1120,96C1173.3,64,1227,96,1280,112C1333.3,128,1387,128,1413,128L1440,128L1440,320L1413.3,320C1386.7,320,1333,320,1280,320C1226.7,320,1173,320,1120,320C1066.7,320,1013,320,960,320C906.7,320,853,320,800,320C746.7,320,693,320,640,320C586.7,320,533,320,480,320C426.7,320,373,320,320,320C266.7,320,213,320,160,320C106.7,320,53,320,27,320L0,320Z"></path></svg>'));
    background.append($('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style="position: absolute; left: 0; top: 25%; mix-blend-mode: overlay;"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="20%" style="stop-color:rgb(255,255,255);stop-opacity:0.8" /><stop offset="80%" style="stop-color:rgb(255,255,255);stop-opacity:0" /></linearGradient></defs><path  fill="url(#grad1)"  d="M0,32L26.7,53.3C53.3,75,107,117,160,149.3C213.3,181,267,203,320,202.7C373.3,203,427,181,480,192C533.3,203,587,245,640,256C693.3,267,747,245,800,234.7C853.3,224,907,224,960,202.7C1013.3,181,1067,139,1120,133.3C1173.3,128,1227,160,1280,154.7C1333.3,149,1387,107,1413,85.3L1440,64L1440,320L1413.3,320C1386.7,320,1333,320,1280,320C1226.7,320,1173,320,1120,320C1066.7,320,1013,320,960,320C906.7,320,853,320,800,320C746.7,320,693,320,640,320C586.7,320,533,320,480,320C426.7,320,373,320,320,320C266.7,320,213,320,160,320C106.7,320,53,320,27,320L0,320Z"></path></svg>'));
    background.append($('<div class="panel-svg-overlay"></div>'));
    
    var result = $('<div class="content-panel"></div>');
    var container = $('<div class="content-planel-container"></div>');
    result.append(container);
    
    var leftColumn = $('<div class="content-planel-column left"></div>');
    var rightColumn = $('<div class="content-planel-column right"></div>');
    container.append(leftColumn);
    container.append(rightColumn);
    
    var rightColumnContainer = $('<div class="content-panel-right-container"></div>');
    rightColumn.append(rightColumnContainer);
    
    if (elm.icon) {
        leftColumn.append($('<image class="content-icon" src="' + elm.icon + '" /><br>'));
    }
    if (elm.title) {
        leftColumn.append($('<p class="content-planel-title">' + elm.title + '</p>'));
    }
    if (elm.description) {
        leftColumn.append($('<p>' + elm.description + '</p>'));
    }
    
    if (elm.icon == undefined) {
        leftColumn.append($('<div class="content-icon-spacer"></div><br>'));
    }
    
    if (elm.link) {
        var link = $('<div class="content-planel-link content-item-link content-item-bounce"><image src="icons/link.small.svg" /></div>');
        link = link.click(function(item) {
                        return function() {
                            window.open(item.link, '_self');
                        };
                    } (elm));
        leftColumn.append(link);
    }
    
    if (elm.content) {
        for (var i = 0; i < elm.content.length; i++) {
            var detailItem = elm.content[i];
            var detailItemContainer = $('<div class="content-panel-column-detail-item"></div>');
            
            if (detailItem.text) {
                detailItemContainer.append($('<p>' + detailItem.text + '</p>'));
            }
            
            rightColumnContainer.append(detailItemContainer);
        }
    }
    
    rightColumnContainer.append($('<div class="content-panel-right-container-spacer"></div>'));
    
    background.append(result);
    return background;
}

function loadSectionContentForElement(elm, elmIdx) {
    var $elm = $(elm);
    var loc = $elm.attr('content-src');
    $.getJSON(loc, function(desc) {
        var navId = loc;
        navId = navId.substr(navId.indexOf('/') + 1);
        navId = navId.substr(0, navId.lastIndexOf('.'));

        var navTitle = desc.title;
        var isTimeline = desc.timeline;
        if (navTitle == undefined) {
            navTitle = navId.charAt(0).toLocaleUpperCase() + navId.slice(1).toLocaleLowerCase();
        }

        var addedAnchor = false; 
        {
            var addedContainerContent = false;
            var container = $('<div class="content-title-container"></div>');
            if (desc.title != undefined) {
                var titleElement = $('<div class="content-title" id="' + navId + '">' + desc.title + '</div>');
                addedAnchor = true;
                addedContainerContent = true;
                container.addClass('content-title-container-with-title');

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

                container.append(titleElement);
            }
            
            if (desc.description != undefined) {
                addedContainerContent = true;
                // Add the description element
                container.append($(
                    '<br><br><div class="content-description">' + desc.description + '</div>'
                ));
            }
            
            if (addedContainerContent) {
                $elm.append(container);
            }
        }

        $('.nav-list').append('<div class="nav-list-item" index="'  + elmIdx + '" onclick="scrollToSection(\'' + navId + '\')">' + navTitle + '</div>');
        var sortedNavItems = $('.nav-list').children('.nav-list-item').sort(function(a, b) {
            var vA = a.getAttribute('index');
            var vB = b.getAttribute('index');
            return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
        });
        $('.nav-list').append(sortedNavItems);

        var containerClass = "content-container";
        if (isTimeline) {
            containerClass += " timeline";
        }
        
        var content;
        if (addedAnchor) {
            content = $('<div class="' + containerClass + '"></div>');
        } else {
            content = $('<div class="' + containerClass + '" id="' + navId + '"></div>');
        }
        $elm.append(content);

        var items = desc.items;
        
        if (isTimeline) {
            items.sort((a, b) => (Date.parse(a.date) < Date.parse(b.date)) ? 1 : -1);
        }
        
        var completions = [];
        
        var arrayLength = items.length;
        for (var i = 0; i < arrayLength; i++) {
            var item = items[i];
            
            if (item.isPanel) {
                content = $('<div class="content-title-container"></div>');
                content.append(parsePanel(item));
                $elm.append(content);
                
                if (i < arrayLength) {
                    content = $('<div class="' + containerClass + '"></div>');
                    $elm.append(content);
                }
                
                continue;
            }

            var elementContent;
            var itemClass = "content-item";
            if (item.photo != undefined) {
                elementContent = '<div class="image-loader fill-image" image-src="' + item.photo + '"image-pos="top" ></div>';
            } else if (item.text != undefined) {
                elementContent = '<p>' + item.text + '</p>';
            } else if (item.calendar != undefined) {
                elementContent = createCalendar(item.calendar);
                completions.push(function(idx) {
                    return function() {
                        loadCalendar(idx);
                    };
                }(currentCalendarID));
                
                itemClass += " content-item-full-width"
            }
            
            if (item.icon) {
                var iconContent = '<image class="content-icon" src="' + item.icon + '" />'; 
                
                if (elementContent != undefined) {
                    elementContent = iconContent + elementContent;
                } else {
                    elementContent = iconContent;
                }
            }

            if (elementContent != undefined) {
                var itemElement = $('<div class="' + itemClass + '"></div>');
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
                        };
                    } (item));
                } else if (item.photo != undefined) {
                    itemElement.addClass('content-item-bounce');
                } else if (item.text != undefined) {
                    itemElement.addClass('content-item-highlight');
                }
                
                if (isTimeline) {
                    var parent = $('<div class="timeline-item"></div></div>');
                    parent.append($('<div class="timeline-connector"></div>'));
                    parent.append($('<div class="timeline-indicator"></div>'));
                    
                    var options = { year: 'numeric', month: 'long' };
                    var date = new Date( Date.parse(item.date) );
                    
                    if (typeof date.getMonth === 'function') {
                        parent.append($('<div class="timeline-date">' + date.toLocaleDateString("en-US", options) + '</div>'));
                    }
                    
                    var localContent = $('<div class="timeline-item-container"></div>');
                    if (item.title) {
                        localContent.append($('<p class="content-planel-title">' + item.title + '</p>'));
                    }
                    
                    localContent.append(elementContent);
                    
                    if (item.linkSrc) {
                        var link = $('<div class="content-planel-link content-item-link content-item-bounce"><image src="icons/link.small.svg" /></div>');
                        link = link.click(function(item) {
                                        return function() {
                                            window.open(item.linkSrc, '_self');
                                        };
                                    } (elm));
                        localContent.append(link);
                    }
                    
                    var localParentContainer = $('<div class="' + itemClass + '"></div>');
                    localParentContainer.append(localContent);
                    
                    parent.append(localParentContainer);
                    itemElement = parent;
                }

                content.append(itemElement);
            }
        }
        
        for (var idx in completions) {
            completions[idx]();
        }

        $elm.find('.image-loader').each(function() {
            loadContentForElement(this);
        });
    });
}

function resizeNavBackground() {
    if ($('.nav-list').hasClass('visible')) {
        // Visible size to the entire content
        var width = $('.nav-container').width();
        var height = $('.nav-container').height();

        $('.nav-container-background').height(height);
        $('.nav-container-background').width(width);

        setTimeout(function() {
            $('.nav-container-background').addClass('expanded');
        }, 330);
    } else {
        // Visible to just the button size
        var width = $('.nav-button').width();
        var height = $('.nav-button').height();

        $('.nav-container-background').height(height);
        $('.nav-container-background').width(width);

        setTimeout(function() {
            $('.nav-container-background').removeClass('expanded');
        }, 330);
    }
}

function toggleNavList() {
    var navList = $('.nav-list');
    if ($('.nav-list').hasClass('visible')) {
        $('.nav-list').removeClass('visible');
    } else {
        $('.nav-list').addClass('visible');
    }

    resizeNavBackground();
}

function scrollToSection(sec) {
    // Close the nav menu if it's open
    if ($('.nav-list').hasClass('visible') && !$('.nav-list').hasClass('force-visible')) {
        $('.nav-list').removeClass('visible');
    }

    resizeNavBackground();

    var scroll = new SmoothScroll();
    var anchor = document.querySelector('#' + sec);
    scroll.animateScroll(anchor);
}

function scrollIndicatorClick() {
    $('.nav-list').children().first().trigger('click');
}

var currentCalendarID = 0;
var calendarData = {};
function createCalendar(link) {
    currentCalendarID += 1;
    
    let date = new Date();
    var calendarDat = {
        "currYear" : date.getFullYear(),
        "currMonth" : date.getMonth(),
        "date" : date,
        "events" : []
    };
    calendarData[currentCalendarID] = calendarDat;
    
    $.ajax({
          method: "GET",
          dataType: "text",
          url: link,
          success: function(identifier){return (function (data) {
              var parsed = ICAL.parse(data);
              var comp = new ICAL.Component(parsed);
              var vevents = comp.getAllSubcomponents("vevent");
              var events = vevents.map((val) => {
                  var event = new ICAL.Event(val);
                  var convertedTime = createToLocalTime(event.startDate, event.startDate.zone);
                  createToLocalTime(event.endDate, event.endDate.zone);
                  return {
                      "event" : event,
                      "time" : convertedTime
                  };
              });
              calendarData[identifier].events = events;
              loadCalendar(identifier);
          });}(currentCalendarID)
      });
    
    var content = '<div id="calendar-' + currentCalendarID + '">' +
        '<div class="calendar-wrapper">' + 
        '<header>' +
        '<p class="calendar-current-date"></p>' +
        '<div class="calendar-icons">' +
        '<span class="calendar-button current noselect ">·</span>' +
        '<span class="calendar-button previous noselect ">←</span>' +
        '<span class="calendar-button next noselect ">→</span>' +
        '</div>' +
        '</header>' +
        '<div class="calendar">' +
        '<ul class="calendar-weeks noselect">' +
        '<li>Sun</li>' +
        '<li>Mon</li>' +
        '<li>Tue</li>' +
        '<li>Wed</li>' +
        '<li>Thu</li>' +
        '<li>Fri</li>' +
        '<li>Sat</li>' +
        '</ul>' +
        '<ul class="calendar-days"></ul>' +
        '</div>' +
        '</div>' +
        '<div class="calendar-list">' +
        '</div>' +
        '</div>';
    return content;
}


function loadCalendar(identifier) {
    var calendarElement = $('#calendar-' + identifier);
    
    let date = calendarData[identifier].date;
    let currYear = calendarData[identifier].currYear;
    let currMonth = calendarData[identifier].currMonth;
    let selected = calendarData[identifier].selected;
    
    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "Novemeber", "December"
    ];
    
    let firstDayOfMonth = new Date(currYear, currMonth, 1).getDay();
    let lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate();
    let lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDate();
    let lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate();
    
    var liTag = "";
    for (var i = firstDayOfMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateOfLastMonth - i + 1}</li>`;
    }
    
    for (var i = 1; i <= lastDateOfMonth; i++) {
        let isToday = (i === date.getDate() && 
                        currMonth === new Date().getMonth() &&
                        currYear === new Date().getFullYear()) ? "active" : "";
        let isSelected = (i === selected) ? "selected" : "";
        let hasEvents = (eventsForDay(identifier, currYear, currMonth, i).length > 0) ? "hasEvent" : "";
        liTag += `<li class="calendar-day ${isToday} ${isSelected} ${hasEvents}">${i}</li>`;
    }
    
    for (var i = lastDayOfMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i = lastDayOfMonth + 1}</li>`;
    }
    
    calendarElement.find(".calendar-current-date")
        .text(`${months[currMonth]} ${currYear}`);
    
    calendarElement.find(".calendar-days")
        .html(liTag);
    
    calendarElement.find('.next')
        .off('click')
        .on('click', (function(identifier) { return function() { handleCalendarButtonPress(identifier); }; } )(identifier));
    
    calendarElement.find('.previous')
        .off('click')        
        .on('click', (function(identifier) { return function() { handleCalendarButtonPress(identifier); }; } )(identifier));
    
    calendarElement.find('.current')
        .off('click')        
        .on('click', (function(identifier) { return function() { handleCalendarButtonPress(identifier); }; } )(identifier));
    
    calendarElement.find('.calendar-day')
        .off('click')        
        .on('click', (function(identifier) { return function() { handleDatePress(event, identifier); }; } )(identifier));
}

function handleCalendarButtonPress(identifier) {
    var currYear = calendarData[identifier].currYear;
    var currMonth = calendarData[identifier].currMonth;
    var date = calendarData[identifier].date;
    
    if ($(event.target).hasClass('next')) {
        currMonth += 1;
    } else if ($(event.target).hasClass('previous')) {
        currMonth -= 1;
    } else {
        date = new Date();
        currMonth = date.getMonth();
        currYear = date.getFullYear();
    }
    
    if (currMonth < 0 || currMonth > 11) {
        date = new Date(currYear, currMonth);
        currYear = date.getFullYear();
        currMonth = date.getMonth();
    } else {
        date = new Date();
    }
    
    calendarData[identifier].currYear = currYear;
    calendarData[identifier].currMonth = currMonth;
    calendarData[identifier].date = date;
    calendarData[identifier].selected = null;
    
    loadCalendar(identifier);
}

function handleDatePress(event, identifier) {
    let date = $(event.target).text();
    let newDay = Number.parseInt(date);
    calendarData[identifier].selected = newDay;
    let currYear = calendarData[identifier].currYear;
    let currMonth = calendarData[identifier].currMonth;
    
    $('.calendar-list').children()
        .remove();
    
    var events = eventsForDay(identifier, currYear, currMonth, newDay);
    var content = '';
    for (var idx in events) {
        var event = events[idx].event;
        var time = events[idx].time;
        
        content += '<div class="calendar-list-item">' +
                '<div class="calendar-list-item-title">' + event.summary + '</div>';
        
        
        if (time != undefined) {
            let timezoneOffset = (new Date()).getTimezoneOffset();
            let startTime = new Date(Date.UTC(time.year, time.month, time.day, time.hour, time.minute) + 1000 * 60 * timezoneOffset);
            var endTime = new Date(startTime.getTime() + event.duration.toSeconds() * 1000);
            
            let formatter = new Intl.DateTimeFormat('default', {
                // hour12: true,
                hour: 'numeric',
                minute: 'numeric'
            });
            
            let formattedStartTime = formatter.format(startTime);
            let formattedEndTime = formatter.format(endTime);
            
            content += '<div class="calendar-list-item-time">' + formattedStartTime + ' - ' + formattedEndTime + '</div>';
        }
        
        if (event.location != undefined) {
            content += '<div class="calendar-list-item-location">' + event.location + '</div>';
        }
        
        content += '</div>';
    }
    
    $('.calendar-list')
        .append(content);
    
    loadCalendar(identifier);
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
        $('.nav-container-background').addClass('visible');
    }, 2500);

    $('.nav-button').on('click', toggleNavList);
    resizeNavBackground();
});

function eventsForDay(identifier, year, month, day) {
    var events = calendarData[identifier].events;
    
    var allEvents = [];
    for (var idx in events) {
        var event = events[idx];
        
        if (event.event.isRecurring()) {
            var iterator = event.event.iterator();
            while (!iterator.completed) {
                var date = iterator.next();
                if (date == undefined) {
                    break;
                }
                var newDate = date;
                createToLocalTime(newDate, event.time.zone);

                if (newDate.year == year && newDate.month == (month + 1) && newDate.day == day) {
                    allEvents.push({
                        'time' : newDate,
                        'event' : event.event
                    });
                }
            }
        } else {
            let startDate = event.time;

            if (startDate.year == year && startDate.month == (month + 1) && startDate.day == day) {
                allEvents.push(event);
            }
        }
    }
    
    allEvents.sort(function(a, b) {
        let time1 = a.time;
        let time2 = b.time;
        let result = time1.hour - time2.hour;
        if (result == 0) {
            return time1.minute - time2.minute;
        } else {
            return result;
        }
    });
    return allEvents;
}

var localTimezone = null;
function createToLocalTime(time, timezone) {
    if (localTimezone == null) {
        let tzid = Intl.DateTimeFormat().resolvedOptions().timeZone;
        localTimezone = ICAL.TimezoneService.get(tzid);
    }
    var newTime = time;
    ICAL.Timezone.convert_time(newTime, timezone, localTimezone);
    return newTime;
}
