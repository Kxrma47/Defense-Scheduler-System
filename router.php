<?php
// Simple router for PHP development server
$uri = $_SERVER['REQUEST_URI'];

// Handle backend API requests
if (strpos($uri, '/backend/') === 0) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        return false; // Let the server handle it normally
    }
}

// Handle frontend requests
if (strpos($uri, '/frontend/') === 0) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        return false; // Let the server handle it normally
    }
}

// Default: serve index.html for frontend routes
if (strpos($uri, '/') === 0 && !strpos($uri, '/backend/')) {
    $file = __DIR__ . '/frontend/index.html';
    if (file_exists($file)) {
        return false; // Let the server handle it normally
    }
}

// 404 for everything else
http_response_code(404);
echo "404 Not Found";
?>
