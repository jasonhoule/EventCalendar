Event Calendar
==============

#### Requirements
1. [jQuery 3.1.1](https://code.jquery.com/jquery-3.1.1.min.js)
2. [jQuery UI 1.12.1](http://code.jquery.com/ui/1.12.1/jquery-ui.min.js)
3. [jQuery UI 1.12.1 theme](http://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css)
4. [moment.js 2.17.1](https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.17.1/moment.min.js)

#### Parameters
The Calendar contstructor accepts an object with optional parameters.

**_year_** - The starting year to display. The default is the current year.

**_month_** - The starting month to display. The default is the current month.

**_container_** - The html element in which to build the calendar. By default it will look for an element with an id of 'calendar'.

**_url_** - The URL from which to fetch events.

**_eventLabels_** - An object allowing the user to provide their own labels for event title and time.

#### Usage
Using the defaults:
```javascript
var myCalendar = new Calendar();
```

Providing optional parameters:
```javascript
// Create a calendar instance with default of todays month and year
var myCalendar = new Calendar({
  container: '#my-calendar',
  year: moment.year(),
  month: moment.month(),
  url: '/js/events.json'
});
```

Providing user created labels for the events:
```javascript
var myCalendar = new Calendar({
  eventLabels: {
    title: "presentation",
    time: "start_time"
  }
});
```

#### Events object
While the labels can be changed the events themselves are expected in a particular format.
The calendar expects a json object with the dates as labels. These objects can containe a
URL and an array of events. The events are expected to have at least a title and time.

```javascript
{
  "2017-1-24": {
    "url": "http://mycalendar.com/2017-1-24",
    "events": [
      {
        "id": 1,
        "title": "My Event",
        "time": "10:30 am",
        "url": "http://my-event-site.com"
      },
      {
        "id": 2,
        "title": "Another Event",
        "time": "6:30 pm",
        "url": "http://another-event.com"
      }
    ]
  }
}
```
