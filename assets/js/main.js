/**
 * main.js - Core logic for the Unblocked Classroom
 */

// 1. Tab Cloaking Logic
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = "Classwork";
    } else {
        // Restore the original title from the HTML <title> tag
        const originalTitle = document.querySelector('title').innerText;
        document.title = originalTitle || "Classroom";
    }
});

// 2. Panic Key (Escape)
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        // Instant redirect to the real Google Classroom
        window.location.href = "https://classroom.google.com";
    }
});

// 3. Automatic Assignment Loader
async function loadAssignments(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // Path logic: Go up one level from /classes/ then into /data/
        const response = await fetch('../data/content.json');
        if (!response.ok) throw new Error("JSON file not found at /data/content.json");
        
        const data = await response.json();
        const items = data[category];

        container.innerHTML = ''; // Clear loading text

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'post-card';
            
            card.onclick = () => {
                if(item.folder) {
                    // Game Logic
                    window.location.href = `classwork.html?type=game&id=${item.folder}&name=${encodeURIComponent(item.title)}`;
                } else if (item.movie_url) {
                    // Movie Logic
                    window.location.href = `classwork.html?type=movie&url=${encodeURIComponent(item.movie_url)}&name=${encodeURIComponent(item.title)}`;
                }
            };

            card.innerHTML = `
                <div class="post-icon">${item.icon}</div>
                <div>
                    <div style="font-size: 14px;"><strong>${item.instructor}</strong> posted a new material: <strong>${item.title}</strong></div>
                    <div style="font-size: 12px; color: #5f6368;">${item.time}</div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading assignments:", error);
        container.innerHTML = `<p style="color:red; padding:20px;">Error: Could not load data from /data/content.json</p>`;
    }
}
