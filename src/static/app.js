document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Crear lista de participantes con icono de eliminar
        let participantsListHtml = '';
        if (details.participants.length > 0) {
          participantsListHtml = `<ul style="list-style-type:none;padding-left:0;">` +
            details.participants.map((p, idx) =>
              `<li style="display:flex;align-items:center;">
                <span>${p}</span>
                <button class="delete-participant-btn" title="Eliminar participante" data-activity="${encodeURIComponent(name)}" data-participant="${encodeURIComponent(p)}" style="margin-left:8px;background:none;border:none;cursor:pointer;font-size:1.1em;">🗑️</button>
              </li>`
            ).join('') +
            `</ul>`;
        } else {
          participantsListHtml = '<p class="no-participants"><em>No participants yet</em></p>';
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p><strong>Current Participants:</strong></p>
            ${participantsListHtml}
          </div>
        `;

        activitiesList.appendChild(activityCard);
      // Agregar manejador de eventos para los botones de eliminar
      activityCard.querySelectorAll('.delete-participant-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
          const activityName = decodeURIComponent(this.getAttribute('data-activity'));
          const participant = decodeURIComponent(this.getAttribute('data-participant'));
          if (confirm(`¿Eliminar a ${participant} de "${activityName}"?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?participant=${encodeURIComponent(participant)}`, { method: 'DELETE' });
              if (response.ok) {
                fetchActivities(); // Recargar actividades
              } else {
                alert('No se pudo eliminar el participante.');
              }
            } catch (err) {
              alert('Error de red al eliminar participante.');
            }
          }
        });
      });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Recargar actividades para reflejar el cambio
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
