var Calendar = function(params) {
    // The current day of the month
    this.today = {
      day: moment().date(),
      month: moment().month(),
    };

    this.config = {
      // calendar year
      year: moment().year(),
      month: moment().month(),
      // Where to build the calendar
      container: $('#calendar'),
      // The url to fetch the events from
      url: null,
      // Allow user to override the fields supplied for event title and time
      eventLabels: {
        title: 'title',
        time: 'time'
      }
    };

    // This months events
    this.events = [];

    // Get the calendar of events from the server
    this.getEvents = function(callback) {
        var cal = this;
        if(this.config.url != null) {
          $.ajax({
              url: this.config.url,
              dataType: 'json'
          }).done(function(response) {
              console.log('Got the events');
              cal.events = response;
          }).always(function() {
            callback();
          });
        } else {
          callback();
        }
    }

    // Render the calendar on the page
    this.render = function() {
        // Empty the calendar body
        $('#calendar-body').empty();

        // Set the display of the month we are viewing
        $('#display-month').empty().append(this.getCalendarDate().format('MMMM') + ' ' + this.getCalendarDate().format('YYYY'));

        // Track the day of the month
        var dayCount = 1;

        // The first "week"
        var weekOne = $('<tr></tr>');

        // Create empty blocks if the month doesn't start on Sunday
        for(var i=0; i<this.getFirstdayOfMonth(); i++) {
            weekOne.append($('<td class="no-day"></td>'));
        }
        // Populate the rest of the first week.
        for(var i=this.getFirstdayOfMonth(); i<7; i++, dayCount++) {
            var dayToAdd = this.buildDay(dayCount);
            weekOne.append(dayToAdd);
        }
        $('#calendar-body').append(weekOne);

        // Populate the rest of the weeks
        for(var i=this.getNumberOfWeeks(); i>1; i--) {
            var currentWeek = $('<tr></tr>');

            for(var j=0; j<7 && dayCount<= this.getLastDayOfMonth(); j++, dayCount++) {
                var dayToAdd = this.buildDay(dayCount);
                currentWeek.append(dayToAdd);
            }

            $('#calendar-body').append(currentWeek);
        }
    }

    /**
     * Build the cell for each day adding events where applicable.
     * @param day Number
     * @returns Element (td)
     */
    this.buildDay = function(day) {
        var self = this;

        // Check to see if there are any events for this day
        var eventDate = this.config.year+'-'+(this.config.month+1)+'-'+day;
        var thisDatesEvents = this.events[eventDate];

        var dayToAdd = null;

        // check to see if there are events to add
        if(thisDatesEvents != undefined && thisDatesEvents.hasOwnProperty('events')) {
          dayToAdd = $('<td class="day activity"></td>');

          // if the calendar is small, display events in tooltip
          if(this.isCalendarSmall()) {
            this.createTooltip(day, dayToAdd, thisDatesEvents.events, thisDatesEvents.url);
          } else {
            // Add events to the table cell
            this.addEvents(day, dayToAdd, thisDatesEvents.events, thisDatesEvents.url);
          }
        } else {
            dayToAdd = $('<td class="day">' + day + '</td>');
        }

        if(day == this.today.day && this.config.month == this.today.month) {
            dayToAdd.addClass('today');
        }

        return dayToAdd;
    }

    /**
     * Build the calendar table and header
    */
    this.buildCalendar = function() {
        var cal = $('<div class="cal calendar">' +
                    '<table cellspacing="0">' +
                        '<thead>' +
                        '<tr class="month">' +
                            '<th colspan="2" class="cal-nav prev">' +
                                '<a class="calendar-button prev" id="calendar-prev" href="#">' +
                                    '&#9668;' +
                                '</a>' +
                            '</th>' +
                            '<th colspan="3" class="top_label"><span id="display-month"></span></th>' +
                            '<th colspan="2" class="cal-nav next">' +
                                '<a class="calendar-button next" id="calendar-next" href="#">' +
                                    '&#x25ba;' +
                                '</a>' +
                            '</th>' +
                        '</tr>' +
                        '<tr class="days">' +
                            '<td>Su</td>' +
                            '<td>Mo</td>' +
                            '<td>Tu</td>' +
                            '<td>We</td>' +
                            '<td>Th</td>' +
                            '<td>Fr</td>' +
                            '<td>Sa</td>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody id="calendar-body"></tbody>' +
                    '</table>');
        $(this.config.container).append(cal);
    }

    /*
     * If the calendar is too small to display the events in the date cell then a
     * a tooltip is used
    **/
    this.createTooltip = function(day, cell, events, url) {
      var self = this;
      var tooltip = '';
      $.each(events, function(index) {
         tooltip += "\r\n" + events[index][self.config.eventLabels.time] + " - " + events[index][self.config.eventLabels.title] + "<br>";
      });

      var anchor = $('<a title="' + tooltip + '" href="' + url + '">' + day + '</a> ');
      cell.append(anchor);
    }

    // Add the events to the date cell
    this.addEvents = function(day, cell, events, url) {
      var self = this;

      var dateDiv = $('<div class="cal-date"></div>');
      var anchor = $('<a href="'+ url + '">' + day + '</a>');
      dateDiv.append(anchor);

      var eventDiv = $('<div class="cal-events"></div>');
      // loop through the events and add each
      $.each(events, function(index) {
        var eventAnchor = $('<a title="' + events[index][self.config.eventLabels.title] + '" href="' + events[index].url + '">' + events[index][self.config.eventLabels.time] + '</a>');
        var eachEventDiv = $('<div class="cal-event"></div>');
        eachEventDiv.append(eventAnchor);
        eventDiv.append(eachEventDiv);
      });

      cell.append(dateDiv);
      cell.append(eventDiv);
    }

    // Render the calendar and add button events
    this.init = function(params) {
        var self = this;

        // Add user supplied parameters to the config object
        $.extend(this.config, params);

        // build the calendar table
        this.buildCalendar();

        // Add button event for next
        $('#calendar-next').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.next();
        });

        // add button event for prev
        $('#calendar-prev').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.prev();
        });

        // Get the events to add to the calendar, render when complete
        this.getEvents(function() {
          console.log('Rendering calendar');
          self.render();
        });

        // Use the title attribute to render tooltips
        $('#calendar').tooltip({
          content:function(){
            return this.getAttribute("title");
          }
        });

        $(window).resize(function() {
          self.render();
        })
    }

    /**
     * Display the next month
     */
    this.next = function() {
        if(this.config.month == 11) {
            this.config.month = 0;
            this.config.year++;
        } else {
            this.config.month++;
        }

        var self = this;
        this.getEvents(function() {
          self.render();
        });
    }

    /**
     * Display the previous month
     */
    this.prev = function() {
        if(this.config.month == 0) {
            this.config.month = 11;
            this.config.year--;
        } else {
            this.config.month--;
        }

        var self = this;
        this.getEvents(function() {
          self.render();
        });
    }


    /**
     * Return a numerical representation of the first day of the week in the month (eg 0 = Sunday)
     * @returns Number
     */
    this.getFirstdayOfMonth = function() {
        return moment({year: this.config.year, month: this.config.month, day: 1}).day();
    }

    // Get the number of weeks in this month
    this.getNumberOfWeeks = function() {
        var numDays = this.getLastDayOfMonth() + this.getFirstdayOfMonth();
        return Math.ceil(numDays / 7);
    }

    // Get the number of days in the month
    this.getLastDayOfMonth = function() {
        return this.getCalendarDate().daysInMonth();
    }

    // Get a moment object for the requested month
    this.getCalendarDate = function() {
        return moment({year: this.config.year, month: this.config.month});
    }

    this.isCalendarSmall = function() {
      return ($('#calendar').width() < 500);
    }

    this.init(params);
}
