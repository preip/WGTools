$(document).ready(function() {

    $('#calendar').fullCalendar({
        
        //header button configuration
        header: {
            left: 'today, prev, next',
            center: 'title',
            right: 'listMonth,month'
        },

        // customize the button names,
        // otherwise they'd all just say "list"
        views: {
            listMonth: { buttonText: 'list month' }
        },
        aspectRatio: 1.5,
        selectable: true,
        eventLimit: true,
        events: getInitialEvents(),  
        select: addEvent,
        eventClick: removeEvent
    })
    
    
    function removeEvent(event) {
        if(confirm("Remove event?")) {
            $('#calendar').fullCalendar('removeEvents', event._id);
        }
    }
    
    function addEvent(start, end) {
        var title = prompt('Event Title:');
        var eventData;
        if (title) {
            eventData = {
                title: title,
                start: start,
                end: end,
                allDay: true
            };
            $('#calendar').fullCalendar('renderEvent', eventData, true);
            var events = $('#calendar').fullCalendar('clientEvents');
            for(var i in events) {
                events[i].source = null;
            }
            console.log(events);
            $.ajax({
                url: '/calendar/save', 
                type: 'POST',
                data: events
            })
        }
        $('#calendar').fullCalendar('unselect');
    }

});