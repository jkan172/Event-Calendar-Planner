const daysTag = document.querySelector(".days"),
      currentDate = document.querySelector(".current-date"),
      prevNextIcon = document.querySelectorAll(".icons span"),
      infoBox = document.querySelector(".info-box");

let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth();

const months = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"];

let specialEvents = {}; // Empty object to store event data

// Fetch event data from JSON file
fetch('events.json')
    .then(response => response.json())
    .then(data => {
        specialEvents = data;
        renderCalendar(); // Render the calendar after loading events
        setInitialSelectedDay(); // Set the selected day AFTER rendering
    })
    .catch(error => console.error("Error loading events:", error));

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();

    let liTag = "";
    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }
    for (let i = 1; i <= lastDateofMonth; i++) {
        let isToday = i === date.getDate() && currMonth === new Date().getMonth() 
                        && currYear === new Date().getFullYear() ? "active" : "";
        let eventKey = `${currMonth}-${i}`;
        let hasEvent = specialEvents[eventKey] ? "event-day" : ""; 
        liTag += `<li class="${isToday} ${hasEvent}" data-date="${i}">${i}</li>`;
    }
    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }

    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;

    document.querySelectorAll(".days li").forEach(day => {
        // Inside the renderCalendar function, update the click event handling
        day.addEventListener("click", () => {
            document.querySelectorAll(".days li").forEach(d => d.classList.remove("selected")); // Remove selected class from all
            day.classList.add("selected"); // Add selected class to the clicked one

            const selectedDate = day.getAttribute("data-date");
            if (selectedDate) {
                let eventKey = `${currMonth}-${selectedDate}`;
                let eventText = specialEvents[eventKey] || `Selected Date: ${months[currMonth]} ${selectedDate}, ${currYear}`;
                infoBox.innerHTML = `<h2>${eventText}</h2>`;

                // Prepare the Google Calendar link
                const eventTitle = specialEvents[eventKey] || `Event on ${months[currMonth]} ${selectedDate}`;
                const eventDate = new Date(currYear, currMonth, selectedDate);
                const startDate = formatDateForGoogleCalendar(eventDate); // Format date for Google Calendar
                
                // Generate Google Calendar link
                const googleCalendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${startDate}`;
                
                // Create the button and add the Google Calendar link
                infoBox.innerHTML = `
                    <h2>${eventText}</h2>
                    <button class="add-to-calendar-btn" onclick="window.open('${googleCalendarLink}', '_blank')">
                        Add to Google Calendar
                    </button>
                `;
            }
        });

    });
};
    
// Function to ensure the active day starts selected when the page loads
const setInitialSelectedDay = () => {
    const activeDay = document.querySelector(".days li.active");
    if (activeDay) {
        activeDay.classList.add("selected"); // Make sure today is red on load
    }
};

// Function to format the date into Google Calendar format: YYYYMMDDT000000Z
function formatDateForGoogleCalendar(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}T000000Z`; // Format as YYYYMMDDT000000Z
}

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
        if (currMonth < 0 || currMonth > 11) {
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        } else {
            date = new Date();
        }
        renderCalendar();
    });
});
