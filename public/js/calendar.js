$(document).ready(function() {

    $('#calendar').fullCalendar({
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
        events: [
            {
                title: 'Test',
                start: '2017-04-020',
                allDay: true
            },
            {
                title: 'Test',
                start: '2017-04-019',
                allDay: true
            },
            {
                title: 'PutzenKatja',
                start: '2017-04-019',
                allDay: true
            }
        ],
        
        select: addEvent,
        eventClick: removeEvent
    })
    
    
    function removeEvent(event, jsEvent, view) {
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
				}
				$('#calendar').fullCalendar('unselect');
			}

});