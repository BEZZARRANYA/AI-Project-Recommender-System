// js/app.js
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("questionnaireForm");
    const loadingScreen = document.getElementById("loadingScreen");
    const projectsContainer = document.getElementById("projectsContainer");
    const regenerateBtn = document.getElementById("regenerateBtn");

    /* ================== QUESTIONNAIRE PAGE ================== */
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loadingScreen) loadingScreen.style.display = "flex";

            const formData = new FormData(form);
            const skill = formData.get("skill") || "";
            const difficulty = formData.get("difficulty") || "";
            const projectType = formData.get("projectType") || "";
            const languages = formData.getAll("languages") || [];
            const interests = formData.getAll("interests") || [];

            const payload = { skill, difficulty, projectType, languages, interests };

            try {
                const response = await fetch("http://localhost:5001/recommend", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("Failed to fetch recommendations");
                const recommendedProjects = await response.json();

                localStorage.setItem("userPreferences", JSON.stringify(payload));
                localStorage.setItem("recommendedProjects", JSON.stringify(recommendedProjects));

                if (loadingScreen) loadingScreen.style.display = "none";
                window.location.href = "indexResults.html";

            } catch (err) {
                console.error(err);
                if (loadingScreen) loadingScreen.style.display = "none";
                alert("Error fetching recommendations.");
            }
        });
    }

    /* ================== RESULTS PAGE ================== */
    if (projectsContainer) {
        let recommendedProjects = JSON.parse(localStorage.getItem("recommendedProjects")) || [];

        function displayProjects(projects) {
            projectsContainer.innerHTML = "";
            if (projects.length === 0) {
                projectsContainer.innerHTML = `<p class="text-center">No projects found.</p>`;
                return;
            }
            projects.forEach((proj, index) => {
                const card = document.createElement("div");
                card.className = "col-md-6 col-lg-4 mb-4";
                card.innerHTML = `
                    <div class="project-card p-3 glass-card">
                        <h5>${proj.title}</h5>
                        <p>${proj.description}</p>
                        <p><strong>Difficulty:</strong> ${proj.difficulty}</p>
                        <p><strong>Technologies:</strong> ${proj.technologies.join(", ")}</p>
                        <p><span class="badge bg-info">Score: ${proj.score || 0}</span></p>
                        <button class="btn btn-gradient btn-sm mt-2" onclick="openModal(${index})">View Details</button>
                    </div>
                `;
                projectsContainer.appendChild(card);
            });
        }

        window.openModal = function(index) {
            const proj = recommendedProjects[index];
            if (!proj) return;
            document.getElementById("modalTitle").textContent = proj.title || "";
            document.getElementById("modalDescription").textContent = proj.description || "";
            document.getElementById("modalTechnologies").textContent = proj.technologies.join(", ") || "";
            document.getElementById("modalDifficulty").textContent = proj.difficulty || "";
            document.getElementById("modalFeatures").textContent = proj.features || "No additional features listed.";
            document.getElementById("modalLearning").textContent = proj.learning || "No learning outcomes listed.";
            const projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
            projectModal.show();
        };

        // Shuffle or fetch new recommendations when clicking "Generate More Ideas"
        if (regenerateBtn) {
            regenerateBtn.addEventListener("click", async () => {
                if (loadingScreen) loadingScreen.style.display = "flex";
                try {
                    const userPrefs = JSON.parse(localStorage.getItem("userPreferences")) || {};
                    const response = await fetch("http://localhost:5001/recommend", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(userPrefs)
                    });
                    if (!response.ok) throw new Error("Failed to fetch recommendations");

                    recommendedProjects = await response.json();
                    // Shuffle array to show variety
                    recommendedProjects.sort(() => Math.random() - 0.5);
                    localStorage.setItem("recommendedProjects", JSON.stringify(recommendedProjects));
                    displayProjects(recommendedProjects);
                } catch (err) {
                    console.error(err);
                    alert("Error fetching new recommendations.");
                } finally {
                    if (loadingScreen) loadingScreen.style.display = "none";
                }
            });
        }

        // Initial load
        displayProjects(recommendedProjects);
    }

    if (loadingScreen) loadingScreen.style.display = "none";
});
