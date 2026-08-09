

// GOOGLE SHEET FATECH FUNCTION START/////////--------------------------
// GOOGLE SHEET FETCH FUNCTION START
// ================================

const API = "https://script.google.com/macros/s/AKfycbyDnHaoxT4wXMIKFJXWaSeDjn6C7mPCFUtfl1zGuE5f5i370R-zQAakEt71EsZKpKhTvw/exec";

let currentLinks = {};

// Load iframe links
async function loadLinks() {
    try {
        const res = await fetch(API + "?action=links");
        const data = await res.json();

        currentLinks = data;

        for (const page in data) {
            const frame = document.getElementById(page + "Frame");

            if (frame) {
                frame.src = data[page];
            }
        }

    } catch (err) {
        console.error("Load Links Error:", err);
    }
}

// Save Visitor Log


async function logUserActivity() {

    try {

        let payload = {
            ip: "",
            city: "",
            state: "",
            country: "",
            isp: "",
            locationSource: "IP",

            latitude: "",
            longitude: "",





            accuracy: "",



            device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
            browser: navigator.userAgent,
            os: navigator.platform,
            screen: screen.width + " x " + screen.height,
            page: location.href,
            referrer: document.referrer


        };

        // IP Info (Fallback)
        const geo = await fetch("https://ipapi.co/json/")
            .then(res => res.json());

        payload.ip = geo.ip || "";
        payload.city = geo.city || "";
        payload.state = geo.region || "";
        payload.country = geo.country_name || "";
        payload.isp = geo.org || "";

        // GPS Location
        // GPS Location with Permission Check
if ("permissions" in navigator) {

    const permission = await navigator.permissions.query({
        name: "geolocation"
    });

    if (permission.state === "granted" || permission.state === "prompt") {

        try {

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: false,
                        timeout: 6000,
                        maximumAge: 300000
                    }
                );
            });

            payload.latitude = position.coords.latitude;
            payload.longitude = position.coords.longitude;
            payload.accuracy = position.coords.accuracy;

            const loc = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${payload.latitude}&lon=${payload.longitude}`
            ).then(r => r.json());

            const addr = loc.address || {};

            payload.city =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.hamlet ||
                payload.city;

            payload.state = addr.state || payload.state;
            payload.country = addr.country || payload.country;

            payload.locationSource = "GPS";

        } catch (e) {

            console.log("GPS unavailable. Using IP.");

        }

    } else {

        console.log("Location permission denied. Using IP.");

    }

}

        const form = new FormData();
        form.append("data", JSON.stringify(payload));

        await fetch(API, {
            method: "POST",
            body: form
        });

        console.log("Visitor Saved");

    } catch (err) {

        console.error("Log Error:", err);

    }

}









window.addEventListener("load", () => {
    loadLinks();
    logUserActivity();
});

// GOOGLE SHEET FETCH FUNCTION END
// GOOGLE SHEET FATECH FUNCTION ------CLOSE --------------------------

