const API_BASE = 'http://localhost/MIDTERMTEST/api/notes.php';
let currentNoteId = null;

// Load notes list
function loadNotes() {
  fetch(API_BASE)
    .then(res => res.json())
    .then(notes => {
      const noteList = document.getElementById('noteList');
      noteList.innerHTML = '';
      notes.forEach(note => {
        const displayTitle = note.title?.trim() || note.content?.split('\n')[0]?.substring(0, 30) || 'Untitled';
        const li = document.createElement('li');
        li.dataset.id = note.id;

        const textSpan = document.createElement('span');
        textSpan.textContent = displayTitle;
        li.appendChild(textSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
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
      document.getElementById('noteTitle').value = note.title || '';
      document.getElementById('noteContent').value = note.content || '';
      currentNoteId = note.id;
    });
}

// Save current note
function saveNote() {
  const title = document.getElementById('noteTitle').value;
  const content = document.getElementById('noteContent').value;

  if (!currentNoteId) {
    alert("Please create or select a note first.");
    return;
  }

  fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: currentNoteId, title, content })
  }).then(() => {
    loadNotes();
    loadNote(currentNoteId);
  });
}

// Create new note
function createNewNote() {
  fetch(API_BASE, {
    method: 'PUT'
  })
    .then(res => res.json())
    .then(note => {
      currentNoteId = note.id;
      document.getElementById('noteTitle').value = '';
      document.getElementById('noteContent').value = '';
      loadNotes();
      loadNote(note.id);
    });
}

// Delete a note
function deleteNote(id) {
  fetch(`${API_BASE}?id=${id}`, {
    method: 'DELETE'
  }).then(() => {
    if (currentNoteId === id) {
      currentNoteId = null;
      document.getElementById('noteTitle').value = '';
      document.getElementById('noteContent').value = '';
    }
    loadNotes();
  });
}

// Update sidebar title live
function updateListItem() {
  if (currentNoteId) {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const displayTitle = title.trim() || content.split('\n')[0]?.substring(0, 30) || 'Untitled';

    const listItem = document.querySelector(`#noteList li[data-id="${currentNoteId}"]`);
    if (listItem) {
      const textSpan = listItem.querySelector('span');
      if (textSpan) {
        textSpan.textContent = displayTitle;
      }
    }
  }
}

// Events
document.getElementById('saveBtn').addEventListener('click', saveNote);
document.getElementById('newNoteBtn').addEventListener('click', createNewNote);
document.getElementById('noteTitle').addEventListener('input', updateListItem);
document.getElementById('noteContent').addEventListener('input', updateListItem);

loadNotes();
