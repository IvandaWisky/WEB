const API_BASE = 'http://localhost/MIDTERMTEST/api/notes.php';

// Load notes list
function loadNotes() {
  fetch(API_BASE)
    .then(res => res.json())
    .then(notes => {
      const noteList = document.getElementById('noteList');
      noteList.innerHTML = '';
      notes.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note.title || 'Untitled';

        // Thêm nút xóa
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.onclick = (e) => {
          e.stopPropagation(); // Không trigger loadNote khi click delete
          deleteNote(note.id);
        };

        li.appendChild(deleteBtn);
        li.onclick = () => loadNote(note.id);
        noteList.appendChild(li);
      });
    });
}


// Load a single note
function loadNote(id) {
  fetch(`${API_BASE}?id=${id}`)
    .then(res => res.json())
    .then(note => {
      currentNoteId = note.id;
      document.getElementById('noteContent').value = note.content;
    });
}

// Save current note
function saveNote() {
  const content = document.getElementById('noteContent').value;

  fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: currentNoteId, content })
  }).then(() => loadNotes());
}

// Create new note
function createNewNote() {
  fetch(API_BASE, {
    method: 'PUT'
  })
    .then(res => res.json())
    .then(note => {
      currentNoteId = note.id;
      document.getElementById('noteContent').value = '';
      loadNotes();
    });
}

function deleteNote(id) {
  fetch(API_BASE + `?id=${id}`, {
    method: 'DELETE'
  }).then(() => {
    if (currentNoteId === id) {
      currentNoteId = null;
      document.getElementById('noteContent').value = '';
    }
    loadNotes();
  });
}


document.getElementById('saveBtn').addEventListener('click', saveNote);
document.getElementById('newNoteBtn').addEventListener('click', createNewNote);

loadNotes();
