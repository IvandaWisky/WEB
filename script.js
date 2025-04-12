
// script.js
const API_BASE = "http://localhost/MIDTERMTEST/api/notes.php";
let currentNoteId = null; // Corrected variable name typo

const noteListEl = document.getElementById("noteList");
const noteTitleEl = document.getElementById("noteTitle");
const noteContentEl = document.getElementById("noteContent");
const saveBtn = document.getElementById("saveBtn");
const newNoteBtn = document.getElementById("newNoteBtn");

// --- Helper Functions ---

function setActiveNote(id) {
  currentNoteId = id;
  // Remove active class from all items
  document
    .querySelectorAll("#noteList li")
    .forEach((item) => item.classList.remove("active-note"));
  // Add active class to the current one
  if (id) {
    const activeListItem = document.querySelector(
      `#noteList li[data-id="${id}"]`
    );
    if (activeListItem) {
      activeListItem.classList.add("active-note");
    }
  }
}

function clearEditor() {
  noteTitleEl.value = "";
  noteContentEl.value = "";
  setActiveNote(null);
}

function renderNoteList(notes) {
  noteListEl.innerHTML = ""; // Clear existing list
  notes.forEach((note) => {
    // Determine display title (first line of content or title, truncated)
    const titleTrimmed = note.title?.trim();
    const firstLineContent = note.content?.split("\n")[0]?.trim();
    let displayTitle =
      titleTrimmed || firstLineContent || "(Untitled)";
    // Simple trim if needed (CSS handles ellipsis)
    // if (displayTitle.length > 40) {
    //     displayTitle = displayTitle.substring(0, 37) + '...';
    // }

    const li = document.createElement("li");
    li.dataset.id = note.id;

    const textSpan = document.createElement("span");
    textSpan.textContent = displayTitle;
    li.appendChild(textSpan);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×"; // Use multiplication sign for delete
    deleteBtn.title = "Delete Note"; // Add tooltip
    deleteBtn.onclick = (e) => {
      e.stopPropagation(); // Prevent li click event
      if (confirm(`Are you sure you want to delete "${displayTitle}"?`)) {
        deleteNote(note.id);
      }
    };
    li.appendChild(deleteBtn);

    li.onclick = () => loadNote(note.id);

    noteListEl.appendChild(li);
  });

  // Re-apply active class if a note was selected
  if (currentNoteId) {
    setActiveNote(currentNoteId);
  }
}

// --- API Functions ---

// Load notes list
function loadNotes() {
  fetch(API_BASE)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((notes) => {
      renderNoteList(notes);
    })
    .catch((error) => {
      console.error("Error loading notes:", error);
      noteListEl.innerHTML =
        '<li style="color: #ff4d4d;">Error loading notes.</li>';
    });
}

// Load a single note into the editor
function loadNote(id) {
  fetch(`${API_BASE}?id=${id}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((note) => {
      noteTitleEl.value = note.title || "";
      noteContentEl.value = note.content || "";
      setActiveNote(note.id); // Set as active
    })
    .catch((error) => {
      console.error("Error loading note:", error);
      alert("Error loading note. It might have been deleted.");
      clearEditor();
      loadNotes(); // Refresh list
    });
}

// Save current note (Update)
function saveNote() {
  const title = noteTitleEl.value;
  const content = noteContentEl.value;

  if (!currentNoteId) {
    // This case shouldn't happen if UI is managed correctly,
    // but good as a fallback. Consider creating a new note instead?
    alert("Please select a note to save or create a new one.");
    return;
  }

  fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: currentNoteId, title, content }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((result) => {
      if (result.success) {
        console.log("Note saved successfully");
        // No need to reload the specific note, just update list item
        updateListItem(); // Update title in sidebar immediately
      } else {
        throw new Error(result.error || "Failed to save note.");
      }
    })
    .catch((error) => {
      console.error("Error saving note:", error);
      alert(`Error saving note: ${error.message}`);
    });
}

// Create new note
function createNewNote() {
  fetch(API_BASE, {
    method: "PUT",
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((newNote) => {
      noteTitleEl.value = ""; // Clear editor for the new note
      noteContentEl.value = "";
      loadNotes(); // Reload the list to include the new note
      setActiveNote(newNote.id); // Set the new note as active
      noteTitleEl.focus(); // Focus title field
    })
    .catch((error) => {
      console.error("Error creating new note:", error);
      alert("Error creating new note.");
    });
}

// Delete a note
function deleteNote(id) {
  fetch(`${API_BASE}?id=${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((result) => {
      if (result.success) {
        console.log("Note deleted successfully");
        if (currentNoteId === id) {
          clearEditor(); // Clear editor if the active note was deleted
        }
        loadNotes(); // Refresh the list
      } else {
        throw new Error(result.error || "Failed to delete note.");
      }
    })
    .catch((error) => {
      console.error("Error deleting note:", error);
      alert(`Error deleting note: ${error.message}`);
    });
}

// Update sidebar list item title live as user types in editor
function updateListItem() {
  if (currentNoteId) {
    const listItem = document.querySelector(
      `#noteList li[data-id="${currentNoteId}"]`
    );
    if (listItem) {
      const textSpan = listItem.querySelector("span");
      if (textSpan) {
        const title = noteTitleEl.value.trim();
        const content = noteContentEl.value;
        const firstLineContent = content?.split("\n")[0]?.trim();
        let displayTitle = title || firstLineContent || "(Untitled)";
        textSpan.textContent = displayTitle;
      }
    }
  }
}

// --- Event Listeners ---
saveBtn.addEventListener("click", saveNote);
newNoteBtn.addEventListener("click", createNewNote);
noteTitleEl.addEventListener("input", updateListItem);
noteContentEl.addEventListener("input", updateListItem); // Update on content change too for first line

// --- Initial Load ---
loadNotes();
