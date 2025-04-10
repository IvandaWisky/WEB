<?php

$notesFile = '../data/notes.json';

function loadNotes() {
    global $notesFile;
    if (!file_exists($notesFile)) {
        file_put_contents($notesFile, '[]');
    }
    return json_decode(file_get_contents($notesFile), true);
}

function saveNotes($notes) {
    global $notesFile;
    file_put_contents($notesFile, json_encode($notes, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $notes = loadNotes();

    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        foreach ($notes as $note) {
            if ($note['id'] === $id) {
                echo json_encode($note);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['error' => 'Note not found']);
        exit;
    }

    echo json_encode($notes);
}

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        exit;
    }

    $notes = loadNotes();

    foreach ($notes as &$note) {
        if ($note['id'] === $data['id']) {
            $note['content'] = $data['content'];
            $note['title'] = isset($data['title']) && trim($data['title']) !== '' ? trim($data['title']) : 'Untitled';

            saveNotes($notes);
            echo json_encode(['success' => true]);
            exit;
        }
    }

    http_response_code(404);
    echo json_encode(['error' => 'Note not found']);
}

elseif ($method === 'PUT') {
    $notes = loadNotes();
    $newNote = [
        'id' => uniqid(),
        'title' => 'Untitled',
        'content' => ''
    ];
    $notes[] = $newNote;
    saveNotes($notes);
    echo json_encode($newNote);
}

elseif ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        exit;
    }

    $id = $_GET['id'];
    $notes = loadNotes();
    $notes = array_filter($notes, fn($note) => $note['id'] !== $id);
    saveNotes(array_values($notes));
    echo json_encode(['success' => true]);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
