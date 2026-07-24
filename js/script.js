console.log("script.js loaded");
function toggleSidebar(){

    const sidebar = document.getElementById("sidebar");
    const button = document.querySelector(".menu-button");
    const mainContent = document.querySelector("main");


    sidebar.classList.toggle("open");
    sidebar.classList.toggle("closed");
    mainContent.classList.toggle("expanded");


    if(sidebar.classList.contains("open")){
        button.innerHTML = "▶";
    }
    else{
        button.innerHTML = "◀";
    }
}

/* Exit sidebar when scrolling in main content */
const mainContent = document.querySelector("body");
mainContent.addEventListener("wheel", () => {
    const sidebar = document.getElementById("sidebar");
    if(!sidebar.classList.contains("closed")){
        toggleSidebar();
    }
    
});

/*Highlight current page in sidebar*/
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".navigation a");

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {

                link.classList.remove("active");

                if (link.getAttribute("href") === "#" + id) {
                    link.classList.add("active");
                }
            });
            //console.log("Aktive Section:", entry.target.id);
        }

    });

}, {
    threshold: 0.5
});


sections.forEach(section => {
    observer.observe(section);
});
/* Ligtbox for gallery images */

const images = document.querySelectorAll(".gallery-img");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const close = document.querySelector(".close");


images.forEach(image => {

    image.addEventListener("click", () => {

        lightbox.style.display = "flex";

        lightboxImg.src = image.src;

    });

});


close.addEventListener("click", () => {

    lightbox.style.display = "none";

});


lightbox.addEventListener("click", (event) => {

    if(event.target === lightbox){
        lightbox.style.display = "none";
    }

});

/* Photo Sphere Viewer for virtual tour */
const buttons = document.querySelectorAll(".rundgang-button");
var panorama_path = 'assets/images/flat/main_360.jpg';
const panoramas = {
    "Wohnküche": 'assets/images/flat/main_360.jpg',
    "Schlafzimmer1": 'assets/images/flat/schlafzimmer1_360.jpg'
};

var viewer = new PhotoSphereViewer.Viewer({

            container: document.querySelector('#viewer'),

            panorama: panorama_path,

            navbar: [
                'zoom',
                'fullscreen'
            ],

            // Start-Zoom
            defaultZoomLvl: 0,

            // Start-Blickrichtung
            defaultYaw: 10,
            defaultPitch: 0,

});
document.getElementById("Wohnküche").classList.toggle("active");

buttons.forEach(button => {
    button.addEventListener("click", async () => {
        const buttonId = button.id;

        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        panorama_path = panoramas[buttonId];

        await viewer.setPanorama(panorama_path);

    })
});



/* Fetch blocked days from Google Calendar API and sync it with data chooser*/

function updateCalendar() {

    const lastUpdate = localStorage.getItem("calendarUpdate");
    const now = Date.now();

    
    //if (lastUpdate && now - lastUpdate < 3600000) {
    //    console.log("Kalender aus Cache geladen");
    //    return;
    //}

    fetch("https://www.googleapis.com/calendar/v3/calendars/1lc3882vqo8ggcqou04eagh7ih565b2r@import.calendar.google.com/events?key=AIzaSyDfhZJZRnbCvo-worwfiNJffNWqoXmB8hc")
        .then(res => res.json())
        .then(data => {

        var blockedDays = [];

        data.items.forEach(event => {

            const start = new Date(event.start.date || event.start.dateTime);
            const end = new Date(event.end.date || event.end.dateTime);

            const current = new Date(start);

            while (current < end) {
                blockedDays.push(current.toISOString().split("T")[0]);
                current.setDate(current.getDate() + 1);
            }
    });

    // Nur die geblockten Tage speichern
    blockedDays = [...new Set(blockedDays)].sort();
    localStorage.setItem(
        "blockedDays",
        JSON.stringify(blockedDays)
    );
    console.log(localStorage.getItem("blockedDays"));

    localStorage.setItem(
        "calendarUpdate",
        now
    );

    console.log("Kalender aktualisiert");
    });
};
updateCalendar();

var blockedDays = JSON.parse(localStorage.getItem("blockedDays")) || [];
blockedDays = blockedDays.map(date => {
    const [year, month, day] = date.split("-");
    return `${day}.${month}.${year}`;
});


flatpickr("#date-from", {
    locale: "de",
    dateFormat: "d.m.Y",
    disable: blockedDays,
    minDate: "today"
});


flatpickr("#date-to", {
    locale: "de",
    dateFormat: "d.m.Y",
    disable: blockedDays,
    minDate: "today"
});


// Load Reviews
const review_container = document.getElementById("review-window")
const review_template = document.getElementById("review-template")

fetch("rezensionen.json").then(response=>response.json()).then(data=>data.forEach(entry=>{
    const review_copy = review_template.content.cloneNode(true)
    //Image
    if(entry.imagepath){
        console.log(entry.imagepath);
        review_copy.querySelector(".bubble-icon").src = entry.imagepath
    }
    //stars
    var stars = ""
    for(i=1; i<=entry.rating;i++){
        stars = stars + "★";
    }
    review_copy.querySelector("#stars").textContent = stars;

    //Review
    review_copy.querySelector("#review").textContent = entry.review;

    //Author
    review_copy.querySelector("#author").textContent = entry.author;

    review_container.appendChild(review_copy)

}
))



