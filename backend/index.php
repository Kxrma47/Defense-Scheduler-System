<?php
/* ==========================================================
   DEFENSE SCHEDULER API - BACKEND
   ==========================================================
   
   This file contains all API endpoints for the Defense Scheduler system.
   It serves three main consoles:
   - Manager Console: Full administrative control
   - Assistant Console: Limited administrative control  
   - Professor Console: Professor-specific functionality
   
   ==========================================================
   API ENDPOINTS DOCUMENTATION
   ==========================================================
   
   AUTHENTICATION:
   - All endpoints require authentication via Bearer token
   - Token can be provided via:
     * Authorization header: "Bearer <token>"
     * X-Auth-Token header: "<token>"
     * Query parameter: ?token=<token>
     * Cookie: authToken=<token>
   
   ROLE-BASED ACCESS:
   - manager: Full system access
   - assistant: Limited admin access (cannot manage managers)
   - professor: Professor-specific functionality only
   
   ENDPOINT CATEGORIES:
   
   1. AUTHENTICATION & USER MANAGEMENT
   =================================
   GET  /?action=whoami                    - Get current user info
   GET  /?action=users                     - List all users (Manager/Assistant)
   GET  /?action=list_users                - List users for selection
   POST /?action=create_user               - Create new user (Manager/Assistant)
   POST /?action=set_active                - Toggle user active status
   POST /?action=delete_user               - Delete user (Manager only)
   
   2. WINDOW & OFFER MANAGEMENT
   ============================
   POST /?action=create_window             - Create defense window
   GET  /?action=windows                   - List all windows
   POST /?action=update_window             - Update window details
   POST /?action=delete_window             - Delete window
   POST /?action=offer_window              - Offer window to professor
   POST /?action=update_offer              - Update window offer
   POST /?action=delete_offer              - Delete window offer
   GET  /?action=my_offers                 - Get offers (Professor: own, Admin: all)
   POST /?action=respond_offer             - Professor respond to offer
   POST /?action=finalize_offer            - Finalize accepted offer (Manager)
   GET  /?action=available_windows         - Get windows for selection
   GET  /?action=get_previous_slot_assignments - Get previous assignments
   POST /?action=prof_request_change       - Professor request window change
   
   3. DEFENSE SLOTS
   ================
   GET  /?action=slots                     - Get defense slots
   POST /?action=slots                     - Create defense slot
   
   4. PROFESSOR NOTES
   ==================
   GET  /?action=notes                     - Get professor notes
   POST /?action=save_note                 - Save professor note
   
   5. POLL MANAGEMENT
   ==================
   POST /?action=create_poll               - Create new poll
   GET  /?action=polls                     - List all polls
   GET  /?action=poll_options              - Get poll options
   GET  /?action=poll_votes                - Get poll vote count
   GET  /?action=poll_voters               - Get poll voters/non-voters
   GET  /?action=poll_results              - Get detailed poll results
   POST /?action=vote_poll                 - Vote on poll (Professor)
   POST /?action=delete_poll               - Delete poll
   POST /?action=delete_poll_option        - Delete poll option
   POST /?action=export_polls              - Export polls to Excel
   
   6. SYSTEM & UTILITY
   ===================
   GET  /?action=ping                      - Health check
   GET  /?action=test_polls                - Test polls functionality
   GET  /?action=events                    - Server-Sent Events
   GET  /?action=events_poll               - Event polling fallback
   
   RESPONSE FORMATS:
   ================
   Success: {"ok": true, "data": {...}}
   Error: {"error": "error_code", "detail": "description"}
   
   HTTP STATUS CODES:
   ==================
   200 - Success
   201 - Created
   400 - Bad Request (validation error)
   401 - Unauthorized (authentication required)
   403 - Forbidden (insufficient permissions)
   404 - Not Found
   500 - Internal Server Error
   
   ========================================================== */

// Load Composer autoloader for PhpSpreadsheet
require_once __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/* ==========================================================
   CORS & HEADERS SETUP
   ========================================================== */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, X-Auth-Token, Content-Type, X-User-Id');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* Default: JSON responses (SSE overrides later) */
header('Content-Type: application/json');

/* ==========================================================
   DATABASE CONNECTION & BOOTSTRAP
   ========================================================== */

/**
 * Establishes PostgreSQL database connection with multiple fallback strategies
 * 
 * Connection attempts are made in the following order:
 * 1. Environment variables (PGHOST, PGDATABASE, PGUSER, PGPASSWORD)
 * 2. Peer authentication via UNIX socket as current OS user
 * 3. Legacy fallback with hardcoded credentials
 * 
 * @return PDO Database connection object with optimized settings
 * @throws Exception When all connection attempts fail
 * 
 * @example
 * $pdo = pdo_connect_pg();
 * $result = $pdo->query("SELECT * FROM users")->fetchAll();
 */
function pdo_connect_pg(): PDO {
    $attempts = [];

    // 1) Environment-driven config (recommended)
    $envHost = getenv('PGHOST') ?: 'localhost';
    $envDb   = getenv('PGDATABASE') ?: 'defense';
    $envUser = getenv('PGUSER') ?: null;
    $envPass = getenv('PGPASSWORD') ?: null;

    if ($envUser) {
        $attempts[] = ["pgsql:host={$envHost};dbname={$envDb}", $envUser, $envPass];
    }

    // 2) Try peer auth via UNIX socket as current OS user (often works on macOS/Linux dev)
    $osUser = get_current_user();
    if ($osUser) {
        $attempts[] = ["pgsql:dbname={$envDb}", $osUser, null];
    }

    // 3) Legacy fallback used previously
    $attempts[] = ["pgsql:host=localhost;dbname=defense", 'moodle', 'moodle'];

    $lastErr = null;
    foreach ($attempts as [$dsn, $user, $pass]) {
        try {
            return new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_STRINGIFY_FETCHES  => false,
            ]);
        } catch (Throwable $e) {
            $lastErr = $e;
        }
    }
    http_response_code(500);
    echo json_encode(['error' => 'db_connect_failed', 'detail' => $lastErr ? $lastErr->getMessage() : 'unknown']);
    exit;
}

$pdo = pdo_connect_pg();

/* ==========================================================
   BOOTSTRAP FUNCTIONS
   ========================================================== */

/**
 * Ensures a default manager account exists in the system
 * Creates or updates the default manager based on environment variables
 * @param PDO $pdo Database connection
 */
function ensure_default_manager(PDO $pdo): void {
    $name  = getenv('DEFAULT_MANAGER_NAME')  ?: 'Default Manager';
    $email = getenv('DEFAULT_MANAGER_EMAIL') ?: 'manager@example.com';
    $token = getenv('DEFAULT_MANAGER_TOKEN') ?: 'devtoken';
    $sql = "INSERT INTO app_users (fullname, email, role, auth_token, active)
            VALUES (:n, :e, 'manager', :t, TRUE)
            ON CONFLICT (auth_token) DO UPDATE
              SET fullname = EXCLUDED.fullname,
                  email    = EXCLUDED.email,
                  role     = 'manager',
                  active   = TRUE";
    try {
        $st = $pdo->prepare($sql);
        $st->execute([':n'=>$name, ':e'=>$email, ':t'=>$token]);
    } catch (Throwable $e) {
        // non-fatal if table missing during early bootstrap
    }
}
ensure_default_manager($pdo);

/**
 * Ensures the polls-related tables exist (idempotent bootstrapping)
 * 
 * Creates or updates the following tables:
 * - polls: Main poll information with time-slot mode support
 * - poll_options: Available options for each poll
 * - poll_votes: Individual votes cast by users
 * - poll_voters: Guard table to prevent duplicate submissions
 * 
 * Also adds time-slot specific columns to polls table:
 * - mode: 'text' or 'timeslots'
 * - start_ts/end_ts: Time range for time-slot polls
 * - defense_minutes/buffer_minutes: Slot configuration
 * - breaks_count/break_minutes: Break configuration
 * - per_slot_note: Additional notes per slot
 * 
 * @param PDO $pdo Database connection
 * @return void
 * 
 * @example
 * ensure_polls_schema($pdo);
 * // Tables are now ready for poll operations
 */
function ensure_polls_schema(PDO $pdo): void {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS polls (
            id SERIAL PRIMARY KEY,
            created_by INT NULL,
            title TEXT NOT NULL,
            description TEXT NULL,
            allow_multi BOOLEAN NOT NULL DEFAULT FALSE,
            require_names BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )");
        // Extend polls with time-slot mode columns (safe / idempotent)
        try { $pdo->exec("ALTER TABLE polls ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'text'"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE polls ADD CONSTRAINT IF NOT EXISTS ck_polls_mode CHECK (mode IN ('text','timeslots'))"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE polls ADD COLUMN IF NOT EXISTS start_ts TIMESTAMPTZ"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE polls ADD COLUMN IF NOT EXISTS end_ts TIMESTAMPTZ"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE polls ADD COLUMN IF NOT EXISTS defense_minutes INT"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE polls ADD COLUMN IF NOT EXISTS buffer_minutes INT"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE polls ADD COLUMN IF NOT EXISTS breaks_count INT"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE polls ADD COLUMN IF NOT EXISTS break_minutes INT"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE polls ADD COLUMN IF NOT EXISTS per_slot_note TEXT"); } catch (Throwable $__) {}
        
        // Ensure window_offers has requested_window_id column for change requests
        try { $pdo->exec("ALTER TABLE window_offers ADD COLUMN IF NOT EXISTS requested_window_id INT"); } catch (Throwable $__) {}
        // Indexes (no-ops if they exist)
        try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_polls_mode  ON polls(mode)"); } catch (Throwable $__) {}
        try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_polls_start ON polls(start_ts)"); } catch (Throwable $__) {}
        try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_polls_end   ON polls(end_ts)"); } catch (Throwable $__) {}

        // Optional FK to app_users if table exists
        try { $pdo->exec("ALTER TABLE polls
            ADD CONSTRAINT fk_polls_creator
            FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL"); } catch (Throwable $__) {}

        $pdo->exec("CREATE TABLE IF NOT EXISTS poll_options (
            id SERIAL PRIMARY KEY,
            poll_id INT NOT NULL,
            label TEXT NOT NULL,
            ord INT NOT NULL DEFAULT 0
        )");
        try { $pdo->exec("ALTER TABLE poll_options
            ADD CONSTRAINT fk_poll_options_poll
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE"); } catch (Throwable $__) {}

        $pdo->exec("CREATE TABLE IF NOT EXISTS poll_votes (
            id SERIAL PRIMARY KEY,
            poll_id INT NOT NULL,
            option_id INT NOT NULL,
            voter_id INT NULL,
            voter_name TEXT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )");
        // Guard table: one submission per (poll, voter)
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS poll_voters (
        id SERIAL PRIMARY KEY,
        poll_id INT NOT NULL,
        voter_id INT NOT NULL,
        voter_name TEXT NULL,
        voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )");
            // FKs (idempotent)
            try { $pdo->exec("ALTER TABLE poll_voters
        ADD CONSTRAINT fk_poll_voters_poll
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE"); } catch (Throwable $__) {}
            try { $pdo->exec("ALTER TABLE poll_voters
        ADD CONSTRAINT fk_poll_voters_user
        FOREIGN KEY (voter_id) REFERENCES app_users(id) ON DELETE CASCADE"); } catch (Throwable $__) {}
            // Hard guarantee: one row per (poll, voter)
            try { $pdo->exec("CREATE UNIQUE INDEX IF NOT EXISTS uq_poll_voters ON poll_voters(poll_id, voter_id)"); } catch (Throwable $__) {}
        } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE poll_votes
            ADD CONSTRAINT fk_poll_votes_poll
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE poll_votes
            ADD CONSTRAINT fk_poll_votes_option
            FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE"); } catch (Throwable $__) {}
        try { $pdo->exec("ALTER TABLE poll_votes
            ADD CONSTRAINT fk_poll_votes_user
            FOREIGN KEY (voter_id) REFERENCES app_users(id) ON DELETE SET NULL"); } catch (Throwable $__) {}

        // Helpful indexes (idempotent)
        try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options(poll_id)"); } catch (Throwable $__) {}
        try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id)"); } catch (Throwable $__) {}
        try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_poll_votes_option ON poll_votes(option_id)"); } catch (Throwable $__) {}
    } catch (Throwable $e) {

    }
}

/* ==========================================================
   ERROR HANDLING & UTILITY FUNCTIONS
   ========================================================== */

/**
 * Global error handling configuration
 * Disables error display to clients and sets up exception/error handlers
 */
ini_set('display_errors', '0'); // don't leak notices to clients
set_exception_handler(function ($e) {
    http_response_code(500);
    echo json_encode(['error'=>'server_error','detail'=>$e->getMessage()]);
    exit;
});
set_error_handler(function(){ return false; });

/**
 * Outputs JSON response with proper headers and exits
 * 
 * Sets appropriate HTTP headers for JSON responses including:
 * - Content-Type: application/json
 * - CORS headers for cross-origin requests
 * - Cache control headers
 * - HTTP status code
 * 
 * @param mixed $data Data to output as JSON (arrays, objects, strings)
 * @param int $code HTTP status code (default: 200)
 * @return void Exits script execution
 * 
 * @example
 * out(['success' => true, 'message' => 'User created'], 201);
 * out(['error' => 'User not found'], 404);
 */
function out($data, int $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // CORS headers
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token, X-User-Id');
    
    echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Gets a header value from various sources (HTTP headers, query params, cookies)
 * 
 * Searches for header values in the following order:
 * 1. HTTP headers (e.g., Authorization, X-Auth-Token)
 * 2. Query parameters (?token=value)
 * 3. Cookies (authToken)
 * 
 * Handles case-insensitive header name matching and normalizes
 * header names by converting hyphens to underscores.
 * 
 * @param string $name Header name to retrieve (e.g., 'Authorization', 'X-Auth-Token')
 * @return string|null Header value or null if not found
 * 
 * @example
 * $token = get_header_value('Authorization'); // "Bearer abc123"
 * $userId = get_header_value('X-User-Id');    // "42"
 */
function get_header_value(string $name): ?string {
    $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    if (!empty($_SERVER[$serverKey])) return $_SERVER[$serverKey];

    if (function_exists('getallheaders')) {
        $h = getallheaders();
        if (is_array($h)) {
            foreach ($h as $k => $v) {
                if (strcasecmp($k, $name) === 0) return $v;
            }
        }
    }
    if ($name === 'Authorization' && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    return null;
}

/**
 * Extracts bearer token from various sources (Authorization header, X-Auth-Token, query param, cookie)
 * 
 * Supports multiple authentication methods for flexibility:
 * 1. Standard Authorization header: "Bearer <token>"
 * 2. X-Auth-Token header: Direct token value
 * 3. Query parameter: ?token=<value>
 * 4. Cookie: authToken cookie value
 * 
 * Also supports role-based tokens with user selection:
 * - "123" (assistant default) or "321" (professor default)
 * - "123|as=42" (assistant token acting as user ID 42)
 * - "321#as=77" (professor token acting as user ID 77)
 * 
 * @return string|null Bearer token or null if not found
 * 
 * @example
 * $token = bearer_token(); // "abc123" or "123|as=42"
 */
function bearer_token(): ?string {
    // 1) Standard Authorization header (Bearer ...)
    $auth = get_header_value('Authorization');
    if ($auth && preg_match('/^\s*Bearer\s+(.+)\s*$/i', $auth, $m)) {
        return trim($m[1]);
    }

    // 2) Alternate header for environments that strip Authorization
    $x = get_header_value('X-Auth-Token');
    if ($x && trim($x) !== '') return trim($x);

    // 3) Query param for easy local testing
    if (!empty($_GET['token'])) return trim((string)$_GET['token']);

    // 4) Cookie fallback set by frontend
    if (!empty($_COOKIE['authToken'])) return trim((string)$_COOKIE['authToken']);

    return null;
}

/**
 * Gets user ID from X-User-Id header
 * 
 * Validates that the user ID is a positive integer and returns
 * the parsed value. Used for role-based token authentication
 * to specify which user account to act as.
 * 
 * @return int|null User ID or null if invalid/not found
 * 
 * @example
 * $userId = header_user_id(); // 42 or null
 * if ($userId) {
 *     // Act as specific user
 * }
 */
function header_user_id(): ?int {
    $h = get_header_value('X-User-Id');
    if ($h === null) return null;
    if (!preg_match('/^\d+$/', $h)) return null;
    $i = (int)$h;
    return $i > 0 ? $i : null;
}

/**
 * Resolve current user.
 * Supports:
 *  - Personal tokens in app_users.auth_token
 *  - Default role tokens:
 *      assistant default = "123"
 *      professor default = "321"
 *    You can bind a concrete account as:
 *      "123|as=42" or "321|as=77"
 *    Also accepts header "X-User-Id: 42" or query "?as=42" for selection.
 */
/* ==========================================================
   AUTHENTICATION & AUTHORIZATION
   ========================================================== */

/**
 * Gets the current authenticated user from the database
 * Validates the bearer token and returns user information
 * @param PDO $pdo Database connection
 * @return array|null User data or null if not authenticated
 */
function current_user(PDO $pdo): ?array {
    $DEFAULT_ASST_TOKEN = '123';
    $DEFAULT_PROF_TOKEN = '321';

    // Get token safely
    try {
        $tok = bearer_token();
    } catch (Throwable $e) {
        return null;
    }
    if (!$tok) return null;

    $asFromToken = null;
    if (preg_match('/^(123|321)(?:[|#]as=(\d+))?$/', $tok, $m)) {
        $tokCore = $m[1];
        $asFromToken = isset($m[2]) ? (int)$m[2] : null;
    } else {
        $tokCore = $tok;
    }

    // Debug: log incoming token


    // Personal tokens (DB lookup)
    if ($tokCore !== $DEFAULT_ASST_TOKEN && $tokCore !== $DEFAULT_PROF_TOKEN) {
        try {
            $st = $pdo->prepare("SELECT id, fullname, email, role, active FROM app_users WHERE auth_token = :t");
            $st->execute([':t' => $tokCore]);
            $u = $st->fetch();
            // Debug: log SQL lookup result

            if (!$u || !$u['active']) return null;
            return $u;
        } catch (Throwable $e) {
            return null;
        }
    }

    // Default-role tokens (no DB until we need an account)
    $wantedRole = ($tokCore === $DEFAULT_ASST_TOKEN) ? 'assistant' : 'professor';

    $asId = $asFromToken;
    if ($asId === null) $asId = header_user_id();
    if ($asId === null && isset($_GET['as']) && preg_match('/^\d+$/', $_GET['as'])) $asId = (int)$_GET['as'];

    if ($asId !== null) {
        try {
            $st = $pdo->prepare("SELECT id, fullname, email, role, active FROM app_users WHERE id=:id");
            $st->execute([':id' => $asId]);
            $u = $st->fetch();
            // Debug: log SQL lookup result for default-role

            if (!$u || !$u['active'] || $u['role'] !== $wantedRole) return null;
            return $u;
        } catch (Throwable $e) {
            return null;
        }
    }

    try {
        $st = $pdo->prepare("SELECT id, fullname, email, role, active
                             FROM app_users
                             WHERE role=:r AND active=TRUE
                             ORDER BY id ASC
                             LIMIT 1");
        $st->execute([':r' => $wantedRole]);
        $u = $st->fetch();
        // Debug: log SQL lookup result for fallback

        return $u ?: null;
    } catch (Throwable $e) {
        return null;
    }
}

/**
 * Requires user to have one of the specified roles
 * Returns user data if authorized, outputs error and exits if not
 * @param PDO $pdo Database connection
 * @param array $roles Array of allowed roles
 * @return array User data
 */
function require_role(PDO $pdo, array $roles) {
    $u = current_user($pdo);
    if (!$u || !in_array($u['role'], $roles, true)) {
        out(['error' => 'unauthorized_or_forbidden', 'roles_required' => $roles], 403);
    }
    return $u;
}
/**
 * Parses JSON input from request body
 * 
 * Reads raw input from php://input and parses it as JSON.
 * Uses caching to avoid multiple reads of the same input.
 * Returns empty array if input is empty or invalid JSON.
 * 
 * @return array Parsed JSON data as associative array
 * 
 * @example
 * $data = json_input();
 * $name = $data['name'] ?? '';
 * $email = $data['email'] ?? '';
 */
function json_input(): array {
    static $cached = null;
    if ($cached !== null) return $cached;
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') { $cached = []; return $cached; }
    $d = json_decode($raw, true);
    $cached = is_array($d) ? $d : [];
    return $cached;
}
/**
 * Converts various boolean representations to boolean
 * 
 * Handles multiple boolean representations:
 * - Native boolean: true/false
 * - Integers: 0 = false, non-zero = true
 * - Floats: 0.0 = false, non-zero = true
 * - Strings: '1', 'true', 't', 'yes', 'y', 'on' = true
 * - Other values: false
 * 
 * Case-insensitive string matching for boolean strings.
 * 
 * @param mixed $v Value to convert to boolean
 * @return bool Boolean value
 * 
 * @example
 * read_bool('true')   // true
 * read_bool('yes')    // true
 * read_bool('1')      // true
 * read_bool('false')  // false
 * read_bool('0')      // false
 * read_bool('')       // false
 */
function read_bool($v): bool {
    if (is_bool($v)) return $v;
    if (is_int($v)) return $v !== 0;
    if (is_float($v)) return (int)$v !== 0;
    if (is_string($v)) {
        $s = strtolower(trim($v));
        return in_array($s, ['1','true','t','yes','y','on'], true);
    }
    return false;
}

/**
 * Generates time slots for a given window based on defense and buffer minutes
 * 
 * Creates a series of time slots within a window's time range.
 * Each slot consists of defense time followed by buffer time.
 * Slots are generated sequentially without gaps.
 * 
 * @param array $window Window data containing:
 *                      - start_ts: Window start timestamp
 *                      - end_ts: Window end timestamp
 *                      - defense_minutes: Duration of defense (default: 20)
 *                      - buffer_minutes: Buffer time between defenses (default: 5)
 * @return array Array of time slots with:
 *               - index: Slot index (0-based)
 *               - start_ts: Slot start timestamp
 *               - end_ts: Slot end timestamp
 * 
 * @example
 * $window = [
 *     'start_ts' => '2025-01-15 09:00:00',
 *     'end_ts' => '2025-01-15 17:00:00',
 *     'defense_minutes' => 20,
 *     'buffer_minutes' => 5
 * ];
 * $slots = generateWindowSlots($window);
 * // Returns array of 25-minute slots (20min defense + 5min buffer)
 */
function generateWindowSlots(array $window): array {
    try {
        // Validate required fields
        if (!isset($window['start_ts']) || !isset($window['end_ts'])) {
            return [];
        }
        
        $slots = [];
        $start = new DateTime($window['start_ts']);
        $end = new DateTime($window['end_ts']);
        $defenseMinutes = (int)($window['defense_minutes'] ?? 20);
        $bufferMinutes = (int)($window['buffer_minutes'] ?? 5);
        $strideMinutes = $defenseMinutes + $bufferMinutes;
        
        if ($strideMinutes <= 0) {
            return [];
        }
        
        $current = clone $start;
        $slotIndex = 0;
        
        while ($current < $end) {
            $slotStart = clone $current;
            $slotEnd = clone $current;
            $slotEnd->modify("+{$defenseMinutes} minutes");
            
            $slots[] = [
                'index' => $slotIndex,
                'start_ts' => $slotStart->format('Y-m-d H:i:sP'),
                'end_ts' => $slotEnd->format('Y-m-d H:i:sP')
            ];
            
            $current->modify("+{$strideMinutes} minutes");
            $slotIndex++;
        }
        
        return $slots;
    } catch (Exception $e) {
        return [];
    }
}

/* ==========================================================
   EXCEL EXPORT FUNCTIONS
   ========================================================== */

/**
 * Generates Excel data for polls export
 * @param PDO $pdo Database connection
 * @param array $polls Array of poll data
 * @return array Excel data structure
 */
/**
 * Generates Excel data structure for poll export
 * Creates organized data with poll info, options, votes, and voter details
 * 
 * @param PDO $pdo Database connection
 * @param array $polls Array of poll data from database
 * @return array Structured data for Excel generation
 */
function generatePollExcelData(PDO $pdo, array $polls): array {
    $excelData = [];
    
    foreach ($polls as $poll) {
        // Get poll options with LIMIT to prevent memory issues
        $optionsStmt = $pdo->prepare("
            SELECT id, label, ord 
            FROM poll_options 
            WHERE poll_id = :poll_id 
            ORDER BY ord ASC, id ASC
            LIMIT 100
        ");
        $optionsStmt->execute([':poll_id' => $poll['id']]);
        $options = $optionsStmt->fetchAll();
        
        // Get votes count only (not all vote data) to save memory
        $votesCountStmt = $pdo->prepare("
            SELECT v.option_id, COUNT(*) as vote_count
            FROM poll_votes v
            WHERE v.poll_id = :poll_id
            GROUP BY v.option_id
        ");
        $votesCountStmt->execute([':poll_id' => $poll['id']]);
        $votesCount = $votesCountStmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Calculate total votes for percentage calculation
        $totalVotes = array_sum($votesCount);
        
        // Create simplified poll data structure
        $pollData = [
            'poll_info' => [
                'title' => $poll['title'],
                'description' => $poll['description'] ?: 'N/A',
                'author' => $poll['author'] ?: 'Unknown',
                'created_at' => $poll['created_at'],
                'mode' => $poll['mode'],
                'allow_multi' => $poll['allow_multi'] ? 'Yes' : 'No',
                'require_names' => $poll['require_names'] ? 'Yes' : 'No',
                'start_ts' => $poll['start_ts'] ?: 'N/A',
                'end_ts' => $poll['end_ts'] ?: 'N/A',
                'defense_minutes' => $poll['defense_minutes'] ?: 'N/A',
                'buffer_minutes' => $poll['buffer_minutes'] ?: 'N/A',
                'breaks_count' => $poll['breaks_count'] ?: 'N/A',
                'break_minutes' => $poll['break_minutes'] ?: 'N/A',
                'per_slot_note' => $poll['per_slot_note'] ?: 'N/A'
            ],
            'options' => [],
            'total_votes' => $totalVotes,
            'votes_count' => $votesCount
        ];
        
        // Add options with vote counts only
        foreach ($options as $option) {
            $voteCount = $votesCount[$option['id']] ?? 0;
            $votePercentage = $totalVotes > 0 ? round(($voteCount / $totalVotes) * 100, 1) : 0;
            
            $pollData['options'][] = [
                'label' => $option['label'],
                'votes' => $voteCount,
                'percentage' => $votePercentage
            ];
        }
        
        // Sanitize sheet name (Excel has restrictions)
        $sheetName = preg_replace('/[\[\]*\/\\?:]/', '_', $poll['title']);
        $sheetName = substr($sheetName, 0, 25); // Leave room for ID
        $sheetName = trim($sheetName); // Remove trailing spaces
        $sheetName = $sheetName . '_' . $poll['id']; // Make unique with poll ID
        $sheetName = substr($sheetName, 0, 31); // Excel sheet name limit
        
        $excelData[] = [
            'sheet_name' => $sheetName,
            'poll_data' => $pollData
        ];
        
        // Free memory after each poll
        unset($options, $votesCount);
    }
    
    return $excelData;
}

/**
 * Outputs Excel file content using PhpSpreadsheet
 * Creates multi-sheet Excel file with poll information, voting matrix, and visual charts
 * 
 * @param array $excelData Structured data from generatePollExcelData
 * @throws Exception If Excel generation fails
 */
function outputExcelFile(array $excelData): void {
    try {
        // Create new Spreadsheet object
        $spreadsheet = new Spreadsheet();
        
        // Remove default sheet
        $spreadsheet->removeSheetByIndex(0);
        
        foreach ($excelData as $index => $sheetData) {
            // Create new worksheet
            $worksheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sheetData['sheet_name']);
            $spreadsheet->addSheet($worksheet, $index);
            
            $pollData = $sheetData['poll_data'];
            $row = 1;
            
            // Poll Information Section
            $worksheet->setCellValue('A' . $row, 'Poll Information');
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $worksheet->setCellValue('A' . $row, 'Title:');
            $worksheet->setCellValue('B' . $row, $pollData['poll_info']['title']);
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $worksheet->setCellValue('A' . $row, 'Description:');
            $worksheet->setCellValue('B' . $row, $pollData['poll_info']['description']);
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $worksheet->setCellValue('A' . $row, 'Author:');
            $worksheet->setCellValue('B' . $row, $pollData['poll_info']['author']);
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $worksheet->setCellValue('A' . $row, 'Created:');
            $worksheet->setCellValue('B' . $row, $pollData['poll_info']['created_at']);
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $worksheet->setCellValue('A' . $row, 'Mode:');
            $worksheet->setCellValue('B' . $row, $pollData['poll_info']['mode']);
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $worksheet->setCellValue('A' . $row, 'Allow Multiple:');
            $worksheet->setCellValue('B' . $row, $pollData['poll_info']['allow_multi']);
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            $worksheet->setCellValue('A' . $row, 'Require Names:');
            $worksheet->setCellValue('B' . $row, $pollData['poll_info']['require_names']);
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            // Time Slot Information (if applicable)
            if ($pollData['poll_info']['mode'] === 'timeslots') {
                $row++;
                $worksheet->setCellValue('A' . $row, 'Time Slot Information');
                $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $worksheet->setCellValue('A' . $row, 'Start Time:');
                $worksheet->setCellValue('B' . $row, $pollData['poll_info']['start_ts']);
                $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $worksheet->setCellValue('A' . $row, 'End Time:');
                $worksheet->setCellValue('B' . $row, $pollData['poll_info']['end_ts']);
                $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $worksheet->setCellValue('A' . $row, 'Defense Minutes:');
                $worksheet->setCellValue('B' . $row, $pollData['poll_info']['defense_minutes']);
                $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $worksheet->setCellValue('A' . $row, 'Buffer Minutes:');
                $worksheet->setCellValue('B' . $row, $pollData['poll_info']['buffer_minutes']);
                $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $worksheet->setCellValue('A' . $row, 'Breaks Count:');
                $worksheet->setCellValue('B' . $row, $pollData['poll_info']['breaks_count']);
                $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $worksheet->setCellValue('A' . $row, 'Break Minutes:');
                $worksheet->setCellValue('B' . $row, $pollData['poll_info']['break_minutes']);
                $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $worksheet->setCellValue('A' . $row, 'Per Slot Note:');
                $worksheet->setCellValue('B' . $row, $pollData['poll_info']['per_slot_note']);
                $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
            }
            
            // Voting Summary Section (simplified to save memory)
            $row++;
            $worksheet->setCellValue('A' . $row, 'Voting Summary');
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            // Add a note about the simplified export
            $worksheet->setCellValue('A' . $row, 'Note: This export shows vote counts only. For detailed voting matrix, use individual poll export.');
            $worksheet->getStyle('A' . $row)->getFont()->setItalic(true);
            $row++;
            
            // Summary Section
            $row++;
            $worksheet->setCellValue('A' . $row, 'Vote Summary');
            $worksheet->getStyle('A' . $row)->getFont()->setBold(true);
            $row++;
            
            // Headers for summary table
            $worksheet->setCellValue('A' . $row, 'Option');
            $worksheet->setCellValue('B' . $row, 'Votes');
            $worksheet->setCellValue('C' . $row, 'Percentage');
            $worksheet->getStyle('A' . $row . ':C' . $row)->getFont()->setBold(true);
            $row++;
            
            // Add options summary
            foreach ($pollData['options'] as $option) {
                $worksheet->setCellValue('A' . $row, $option['label']);
                $worksheet->setCellValue('B' . $row, $option['votes']);
                $worksheet->setCellValue('C' . $row, $option['percentage'] . '%');
                $row++;
            }
            
            // Total row
            $worksheet->setCellValue('A' . $row, 'Total');
            $worksheet->setCellValue('B' . $row, $pollData['total_votes']);
            $worksheet->setCellValue('C' . $row, '100%');
            $worksheet->getStyle('A' . $row . ':C' . $row)->getFont()->setBold(true);
            
            // Auto-size columns (dynamic based on number of options)
            $maxColIndex = count($pollData['options']) + 1; // +1 for the "Professor" column
            foreach (range(1, $maxColIndex) as $colIndex) {
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
                $worksheet->getColumnDimension($col)->setAutoSize(true);
            }
            
            
        }
        
        // Create Excel writer and save to output stream
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        
        // Clean up memory
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet, $writer);
        
    } catch (Exception $e) {
        // Clean up on error too
        if (isset($spreadsheet)) {
            $spreadsheet->disconnectWorksheets();
            unset($spreadsheet);
        }
        throw new Exception('Failed to generate Excel file: ' . $e->getMessage());
    }
}

/* ==========================================================
   ROUTING & ENDPOINT HANDLING
   ========================================================== */

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? null;

/* ==========================================================
   PUBLIC ENDPOINTS (No Authentication Required)
   ========================================================== */

// CORS preflight requests
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token, X-User-Id');
    header('Access-Control-Max-Age: 86400');
    exit;
}

// Health check endpoint
if ($action === 'ping') out(['ok'=>true,'ts'=>date('c')]);

// Test polls endpoint
if ($action === 'test_polls' && $method === 'GET') {
    $u = require_role($pdo, ['manager','assistant']);
    
    try {
        // Check if polls table exists
        $tableExists = $pdo->query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'polls')")->fetchColumn();
        
        if (!$tableExists) {
            out(['error'=>'polls_table_not_found', 'message'=>'Polls table does not exist'], 404);
            return;
        }
        
        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM polls");
        $count = $countStmt->fetchColumn();
        
        $sampleStmt = $pdo->query("SELECT id, title FROM polls ORDER BY id DESC LIMIT 5");
        $samples = $sampleStmt->fetchAll();
        
        // Check related tables
        $pollOptionsExists = $pdo->query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'poll_options')")->fetchColumn();
        $pollVotesExists = $pdo->query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'poll_votes')")->fetchColumn();
        
        out([
            'poll_count' => $count,
            'sample_polls' => $samples,
            'tables_exist' => [
                'polls' => $tableExists,
                'poll_options' => $pollOptionsExists,
                'poll_votes' => $pollVotesExists
            ],
            'message' => 'Polls table is accessible'
        ]);
    } catch (Throwable $e) {
        out(['error'=>'test_failed', 'detail'=>$e->getMessage()], 500);
    }
}

/**
 * Authentication endpoint - returns current user info
 * 
 * GET /?action=whoami
 * 
 * Validates the provided authentication token and returns
 * information about the currently authenticated user.
 * 
 * Authentication: Required (Bearer token)
 * Roles: All (manager, assistant, professor)
 * 
 * Request Headers:
 * - Authorization: Bearer <token> (optional)
 * - X-Auth-Token: <token> (optional)
 * 
 * Query Parameters:
 * - token: <token> (optional)
 * 
 * Response (200):
 * {
 *   "user": {
 *     "id": 42,
 *     "fullname": "Dr. John Doe",
 *     "email": "john.doe@university.edu",
 *     "role": "professor",
 *     "active": true
 *   }
 * }
 * 
 * Response (401):
 * {
 *   "error": "unauthorized",
 *   "hint": "Send Authorization: Bearer <token> or X-Auth-Token header"
 * }
 */
if ($action === 'whoami') {
    $tok = null;
    try { $tok = bearer_token(); } catch (Throwable $e) { $tok = null; }
    if (!$tok) out(['error'=>'unauthorized','hint'=>'Send Authorization: Bearer <token> (e.g. devtoken) or X-Auth-Token header, or ?token=devtoken'], 401);

    $u = current_user($pdo);
    if (!$u) out(['error'=>'unauthorized','hint'=>'Token not recognized or account inactive (check DB grants for the connecting role)'], 401);
    out(['user'=>$u]);
}

/* ==========================================================
   EVENT STREAMING ENDPOINTS
   ========================================================== */

// Lightweight event polling (for browsers that don't support SSE)
if ($action === 'events_poll' && $method === 'GET') {
    out(['events'=>[], 'since'=> (int)($_GET['since'] ?? 0)]);
}
// Server-Sent Events endpoint (for real-time updates)
if ($action === 'events' && $method === 'GET') {
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    echo "event: ping\n";
    echo "data: {}\n\n";
    @ob_flush(); @flush();
    exit;
}

/* ==========================================================
   USER MANAGEMENT ENDPOINTS
   ==========================================================
   
   MANAGER & ASSISTANT CONSOLE FUNCTIONALITY
   ========================================================== */

/**
 * Get all users (Manager/Assistant only)
 * 
 * GET /?action=users
 * 
 * Retrieves a list of all users in the system with their
 * basic information and status.
 * 
 * Authentication: Required (Bearer token)
 * Roles: manager, assistant
 * 
 * Response (200):
 * [
 *   {
 *     "id": 1,
 *     "fullname": "Admin User",
 *     "email": "admin@university.edu",
 *     "role": "manager",
 *     "active": true,
 *     "created_at": "2025-01-01T00:00:00Z",
 *     "no": 1
 *   },
 *   {
 *     "id": 2,
 *     "fullname": "Dr. Jane Smith",
 *     "email": "jane.smith@university.edu",
 *     "role": "professor",
 *     "active": true,
 *     "created_at": "2025-01-02T00:00:00Z",
 *     "no": 2
 *   }
 * ]
 * 
 * Response (403):
 * {
 *   "error": "unauthorized_or_forbidden",
 *   "roles_required": ["manager", "assistant"]
 * }
 */
if ($action === 'users' && $method === 'GET') {
    require_role($pdo, ['manager','assistant']);
    $rows = $pdo->query("
        SELECT id, fullname, email, role, active, created_at,
               ROW_NUMBER() OVER (ORDER BY id) AS no
        FROM app_users
        ORDER BY id
    ")->fetchAll();
    out($rows);
}

// Get list of users for selection (all authenticated users)
if ($action === 'list_users' && $method === 'GET') {
    $u = current_user($pdo);
    if (!$u) out(['error'=>'unauthorized'], 401);
    $rows = $pdo->query("
        SELECT id, fullname, role, active,
               ROW_NUMBER() OVER (ORDER BY id) AS no
        FROM app_users
        ORDER BY fullname ASC, id ASC
    ")->fetchAll();
    out($rows);
}

/**
 * Create new user (Manager/Assistant only)
 * 
 * POST /?action=create_user
 * 
 * Creates a new user account in the system. The role that can be
 * created depends on the current user's role:
 * - Manager: Can create professors and assistants
 * - Assistant: Can only create professors
 * 
 * Authentication: Required (Bearer token)
 * Roles: manager, assistant
 * 
 * Request Body (JSON):
 * {
 *   "fullname": "Dr. John Doe",     // Required
 *   "email": "john.doe@university.edu",  // Optional
 *   "role": "professor"             // Required: "professor" or "assistant"
 * }
 * 
 * Response (200):
 * {
 *   "ok": true,
 *   "id": 42,
 *   "auth_token": "a1b2c3d4e5f6..."
 * }
 * 
 * Response (400):
 * {
 *   "error": "fullname required; role must be professor|assistant"
 * }
 * 
 * Response (403):
 * {
 *   "error": "unauthorized_or_forbidden",
 *   "roles_required": ["manager", "assistant"]
 * }
 */
if ($action === 'create_user' && $method === 'POST') {
    $me = require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $fullname = trim($in['fullname'] ?? '');
    $email    = trim($in['email'] ?? '');
    $role     = $in['role'] ?? '';

    $allowed = ($me['role']==='assistant') ? ['professor'] : ['professor','assistant'];
    if ($fullname === '' || !in_array($role, $allowed, true)) {
        out(['error'=>'fullname required; role must be '.implode('|',$allowed)], 400);
    }

    $token = bin2hex(random_bytes(16));
    $st = $pdo->prepare("INSERT INTO app_users(fullname,email,role,auth_token)
                         VALUES(:f,:e,:r,:t) RETURNING id,auth_token");
    $st->execute([':f'=>$fullname, ':e'=>$email ?: null, ':r'=>$role, ':t'=>$token]);
    $row = $st->fetch();
    out(['ok'=>true] + $row);
}

// Set user active/inactive status (Manager/Assistant only)
if ($action === 'set_active' && $method === 'POST') {
    $me = require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $id = (int)($in['id'] ?? 0);
    $active = read_bool($in['active'] ?? false);

    if ($id<=0) out(['error'=>'valid id required'],400);
    $st = $pdo->prepare("SELECT id, role FROM app_users WHERE id=:id");
    $st->execute([':id'=>$id]);
    $target = $st->fetch();
    if (!$target) out(['error'=>'user not found'],404);

    if ($target['id'] === $me['id']) out(['error'=>'cannot change active state for self'],403);
    if ($me['role'] === 'assistant' && $target['role'] !== 'professor') out(['error'=>'assistants can only change professors'],403);
    if ($me['role'] === 'manager' && $target['role'] === 'manager') out(['error'=>'cannot change active state for manager'],403);

    $st = $pdo->prepare("UPDATE app_users SET active=:a WHERE id=:id");
    $st->bindValue(':a', $active, PDO::PARAM_BOOL);
    $st->bindValue(':id', $id, PDO::PARAM_INT);
    $st->execute();
    out(['ok'=>true]);
}

// Delete user (Manager only)
if ($action === 'delete_user' && $method === 'POST') {
    $me = require_role($pdo, ['manager']);
    $in = json_input();
    $id = (int)($in['id'] ?? 0);
    if ($id<=0) out(['error'=>'valid id required'],400);

    $st = $pdo->prepare("SELECT id, role FROM app_users WHERE id=:id");
    $st->execute([':id'=>$id]);
    $target = $st->fetch();
    if (!$target) out(['error'=>'user not found'],404);
    if ($target['id'] === $me['id']) out(['error'=>'cannot delete self'],403);
    if ($target['role'] === 'manager') out(['error'=>'cannot delete a manager'],403);

    $pdo->beginTransaction();
    try {
        if ($target['role'] === 'professor') {
            $pdo->prepare("DELETE FROM professor_notes WHERE professor_id=:id")->execute([':id'=>$id]);
            $pdo->prepare("DELETE FROM window_offers WHERE professor_id=:id")->execute([':id'=>$id]);
            $pdo->prepare("DELETE FROM defense_slots WHERE userid=:id")->execute([':id'=>$id]);
        }
        $pdo->prepare("DELETE FROM app_users WHERE id=:id")->execute([':id'=>$id]);
        // optional: reset sequence
        $pdo->exec("SELECT setval('app_users_id_seq', COALESCE((SELECT MAX(id) FROM app_users), 1), true)");
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    out(['ok'=>true]);
}

/* ==========================================================
   WINDOW & OFFER MANAGEMENT ENDPOINTS
   ==========================================================
   
   MANAGER & ASSISTANT CONSOLE FUNCTIONALITY
   ========================================================== */

/**
 * Create new defense window (Manager/Assistant only)
 * 
 * POST /?action=create_window
 * 
 * Creates a new defense window with specified time range and
 * slot configuration. The window will be used to schedule
 * defense sessions with professors.
 * 
 * Authentication: Required (Bearer token)
 * Roles: manager, assistant
 * 
 * Request Body (JSON):
 * {
 *   "title": "Defense Window for September 5th",  // Required
 *   "start_ts": "2025-09-05T09:00:00Z",          // Required: ISO 8601 timestamp
 *   "end_ts": "2025-09-05T17:00:00Z",            // Required: ISO 8601 timestamp
 *   "defense_minutes": 20,                        // Required: > 0
 *   "buffer_minutes": 5                           // Required: >= 0
 * }
 * 
 * Response (200):
 * {
 *   "ok": true,
 *   "id": 42
 * }
 * 
 * Response (400):
 * {
 *   "error": "title required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "start_ts,end_ts,defense_minutes>0,buffer_minutes>=0 required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "end_ts must be after start_ts"
 * }
 * 
 * Response (403):
 * {
 *   "error": "unauthorized_or_forbidden",
 *   "roles_required": ["manager", "assistant"]
 * }
 */
if ($action === 'create_window' && $method === 'POST') {
    $mgr = require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $title = trim($in['title'] ?? '');
    $start = $in['start_ts'] ?? '';
    $end   = $in['end_ts'] ?? '';
    $defm  = (int)($in['defense_minutes'] ?? 0);
    $bufm  = (int)($in['buffer_minutes'] ?? 0);

    if ($title === '') out(['error'=>'title required'],400);
    if (!$start || !$end || $defm<=0 || $bufm<0) out(['error'=>'start_ts,end_ts,defense_minutes>0,buffer_minutes>=0 required'],400);
    if (strtotime($end) <= strtotime($start)) out(['error'=>'end_ts must be after start_ts'],400);

    $st = $pdo->prepare("INSERT INTO manager_windows(created_by,title,start_ts,end_ts,defense_minutes,buffer_minutes)
                         VALUES(:cb,:t,:s,:e,:dm,:bm) RETURNING id");
    $st->execute([':cb'=>$mgr['id'],':t'=>$title,':s'=>$start,':e'=>$end,':dm'=>$defm,':bm'=>$bufm]);
    out(['ok'=>true,'id'=>$st->fetchColumn()]);
}

// Get all defense windows (Manager/Assistant only)
if ($action === 'windows' && $method === 'GET') {
    require_role($pdo, ['manager','assistant']);
    $rows = $pdo->query("
        SELECT *,
               ROW_NUMBER() OVER (ORDER BY id DESC) AS no
        FROM manager_windows
        ORDER BY id DESC
    ")->fetchAll();
    out($rows);
}

// Update defense window (Manager/Assistant only)
if ($action === 'update_window' && $method === 'POST') {
    require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $id = (int)($in['id'] ?? 0);
    if ($id<=0) out(['error'=>'id required'],400);

    $st = $pdo->prepare("SELECT * FROM manager_windows WHERE id=:id");
    $st->execute([':id'=>$id]);
    $w = $st->fetch();
    if (!$w) out(['error'=>'window not found'],404);



    $title = array_key_exists('title',$in) ? trim((string)$in['title']) : $w['title'];
    $start = array_key_exists('start_ts',$in) ? (string)$in['start_ts'] : $w['start_ts'];
    $end   = array_key_exists('end_ts',$in)   ? (string)$in['end_ts']   : $w['end_ts'];
    $defm  = array_key_exists('defense_minutes',$in) ? (int)$in['defense_minutes'] : (int)$w['defense_minutes'];
    $bufm  = array_key_exists('buffer_minutes',$in)  ? (int)$in['buffer_minutes']  : (int)$w['buffer_minutes'];

    if ($title === '') out(['error'=>'title required'],400);
    if (!$start || !$end || $defm<=0 || $bufm<0) out(['error'=>'start_ts,end_ts,defense_minutes>0,buffer_minutes>=0 required'],400);
    if (strtotime($end) <= strtotime($start)) out(['error'=>'end_ts must be after start_ts'],400);

    // Check if window parameters have changed significantly
    $parametersChanged = ($title !== $w['title'] || 
                         $start !== $w['start_ts'] || 
                         $end !== $w['end_ts'] || 
                         $defm !== (int)$w['defense_minutes'] || 
                         $bufm !== (int)$w['buffer_minutes']);

    $pdo->beginTransaction();
    try {
        // Update the window
        $up = $pdo->prepare("UPDATE manager_windows
                             SET title=:t, start_ts=:s, end_ts=:e, defense_minutes=:dm, buffer_minutes=:bm
                             WHERE id=:id");
        $up->execute([':t'=>$title, ':s'=>$start, ':e'=>$end, ':dm'=>$defm, ':bm'=>$bufm, ':id'=>$id]);

        // If parameters changed, delete all related offers and slots
        if ($parametersChanged) {
            // Count offers that will be deleted for the response
            $offerCountStmt = $pdo->prepare("SELECT COUNT(*) FROM window_offers WHERE window_id=:id");
            $offerCountStmt->execute([':id'=>$id]);
            $offersDeleted = (int)$offerCountStmt->fetchColumn();

            // Delete defense slots for this window
            $pdo->prepare("DELETE FROM defense_slots WHERE window_id=:id")->execute([':id'=>$id]);
            
            // Delete offer slots for this window (cascade from window_offers)
            $pdo->prepare("DELETE FROM offer_slots WHERE offer_id IN (SELECT id FROM window_offers WHERE window_id=:id)")->execute([':id'=>$id]);
            
            // Delete window offers for this window
            $pdo->prepare("DELETE FROM window_offers WHERE window_id=:id")->execute([':id'=>$id]);

            $pdo->commit();
            out(['ok'=>true, 'offers_deleted'=>$offersDeleted, 'message'=>'Window updated and related offers deleted due to parameter changes']);
        } else {
            $pdo->commit();
            out(['ok'=>true, 'message'=>'Window updated (no parameter changes detected)']);
        }
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// Delete defense window (Manager/Assistant only)
if ($action === 'delete_window' && $method === 'POST') {
    require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $id = (int)($in['id'] ?? 0);
    if ($id<=0) out(['error'=>'id required'],400);

    $st = $pdo->prepare("SELECT id FROM manager_windows WHERE id=:id");
    $st->execute([':id'=>$id]);
    if (!$st->fetchColumn()) out(['error'=>'window not found'],404);

    $pdo->beginTransaction();
    try {
        $pdo->prepare("DELETE FROM defense_slots WHERE window_id=:id")->execute([':id'=>$id]);
        $pdo->prepare("DELETE FROM window_offers WHERE window_id=:id")->execute([':id'=>$id]);
        $pdo->prepare("DELETE FROM manager_windows WHERE id=:id")->execute([':id'=>$id]);
        $pdo->commit();
        out(['ok'=>true]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/**
 * Offer window to professor (Manager/Assistant only)
 * 
 * POST /?action=offer_window
 * 
 * Creates or updates a window offer for a specific professor.
 * The offer can include selected time slots from the window.
 * If an offer already exists for this professor-window combination,
 * it will be updated instead of creating a new one.
 * 
 * Authentication: Required (Bearer token)
 * Roles: manager, assistant
 * 
 * Request Body (JSON):
 * {
 *   "window_id": 42,                    // Required: Valid window ID
 *   "professor_id": 15,                 // Required: Valid professor ID
 *   "comment": "Please review this offer",  // Optional: Additional notes
 *   "selected_slots": [0, 1, 3, 5]      // Optional: Array of slot indices to offer
 * }
 * 
 * Response (200):
 * {
 *   "ok": true,
 *   "offer_id": 123,
 *   "slots_selected": 4
 * }
 * 
 * Response (400):
 * {
 *   "error": "window_id required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "professor_id required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "invalid window_id"
 * }
 * 
 * Response (400):
 * {
 *   "error": "invalid professor_id"
 * }
 * 
 * Response (400):
 * {
 *   "error": "offer_failed",
 *   "detail": "Database error message"
 * }
 * 
 * Response (403):
 * {
 *   "error": "unauthorized_or_forbidden",
 *   "roles_required": ["manager", "assistant"]
 * }
 */
if ($action === 'offer_window' && $method === 'POST') {
    require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $win = (int)($in['window_id'] ?? 0);
    $comment = trim($in['comment'] ?? '');
    $professorId = (int)($in['professor_id'] ?? 0);
    $selectedSlots = $in['selected_slots'] ?? [];

    if ($win<=0) out(['error'=>'window_id required'],400);
    if ($professorId<=0) out(['error'=>'professor_id required'],400);

    // Validate window exists
    $st = $pdo->prepare("SELECT * FROM manager_windows WHERE id=:id");
    $st->execute([':id'=>$win]);
    $window = $st->fetch();
    if(!$window) out(['error'=>'invalid window_id'],400);

    // Validate professor exists and is active
    $chk = $pdo->prepare("SELECT 1 FROM app_users WHERE id=:id AND role='professor' AND active=TRUE");
    $chk->execute([':id'=>$professorId]);
    if(!$chk->fetchColumn()) out(['error'=>'invalid professor_id'],400);

    // Check if offer already exists
    $existing = $pdo->prepare("SELECT id FROM window_offers WHERE window_id=:w AND professor_id=:p");
    $existing->execute([':w'=>$win, ':p'=>$professorId]);
    $existingOffer = $existing->fetch();

    $pdo->beginTransaction();
    try {
        $offerId = null;
        
        if ($existingOffer) {
            // Update existing offer
            $update = $pdo->prepare("UPDATE window_offers SET comment=:c, status='offered', updated_at=NOW() WHERE id=:id");
            $update->execute([':c'=>$comment ?: null, ':id'=>$existingOffer['id']]);
            $offerId = $existingOffer['id'];
            
            // Clear existing slot selections
            $clear = $pdo->prepare("DELETE FROM offer_slots WHERE offer_id=:id");
            $clear->execute([':id'=>$offerId]);
        } else {
            // Create new offer
            $ins = $pdo->prepare("INSERT INTO window_offers(window_id,professor_id,status,comment) VALUES(:w,:p,'offered',:c) RETURNING id");
            $ins->execute([':w'=>$win, ':p'=>$professorId, ':c'=>$comment ?: null]);
            $offerId = (int)$ins->fetchColumn();
        }

        // Insert slot selections
        if (!empty($selectedSlots)) {
            $slots = generateWindowSlots($window);
            $slotIns = $pdo->prepare("INSERT INTO offer_slots(offer_id, slot_index, slot_start_ts, slot_end_ts, is_selected) VALUES(:oid, :idx, :start, :end, :selected)");
            
            foreach ($slots as $index => $slot) {
                $isSelected = in_array($index, $selectedSlots);
                $slotIns->bindValue(':oid', $offerId, PDO::PARAM_INT);
                $slotIns->bindValue(':idx', $index, PDO::PARAM_INT);
                $slotIns->bindValue(':start', $slot['start_ts'], PDO::PARAM_STR);
                $slotIns->bindValue(':end', $slot['end_ts'], PDO::PARAM_STR);
                $slotIns->bindValue(':selected', $isSelected, PDO::PARAM_BOOL);
                $slotIns->execute();
            }
        }

        $pdo->commit();
        out(['ok'=>true, 'offer_id'=>$offerId, 'slots_selected'=>count($selectedSlots)]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();

        out(['error'=>'offer_failed', 'detail'=>$e->getMessage()], 400);
    }
}

// Update window offer (Manager/Assistant only)
if ($action === 'update_offer' && $method === 'POST') {
    require_role($pdo, ['manager','assistant']);
    $in = json_input();
    

    
    $id = (int)($in['id'] ?? 0);
    if ($id<=0) out(['error'=>'id required'],400);

    $st = $pdo->prepare("SELECT * FROM window_offers WHERE id=:id");
    $st->execute([':id'=>$id]); $o = $st->fetch();
    if (!$o) out(['error'=>'offer not found'],404);

    $prof_id = array_key_exists('professor_id',$in) ? (int)$in['professor_id'] : (int)$o['professor_id'];
    $win_id  = array_key_exists('window_id',$in)    ? (int)$in['window_id']    : (int)$o['window_id'];
    $comment = array_key_exists('comment',$in)      ? (trim($in['comment']) ?: null) : $o['comment'];
    $selectedSlots = $in['selected_slots'] ?? [];
    


    $st=$pdo->prepare("SELECT 1 FROM app_users WHERE id=:id AND role='professor' AND active=TRUE");
    $st->execute([':id'=>$prof_id]);
    if(!$st->fetchColumn()) out(['error'=>'invalid professor_id'],400);

    $st=$pdo->prepare("SELECT 1 FROM manager_windows WHERE id=:id");
    $st->execute([':id'=>$win_id]);
    if(!$st->fetchColumn()) out(['error'=>'invalid window_id'],400);

    $pdo->beginTransaction();
    try {
        if ($o['status'] === 'finalized') {
            $ins = $pdo->prepare("INSERT INTO window_offers(window_id, professor_id, status, comment)
                                  VALUES(:w,:p,'offered',:c) RETURNING id");
            $ins->execute([':w'=>$win_id, ':p'=>$prof_id, ':c'=>$comment]);
            $newOfferId = $ins->fetchColumn();
            
            // Handle slot selection for new offer
            if (!empty($selectedSlots)) {
                $windowStmt = $pdo->prepare("SELECT * FROM manager_windows WHERE id = :id");
                $windowStmt->execute([':id'=>$win_id]);
                $window = $windowStmt->fetch();
                if ($window) {
                    try {
                        $slots = generateWindowSlots($window);

                        
                        $slotIns = $pdo->prepare("INSERT INTO offer_slots(offer_id, slot_index, slot_start_ts, slot_end_ts, is_selected) VALUES(:oid, :idx, :start, :end, :selected)");
                        
                        foreach ($slots as $index => $slot) {
                            $isSelected = in_array($index, $selectedSlots);
                            $slotIns->bindValue(':oid', $newOfferId, PDO::PARAM_INT);
                            $slotIns->bindValue(':idx', $index, PDO::PARAM_INT);
                            $slotIns->bindValue(':start', $slot['start_ts'], PDO::PARAM_STR);
                            $slotIns->bindValue(':end', $slot['end_ts'], PDO::PARAM_STR);
                            $slotIns->bindValue(':selected', $isSelected, PDO::PARAM_BOOL);
                            $slotIns->execute();
                        }
                    } catch (Exception $e) {
                        throw $e;
                    }
                }
            }
            
            $pdo->commit();
            out(['ok'=>true,'reoffered'=>true,'new_id'=>$newOfferId]);
        } else {
            // First, just update the basic offer information
            $st=$pdo->prepare("UPDATE window_offers
                               SET professor_id=:p, window_id=:w, comment=:c,
                                   status='offered', requested_start=NULL, requested_end=NULL,
                                   updated_at=NOW()
                               WHERE id=:id");
            $st->execute([':p'=>$prof_id, ':w'=>$win_id, ':c'=>$comment, ':id'=>$id]);
            
            // Clear existing slot selections first
            $pdo->prepare("DELETE FROM offer_slots WHERE offer_id = :id")->execute([':id'=>$id]);
            
            // Handle slot selection for existing offer
            if (!empty($selectedSlots)) {
                // Get window details for slot generation
                $windowStmt = $pdo->prepare("SELECT * FROM manager_windows WHERE id = :id");
                $windowStmt->execute([':id'=>$win_id]);
                $window = $windowStmt->fetch();
                
                if ($window) {
                    try {
                        $slots = generateWindowSlots($window);
                        
                        if (!empty($slots)) {
                            $slotIns = $pdo->prepare("INSERT INTO offer_slots(offer_id, slot_index, slot_start_ts, slot_end_ts, is_selected) VALUES(:oid, :idx, :start, :end, :selected)");
                            
                            foreach ($slots as $index => $slot) {
                                $isSelected = in_array($index, $selectedSlots);
                                
                                $slotIns->bindValue(':oid', $id, PDO::PARAM_INT);
                                $slotIns->bindValue(':idx', $index, PDO::PARAM_INT);
                                $slotIns->bindValue(':start', $slot['start_ts'], PDO::PARAM_STR);
                                $slotIns->bindValue(':end', $slot['end_ts'], PDO::PARAM_STR);
                                $slotIns->bindValue(':selected', $isSelected, PDO::PARAM_BOOL);
                                $slotIns->execute();
                            }
                        }
                    } catch (Exception $e) {
                        // Continue without slot generation
                    }
                }
            }
            
            $pdo->commit();
            out(['ok'=>true, 'status'=>'offered']);
        }
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        out(['error'=>'update_failed', 'detail'=>$e->getMessage()], 500);
    }
}

// Delete window offer (Manager/Assistant only)
if ($action === 'delete_offer' && $method === 'POST') {
    require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $id = (int)($in['id'] ?? 0);
    if ($id<=0) out(['error'=>'id required'],400);

    $st = $pdo->prepare("SELECT o.*, w.start_ts, w.end_ts
                         FROM window_offers o
                         JOIN manager_windows w ON w.id = o.window_id
                         WHERE o.id = :id");
    $st->execute([':id'=>$id]);
    $offer = $st->fetch();
    if (!$offer) out(['error'=>'offer not found'],404);

    $pdo->beginTransaction();
    try {
        if ($offer['status'] === 'finalized') {
            $start = $offer['requested_start'] ?: $offer['start_ts'];
            $end   = $offer['requested_end']   ?: $offer['end_ts'];
            if ($start && $end) {
                $del = $pdo->prepare("
                    DELETE FROM defense_slots
                    WHERE userid = :uid
                      AND window_id = :wid
                      AND timeslot >= :start
                      AND timeslot <  :end
                ");
                $del->execute([
                    ':uid'   => (int)$offer['professor_id'],
                    ':wid'   => (int)$offer['window_id'],
                    ':start' => $start,
                    ':end'   => $end
                ]);
            }
        }
        $pdo->prepare("DELETE FROM window_offers WHERE id=:id")->execute([':id'=>$id]);
        $pdo->commit();
        out(['ok'=>true]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// Get offers for current user (Professor sees their offers, Manager/Assistant see all)
if ($action === 'my_offers' && $method === 'GET') {
    $u = require_role($pdo, ['professor','manager','assistant']);
    if ($u['role']==='professor') {
        $st=$pdo->prepare("SELECT o.*, w.title, w.start_ts, w.end_ts, w.defense_minutes, w.buffer_minutes,
                                  ROW_NUMBER() OVER (ORDER BY o.id DESC) AS no
                           FROM window_offers o
                           JOIN manager_windows w ON w.id=o.window_id
                           WHERE o.professor_id=:p ORDER BY o.id DESC");
        $st->execute([':p'=>$u['id']]);
    } else {
        $st=$pdo->query("SELECT o.*, w.title, w.start_ts, w.end_ts, w.defense_minutes, w.buffer_minutes,
                                ROW_NUMBER() OVER (ORDER BY o.id DESC) AS no
                         FROM window_offers o
                         JOIN manager_windows w ON w.id=o.window_id
                         ORDER BY o.id DESC");
    }
    
    $offers = $st->fetchAll();
    
    // Add slot information for each offer
    foreach ($offers as &$offer) {
        $slotStmt = $pdo->prepare("
            SELECT slot_index, slot_start_ts, slot_end_ts, is_selected
            FROM offer_slots 
            WHERE offer_id = :offer_id 
            ORDER BY slot_index
        ");
        $slotStmt->execute([':offer_id' => $offer['id']]);
        $offer['slots'] = $slotStmt->fetchAll();
        
        // Count selected slots
        $offer['selected_slots_count'] = count(array_filter($offer['slots'], fn($s) => $s['is_selected']));
        $offer['total_slots_count'] = count($offer['slots']);
    }
    
    out($offers);
}

// Get available windows for selection (all authenticated users)
if ($action === 'available_windows' && $method === 'GET') {
    $u = current_user($pdo);
    if (!$u) out(['error'=>'unauthorized'],401);
    
    // For professors, return all windows (they can request any window)
    if ($u['role'] === 'professor') {
        $st = $pdo->query("
            SELECT w.*, 
                   ROW_NUMBER() OVER (ORDER BY w.start_ts ASC) AS no
            FROM manager_windows w
            ORDER BY w.start_ts ASC
        ");
    } else {
        // For managers/assistants, return all windows
        $st = $pdo->query("
            SELECT w.*, 
                   ROW_NUMBER() OVER (ORDER BY w.start_ts ASC) AS no
            FROM manager_windows w
            ORDER BY w.start_ts ASC
        ");
    }
    
    out($st->fetchAll());
}

// Get previous slot assignments for a professor-window combination (Manager/Assistant only)
if ($action === 'get_previous_slot_assignments' && $method === 'GET') {
    require_role($pdo, ['manager','assistant']);
    $windowId = (int)($_GET['window_id'] ?? 0);
    $professorId = (int)($_GET['professor_id'] ?? 0);
    
    if ($windowId <= 0 || $professorId <= 0) {
        out(['error'=>'window_id and professor_id required'], 400);
    }
    
    // First, check if there's a finalized/accepted offer for this professor-window combination
    $st = $pdo->prepare("
        SELECT o.id, o.comment, o.status
        FROM window_offers o
        WHERE o.window_id = :window_id 
          AND o.professor_id = :professor_id
          AND o.status IN ('finalized', 'accepted')
        ORDER BY o.updated_at DESC
        LIMIT 1
    ");
    $st->execute([':window_id' => $windowId, ':professor_id' => $professorId]);
    $finalizedOffer = $st->fetch();
    
    if ($finalizedOffer) {
        // If there's a finalized offer, get the actual assigned slots from defense_slots
        $slotStmt = $pdo->prepare("
            SELECT ds.timeslot, ds.approved
            FROM defense_slots ds
            WHERE ds.userid = :professor_id 
              AND ds.window_id = :window_id
              AND ds.approved = TRUE
            ORDER BY ds.timeslot
        ");
        $slotStmt->execute([':professor_id' => $professorId, ':window_id' => $windowId]);
        $assignedSlots = $slotStmt->fetchAll();
        
        if (!empty($assignedSlots)) {
            // Convert assigned slots back to slot indices
            $windowStmt = $pdo->prepare("SELECT * FROM manager_windows WHERE id = :id");
            $windowStmt->execute([':id' => $windowId]);
            $window = $windowStmt->fetch();
            if ($window) {
                $slots = generateWindowSlots($window);
                $selectedSlotIndices = [];
                
                foreach ($assignedSlots as $assignedSlot) {
                    $assignedTime = $assignedSlot['timeslot'];
                    foreach ($slots as $index => $slot) {
                        // Convert both times to the same format for comparison
                        $slotStart = new DateTime($slot['start_ts']);
                        $assignedDateTime = new DateTime($assignedTime);
                        
                        if ($slotStart->format('Y-m-d H:i:s') === $assignedDateTime->format('Y-m-d H:i:s')) {
                            $selectedSlotIndices[] = $index;
                            break;
                        }
                    }
                }
                
                out([
                    'previous_assignments' => $selectedSlotIndices,
                    'comment' => $finalizedOffer['comment'],
                    'status' => 'finalized'
                ]);
                return;
            }
        }
    }
    
    // If no finalized offer or no assigned slots, fall back to the most recent offer
    $st = $pdo->prepare("
        SELECT o.id, o.comment, o.status
        FROM window_offers o
        WHERE o.window_id = :window_id 
          AND o.professor_id = :professor_id
        ORDER BY o.updated_at DESC
        LIMIT 1
    ");
    $st->execute([':window_id' => $windowId, ':professor_id' => $professorId]);
    $offer = $st->fetch();
    
    if (!$offer) {
        out(['previous_assignments' => null, 'comment' => null, 'status' => null]);
        return;
    }
    
    // Get the slot assignments for this offer
    $slotStmt = $pdo->prepare("
        SELECT slot_index, slot_start_ts, slot_end_ts, is_selected
        FROM offer_slots 
        WHERE offer_id = :offer_id 
        ORDER BY slot_index
    ");
    $slotStmt->execute([':offer_id' => $offer['id']]);
    $slots = $slotStmt->fetchAll();
    
    // Extract selected slot indices
    $selectedSlots = array_map(function($slot) {
        return (int)$slot['slot_index'];
    }, array_filter($slots, function($slot) {
        return $slot['is_selected'] === true;
    }));
    
    out([
        'previous_assignments' => $selectedSlots,
        'comment' => $offer['comment'],
        'status' => $offer['status']
    ]);
}

/**
 * Professor responds to window offer (accept/reject/change)
 * 
 * POST /?action=respond_offer
 * 
 * Allows a professor to respond to a window offer with one of three decisions:
 * - accept: Accepts the offer (may auto-finalize)
 * - reject: Rejects the offer (requires comment)
 * - change: Requests changes to the offer (requires new time range)
 * 
 * Authentication: Required (Bearer token)
 * Roles: professor
 * 
 * Request Body (JSON):
 * {
 *   "offer_id": 123,                    // Required: Valid offer ID
 *   "decision": "accept",               // Required: "accept", "reject", or "change"
 *   "comment": "I accept this offer",   // Required for reject, optional for others
 *   "requested_start": "2025-09-05T10:00:00Z",  // Required for change: new start time
 *   "requested_end": "2025-09-05T14:00:00Z"     // Required for change: new end time
 * }
 * 
 * Response (200) - Accept:
 * {
 *   "ok": true,
 *   "status": "finalized",
 *   "auto_finalized": true
 * }
 * 
 * Response (200) - Reject/Change:
 * {
 *   "ok": true,
 *   "status": "rejected"  // or "change_requested"
 * }
 * 
 * Response (400):
 * {
 *   "error": "offer_id and valid decision required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "decline reason (comment) is required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "requested_start and requested_end required for change"
 * }
 * 
 * Response (400):
 * {
 *   "error": "requested_end must be after requested_start"
 * }
 * 
 * Response (404):
 * {
 *   "error": "offer not found"
 * }
 * 
 * Response (403):
 * {
 *   "error": "unauthorized_or_forbidden",
 *   "roles_required": ["professor"]
 * }
 */
if ($action === 'respond_offer' && $method === 'POST') {
    $u = require_role($pdo, ['professor']);
    $in = json_input();
    $oid = (int)($in['offer_id'] ?? 0);
    $decision = $in['decision'] ?? '';
    $comment  = trim($in['comment'] ?? '');
    $rstart   = $in['requested_start'] ?? null;
    $rend     = $in['requested_end'] ?? null;

    if ($oid<=0 || !in_array($decision,['accept','reject','change'],true)) out(['error'=>'offer_id and valid decision required'],400);
    if ($decision === 'reject' && $comment==='') out(['error'=>'decline reason (comment) is required'],400);
    if ($decision === 'change') {
        if(!$rstart || !$rend) out(['error'=>'requested_start and requested_end required for change'],400);
        if (strtotime($rend) <= strtotime($rstart)) out(['error'=>'requested_end must be after requested_start'],400);
    }

    $st=$pdo->prepare("SELECT * FROM window_offers WHERE id=:id AND professor_id=:p");
    $st->execute([':id'=>$oid, ':p'=>$u['id']]);
    $o=$st->fetch();
    if (!$o) out(['error'=>'offer not found'],404);

    $statusMap = ['accept'=>'accepted', 'reject'=>'rejected', 'change'=>'change_requested'];
    $next = $statusMap[$decision];

    $st = $pdo->prepare("UPDATE window_offers SET status=:s, comment=:c,
                         requested_start=:rs, requested_end=:re, updated_at=NOW()
                         WHERE id=:id");
    $st->execute([
        ':s'=>$next, ':c'=>$comment?:null,
        ':rs'=>$rstart, ':re'=>$rend, ':id'=>$oid
    ]);
    
    // Auto-finalize if professor accepts
    if ($decision === 'accept') {
        error_log("Auto-finalizing offer $oid for professor " . $u['id']);
        try {
            // Get window details for finalization
            $st = $pdo->prepare("SELECT o.*, w.title, w.start_ts, w.end_ts, w.defense_minutes, w.buffer_minutes,
                                       u.fullname AS prof_name
                                FROM window_offers o
                                JOIN manager_windows w ON w.id=o.window_id
                                JOIN app_users u ON u.id=o.professor_id
                                WHERE o.id=:id");
            $st->execute([':id'=>$oid]); 
            $o = $st->fetch();
        
        if ($o) {
            $rangeStart = $o['start_ts'];
            $rangeEnd = $o['end_ts'];
            
            if ($rangeStart && $rangeEnd && strtotime($rangeEnd) > strtotime($rangeStart)) {
                $defm = (int)$o['defense_minutes'];
                $bufm = (int)$o['buffer_minutes'];
                $strideMin = $defm + $bufm;
                
                if ($strideMin > 0) {
                    $profId = (int)$o['professor_id'];
                    $profName = $o['prof_name'];
                    
                    $ins = $pdo->prepare("INSERT INTO defense_slots(userid, name, timeslot, approved, window_id)
                                          VALUES(:uid,:name,:ts, TRUE, :wid)");
                    
                    // Get selected slots for this offer
                    $slotStmt = $pdo->prepare("
                        SELECT slot_start_ts, slot_end_ts 
                        FROM offer_slots 
                        WHERE offer_id = :offer_id AND is_selected = TRUE 
                        ORDER BY slot_index
                    ");
                    $slotStmt->execute([':offer_id' => $oid]);
                    $selectedSlots = $slotStmt->fetchAll();
                    
                    $pdo->beginTransaction();
                    try {
                        if (!empty($selectedSlots)) {
                            // Create slots only for the selected slots
                            foreach ($selectedSlots as $slot) {
                                $ins->execute([
                                    ':uid'=>$profId,
                                    ':name'=>$profName,
                                    ':ts'=>$slot['slot_start_ts'],
                                    ':wid'=>$o['window_id']
                                ]);
                            }
                        } else {
                            // Fallback: create slots for the entire range (backward compatibility)
                            $cur = new DateTime($rangeStart);
                            $endDt = new DateTime($rangeEnd);
                            while ($cur < $endDt) {
                                $ins->execute([
                                    ':uid'=>$profId,
                                    ':name'=>$profName,
                                    ':ts'=>$cur->format('Y-m-d H:i:sP'),
                                    ':wid'=>$o['window_id']
                                ]);
                                $cur->modify('+'.($strideMin).' minutes');
                            }
                        }
                        
                        $pdo->prepare("UPDATE window_offers SET status='finalized', updated_at=NOW() WHERE id=:id")->execute([':id'=>$oid]);
                        $pdo->commit();
                        
                        error_log("Successfully auto-finalized offer $oid");
                        out(['ok'=>true,'status'=>'finalized','auto_finalized'=>true]);
                        return;
                    } catch (Throwable $e) {
                        $pdo->rollBack();
                        // If auto-finalization fails, just return the accepted status
                        error_log('Auto-finalization failed for offer ' . $oid . ': ' . $e->getMessage());
                    }
                }
            }
        }
        } catch (Throwable $e) {
            // If auto-finalization setup fails, just return the accepted status
            error_log('Auto-finalization setup failed for offer ' . $oid . ': ' . $e->getMessage());
        }
    }
    
    out(['ok'=>true,'status'=>$next]);
}

// Finalize accepted offer and create defense slots (Manager only)
if ($action === 'finalize_offer' && $method === 'POST') {
    require_role($pdo, ['manager']);
    $in = json_input();
    $oid = (int)($in['offer_id'] ?? 0);
    $acceptChange = read_bool($in['accept_change'] ?? false);

    if ($oid<=0) out(['error'=>'offer_id required'],400);

    $st=$pdo->prepare("SELECT o.*, w.title, w.start_ts, w.end_ts, w.defense_minutes, w.buffer_minutes,
                              u.fullname AS prof_name
                       FROM window_offers o
                       JOIN manager_windows w ON w.id=o.window_id
                       JOIN app_users u ON u.id=o.professor_id
                       WHERE o.id=:id");
    $st->execute([':id'=>$oid]); $o=$st->fetch();
    if (!$o) out(['error'=>'offer not found'],404);

    if (!in_array($o['status'], ['accepted','change_requested'], true)) {
        out(['error'=>'offer must be accepted or change_requested'],400);
    }

    // Handle change requests to different windows
    $targetWindowId = $o['window_id'];
    $targetWindow = $o;
    
    if ($o['status'] === 'change_requested' && $acceptChange && $o['requested_window_id']) {
        // Get the requested window details
        $windowStmt = $pdo->prepare("SELECT * FROM manager_windows WHERE id = :id");
        $windowStmt->execute([':id' => $o['requested_window_id']]);
        $requestedWindow = $windowStmt->fetch();
        
        if (!$requestedWindow) {
            out(['error' => 'requested window not found'], 404);
        }
        
        $targetWindowId = $o['requested_window_id'];
        $targetWindow = array_merge($o, $requestedWindow);
    }
    
    $rangeStart = $targetWindow['start_ts'];
    $rangeEnd = $targetWindow['end_ts'];

    if (!$rangeStart || !$rangeEnd) out(['error'=>'invalid scheduling range'],400);
    if (strtotime($rangeEnd) <= strtotime($rangeStart)) out(['error'=>'range end must be after range start'],400);

    $defm  = (int)$targetWindow['defense_minutes'];
    $bufm  = (int)$targetWindow['buffer_minutes'];
    $strideMin = $defm + $bufm;
    if ($strideMin <= 0) out(['error'=>'invalid stride'],400);

    $profId = (int)$o['professor_id'];
    $profName = $o['prof_name'];

    $gen = 0;
    $cur = new DateTime($rangeStart);
    $endDt = new DateTime($rangeEnd);

    $ins = $pdo->prepare("INSERT INTO defense_slots(userid, name, timeslot, approved, window_id)
                          VALUES(:uid,:name,:ts, TRUE, :wid)");

    // Get selected slots for this offer
    $slotStmt = $pdo->prepare("
        SELECT slot_start_ts, slot_end_ts 
        FROM offer_slots 
        WHERE offer_id = :offer_id AND is_selected = TRUE 
        ORDER BY slot_index
    ");
    $slotStmt->execute([':offer_id' => $oid]);
    $selectedSlots = $slotStmt->fetchAll();

    $pdo->beginTransaction();
    try {
        if (!empty($selectedSlots)) {
            // Create slots only for the selected slots
            foreach ($selectedSlots as $slot) {
                $ins->execute([
                    ':uid'=>$profId,
                    ':name'=>$profName,
                    ':ts'=>$slot['slot_start_ts'],
                    ':wid'=>$targetWindowId
                ]);
                $gen++;
            }
        } else {
            // Fallback: create slots for the entire range (backward compatibility)
            while ($cur < $endDt) {
                $ins->execute([
                    ':uid'=>$profId,
                    ':name'=>$profName,
                    ':ts'=>$cur->format('Y-m-d H:i:sP'),
                    ':wid'=>$targetWindowId
                ]);
                $gen++;
                $cur->modify('+'.($strideMin).' minutes');
            }
        }
        
        // Update the offer - if it was a change request to a different window, update the window_id
        if ($o['status'] === 'change_requested' && $acceptChange && $o['requested_window_id']) {
            $pdo->prepare("UPDATE window_offers SET status='finalized', window_id=:window_id, requested_window_id=NULL, updated_at=NOW() WHERE id=:id")->execute([':window_id'=>$targetWindowId, ':id'=>$oid]);
        } else {
            $pdo->prepare("UPDATE window_offers SET status='finalized', updated_at=NOW() WHERE id=:id")->execute([':id'=>$oid]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    out(['ok'=>true,'finalized'=>true,'slots_generated'=>$gen]);
}

// Get defense slots (Professor sees their slots, Manager/Assistant see all)
if ($action === 'slots' && $method === 'GET') {
    $u = current_user($pdo);
    if (!$u) out(['error'=>'unauthorized'],401);

    if (in_array($u['role'], ['manager','assistant'], true)) {
        $st = $pdo->query("
            SELECT s.id, s.userid, s.name, s.timeslot, s.approved, s.window_id, s.created_at,
                   CASE WHEN s.approved THEN 'Approved' ELSE 'Pending' END AS status_text,
                   ROW_NUMBER() OVER (ORDER BY s.timeslot ASC, s.id ASC) AS no
            FROM defense_slots s
            ORDER BY s.timeslot ASC, s.id ASC
        ");
    } else {
        $st = $pdo->prepare("
            SELECT s.id, s.userid, s.name, s.timeslot, s.approved, s.window_id, s.created_at,
                   CASE WHEN s.approved THEN 'Approved' ELSE 'Pending' END AS status_text,
                   ROW_NUMBER() OVER (ORDER BY s.timeslot ASC, s.id ASC) AS no
            FROM defense_slots s
            WHERE s.userid=:uid
            ORDER BY s.timeslot ASC, s.id ASC
        ");
        $st->execute([':uid'=>$u['id']]);
    }
    out($st->fetchAll());
}

// Create defense slot (Manager/Assistant can create for any professor, Professor can create for themselves)
if ($method === 'POST' && $action === 'slots') {
    $u = current_user($pdo);
    if (!$u) out(['error'=>'unauthorized'],401);

    $in = json_input();
    $name = trim($in['name'] ?? '');
    $timeslot = $in['timeslot'] ?? '';
    $userid = in_array($u['role'], ['manager','assistant'], true)
        ? (isset($in['userid'])?(int)$in['userid']:null)
        : $u['id'];

    if ($name === '' || $timeslot === '') out(['error'=>'name and timeslot required'],400);

    if (in_array($u['role'], ['manager','assistant'], true)) {
        if (!$userid) out(['error'=>'userid required for admin-created slot'],400);
        $st=$pdo->prepare("SELECT 1 FROM app_users WHERE id=:id AND role='professor'");
        $st->execute([':id'=>$userid]);
        if(!$st->fetchColumn()) out(['error'=>'userid must be a professor'],400);
    }

    $st = $pdo->prepare("INSERT INTO defense_slots (userid, name, timeslot)
                         VALUES (:uid, :name, :ts) RETURNING id");
    $st->execute([':uid'=>$userid, ':name'=>$name, ':ts'=>$timeslot]);
    out(['ok'=>true, 'id'=>$st->fetchColumn()]);
}

/* ==========================================================
   PROFESSOR NOTES ENDPOINTS
   ==========================================================
   
   PROFESSOR CONSOLE FUNCTIONALITY
   ========================================================== */

// Get professor notes (Professor only)
if ($action === 'notes' && $method === 'GET') {
    $u = require_role($pdo, ['professor']);
    $slotId = isset($_GET['slot_id']) ? (int)$_GET['slot_id'] : null;
    if ($slotId) {
        $st = $pdo->prepare("SELECT id, slot_id, note, created_at, updated_at
                             FROM professor_notes
                             WHERE professor_id=:p AND slot_id=:s
                             ORDER BY updated_at DESC");
        $st->execute([':p'=>$u['id'], ':s'=>$slotId]);
    } else {
        $st = $pdo->prepare("SELECT id, slot_id, note, created_at, updated_at
                             FROM professor_notes
                             WHERE professor_id=:p
                             ORDER BY updated_at DESC");
        $st->execute([':p'=>$u['id']]);
    }
    out($st->fetchAll());
}

// Save professor note (Professor only)
if ($action === 'save_note' && $method === 'POST') {
    $u = require_role($pdo, ['professor']);
    $in = json_input();
    $slotId = (int)($in['slot_id'] ?? 0);
    $noteId = isset($in['note_id']) ? (int)$in['note_id'] : null;
    $note   = trim($in['note'] ?? '');

    if ($slotId<=0 || $note==='') out(['error'=>'slot_id and note required'],400);

    $st = $pdo->prepare("SELECT 1 FROM defense_slots WHERE id=:sid AND userid=:uid");
    $st->execute([':sid'=>$slotId, ':uid'=>$u['id']]);
    if(!$st->fetchColumn()) out(['error'=>'slot not found or not yours'],404);

    if ($noteId) {
        $st = $pdo->prepare("UPDATE professor_notes
                             SET note=:n, updated_at=NOW()
                             WHERE id=:id AND professor_id=:p");
        $st->execute([':n'=>$note, ':id'=>$noteId, ':p'=>$u['id']]);
        out(['ok'=>true, 'updated'=>true]);
    } else {
        $st = $pdo->prepare("INSERT INTO professor_notes(professor_id, slot_id, note)
                             VALUES(:p,:s,:n) RETURNING id");
        $st->execute([':p'=>$u['id'], ':s'=>$slotId, ':n'=>$note]);
        out(['ok'=>true, 'id'=>$st->fetchColumn()]);
    }
}

/* ==========================================================
   POLL MANAGEMENT ENDPOINTS
   ==========================================================
   
   MANAGER & ASSISTANT CONSOLE FUNCTIONALITY
   ========================================================== */

/**
 * Create new poll (Manager/Assistant only)
 * 
 * POST /?action=create_poll
 * 
 * Creates a new poll with either text options or time-slot options.
 * Supports two modes:
 * - text: Traditional poll with custom text options
 * - timeslots: Time-slot based poll with automatically generated slots
 * 
 * Authentication: Required (Bearer token)
 * Roles: manager, assistant
 * 
 * Request Body (JSON) - Text Mode:
 * {
 *   "title": "Which topic should we discuss?",     // Required
 *   "description": "Please select your preference", // Optional
 *   "allow_multi": false,                          // Optional: Allow multiple selections
 *   "require_names": true,                         // Optional: Require voter names
 *   "mode": "text",                                // Required: "text" or "timeslots"
 *   "options": ["Option A", "Option B", "Option C"] // Required: At least 2 options
 * }
 * 
 * Request Body (JSON) - Time-slot Mode:
 * {
 *   "title": "Defense Time Preference",            // Required
 *   "description": "Select your preferred times",  // Optional
 *   "allow_multi": true,                           // Optional: Allow multiple selections
 *   "require_names": true,                         // Optional: Require voter names
 *   "mode": "timeslots",                           // Required: "timeslots"
 *   "start_ts": "2025-09-05T09:00:00Z",           // Required: Start time
 *   "end_ts": "2025-09-05T17:00:00Z",             // Required: End time
 *   "defense_minutes": 20,                         // Required: Defense duration
 *   "buffer_minutes": 5,                           // Required: Buffer time
 *   "breaks_count": 2,                             // Optional: Number of breaks
 *   "break_minutes": 15,                           // Optional: Break duration
 *   "per_slot_note": "Defense session"             // Optional: Note per slot
 * }
 * 
 * Response (200):
 * {
 *   "ok": true,
 *   "id": 42
 * }
 * 
 * Response (400):
 * {
 *   "error": "title required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "at least two non-empty options required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "timeslots require start_ts,end_ts,defense_minutes>0,buffer_minutes>=0"
 * }
 * 
 * Response (400):
 * {
 *   "error": "end_ts must be after start_ts"
 * }
 * 
 * Response (400):
 * {
 *   "error": "no time slots could be generated"
 * }
 * 
 * Response (400):
 * {
 *   "error": "poll_create_failed",
 *   "detail": "Database error message"
 * }
 * 
 * Response (403):
 * {
 *   "error": "unauthorized_or_forbidden",
 *   "roles_required": ["manager", "assistant"]
 * }
 */
if ($action === 'create_poll' && $method === 'POST') {
    $me = require_role($pdo, ['manager','assistant']);
    $in = json_input();

    $title         = trim($in['title'] ?? '');
    $description   = trim($in['description'] ?? '');
    $allow_multi   = read_bool($in['allow_multi'] ?? false);
    $require_names = read_bool($in['require_names'] ?? false);
    $mode          = strtolower(trim($in['mode'] ?? 'text'));
    if ($mode !== 'timeslots') $mode = 'text';

    if ($title === '') out(['error'=>'title required'],400);
    ensure_polls_schema($pdo);

    // helper to normalize options
    $normalize = function($options){
        if (!is_array($options)) {
            if (is_string($options)) {
                return array_values(array_filter(array_map('trim', preg_split('/[\r\n,]+/', $options)), fn($s)=>$s!==''));
            }
            return [];
        }
        $out=[]; foreach ($options as $v) { $v = trim((string)$v); if ($v!=='') $out[] = $v; }
        return $out;
    };

    if ($mode === 'timeslots') {
        // inputs for timeslot generation
        $start_ts = $in['start_ts'] ?? null;
        $end_ts   = $in['end_ts'] ?? null;
        $defm     = isset($in['defense_minutes']) ? (int)$in['defense_minutes'] : null;
        $bufm     = isset($in['buffer_minutes'])  ? (int)$in['buffer_minutes']  : null;
        $breaks   = isset($in['breaks_count'])    ? max(0,(int)$in['breaks_count']) : 0;
        $brmin    = isset($in['break_minutes'])   ? max(0,(int)$in['break_minutes']) : 0;
        $note     = isset($in['per_slot_note'])   ? trim((string)$in['per_slot_note']) : null;

        if (!$start_ts || !$end_ts || !$defm || $defm<=0 || $bufm===null || $bufm<0) {
            out(['error'=>'timeslots require start_ts,end_ts,defense_minutes>0,buffer_minutes>=0'],400);
        }
        if (strtotime($end_ts) <= strtotime($start_ts)) out(['error'=>'end_ts must be after start_ts'],400);

        $opts = $normalize($in['options'] ?? []);

        // If UI didn't send options, generate them server-side from window
        if (count($opts) === 0) {
            $stride = $defm + $bufm;
            if ($stride <= 0) out(['error'=>'invalid stride'],400);

            $cur = new DateTime($start_ts);
            $end = new DateTime($end_ts);

            $slots = [];
            while ($cur < $end) {
                $slots[] = new DateTime($cur->format(DateTime::ATOM));
                $cur->modify('+' . $stride . ' minutes');
            }

            // Insert breaks by shifting subsequent slots forward, not as separate options
            if ($breaks > 0 && $brmin > 0 && count($slots) > 1) {
                $groups   = $breaks + 1;                 // break between groups
                $perGroup = (int)ceil(count($slots)/$groups);
                $withBreaks = [];
                $acc = new DateTime($start_ts);
                $count = 0;
                foreach ($slots as $i => $_unused) {
                    $slotStart = new DateTime($acc->format(DateTime::ATOM));
                    $withBreaks[] = $slotStart;
                    $acc->modify('+' . $stride . ' minutes');
                    $count++;
                    if ($count >= $perGroup && $i < count($slots) - 1) {
                        $acc->modify('+' . $brmin . ' minutes');
                        $count = 0;
                    }
                }
                $slots = $withBreaks;
            }

            foreach ($slots as $s) {
                $label = $s->format('Y-m-d H:i');
                if ($note) $label .= ' — ' . $note;
                $opts[] = $label;
            }
        }

        if (count($opts) < 1) out(['error'=>'no time slots could be generated'],400);

        $pdo->beginTransaction();
        try {
            $ins = $pdo->prepare(
              "INSERT INTO polls(created_by,title,description,allow_multi,require_names,mode,
                                 start_ts,end_ts,defense_minutes,buffer_minutes,breaks_count,break_minutes,per_slot_note)
               VALUES(:u,:t,:d,:am,:rn,'timeslots',:s,:e,:dm,:bm,:bc,:brm,:note)
               RETURNING id"
            );

            $ins->bindValue(':u', $me['id'], PDO::PARAM_INT);
            $ins->bindValue(':t', $title, PDO::PARAM_STR);
            $ins->bindValue(':d', ($description !== '' ? $description : null), $description !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $ins->bindValue(':am', $allow_multi, PDO::PARAM_BOOL);
            $ins->bindValue(':rn', $require_names, PDO::PARAM_BOOL);
            $ins->bindValue(':s', $start_ts, PDO::PARAM_STR);
            $ins->bindValue(':e', $end_ts, PDO::PARAM_STR);
            $ins->bindValue(':dm', $defm, PDO::PARAM_INT);
            $ins->bindValue(':bm', $bufm, PDO::PARAM_INT);
            $ins->bindValue(':bc', $breaks, PDO::PARAM_INT);
            $ins->bindValue(':brm', $brmin, PDO::PARAM_INT);
            $ins->bindValue(':note', ($note !== '' ? $note : null), ($note !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL));

            $ins->execute();
            $pollId = (int)$ins->fetchColumn();

            $ord = 0;
            $optStmt = $pdo->prepare("INSERT INTO poll_options(poll_id,label,ord) VALUES(:p,:l,:o)");
            foreach ($opts as $label) {
                $optStmt->execute([':p'=>$pollId, ':l'=>$label, ':o'=>$ord++]);
            }
            $pdo->commit();
            out(['ok'=>true,'id'=>$pollId]);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('create_poll[timeslots] failed: ' . $e->getMessage());
            out(['error'=>'poll_create_failed','detail'=>$e->getMessage()],400);
        }
        return;
    }

    // TEXT MODE
    $opts = $normalize($in['options'] ?? []);
    if (count($opts) < 2) out(['error'=>'at least two non-empty options required'],400);

    $pdo->beginTransaction();
    try {
        $ins = $pdo->prepare(
          "INSERT INTO polls(created_by,title,description,allow_multi,require_names,mode)
           VALUES(:u,:t,:d,:am,:rn,'text') RETURNING id"
        );

        $ins->bindValue(':u', $me['id'], PDO::PARAM_INT);
        $ins->bindValue(':t', $title, PDO::PARAM_STR);
        $ins->bindValue(':d', ($description !== '' ? $description : null), $description !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $ins->bindValue(':am', $allow_multi, PDO::PARAM_BOOL);
        $ins->bindValue(':rn', $require_names, PDO::PARAM_BOOL);

        $ins->execute();
        $pollId = (int)$ins->fetchColumn();

        $ord = 0;
        $optStmt = $pdo->prepare("INSERT INTO poll_options(poll_id,label,ord) VALUES(:p,:l,:o)");
        foreach ($opts as $label) {
            $optStmt->execute([':p'=>$pollId, ':l'=>$label, ':o'=>$ord++]);
        }
        $pdo->commit();
        out(['ok'=>true,'id'=>$pollId]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('create_poll[text] failed: ' . $e->getMessage());
        out(['error' => 'poll_create_failed', 'detail' => $e->getMessage()], 400);
    }
}

// Get all polls (Manager/Assistant/Professor)
if ($action === 'polls' && $method === 'GET') {
    $u = require_role($pdo, ['manager','assistant','professor']);
    $polls = $pdo->query("
        SELECT p.id, p.title, p.description, p.allow_multi, p.require_names,
               p.mode, p.start_ts, p.end_ts, p.defense_minutes, p.buffer_minutes,
               p.breaks_count, p.break_minutes, p.per_slot_note, p.created_at,
               u.fullname AS author
        FROM polls p
        LEFT JOIN app_users u ON u.id = p.created_by
        ORDER BY p.created_at DESC, p.id DESC
    ")->fetchAll();

    // For professors, annotate polls with whether they have already voted
    $votedSet = [];
    if ($u['role'] === 'professor') {
        $stmtV = $pdo->prepare("SELECT DISTINCT poll_id FROM poll_votes WHERE voter_id = :uid");
        $stmtV->execute([':uid' => $u['id']]);
        foreach ($stmtV->fetchAll(PDO::FETCH_COLUMN, 0) as $pid) {
            $votedSet[(int)$pid] = true;
        }
    }

    $optStmt = $pdo->prepare("
        SELECT o.id, o.poll_id, o.label, o.ord,
               COALESCE(cnt.c,0) AS votes
        FROM poll_options o
        LEFT JOIN (
          SELECT option_id, COUNT(*) AS c
          FROM poll_votes
          GROUP BY option_id
        ) cnt ON cnt.option_id = o.id
        WHERE o.poll_id = :pid
        ORDER BY o.ord ASC, o.id ASC
    ");
    $voterCntStmt = $pdo->prepare("SELECT COUNT(DISTINCT voter_id) FROM poll_votes WHERE poll_id=:pid");
    $myOptsStmt = $pdo->prepare("
    SELECT option_id
    FROM poll_votes
    WHERE poll_id = :pid AND voter_id = :uid
    ORDER BY option_id
");
    foreach ($polls as &$p) {
        $optStmt->execute([':pid'=>$p['id']]);
        $p['options'] = $optStmt->fetchAll();
        $voterCntStmt->execute([':pid'=>$p['id']]);
        $p['voters'] = (int)$voterCntStmt->fetchColumn();
        if ($u['role'] === 'professor') {
            $p['has_voted'] = !empty($votedSet[(int)$p['id']]);
            if ($u['role'] === 'professor') {
                $myOptsStmt->execute([':pid' => $p['id'], ':uid' => $u['id']]);
                $p['my_option_ids'] = array_map('intval', $myOptsStmt->fetchAll(PDO::FETCH_COLUMN, 0));
            }
        }
    }
    out($polls);
}

// Get poll options (Manager/Assistant/Professor)
if ($action === 'poll_options' && $method === 'GET') {
    $u = require_role($pdo, ['manager','assistant','professor']);
    $pid = isset($_GET['poll_id']) ? (int)$_GET['poll_id'] : 0;
    if ($pid <= 0) out(['error'=>'poll_id required'],400);

    $opts = $pdo->prepare("SELECT id, label as text, ord FROM poll_options WHERE poll_id=:id ORDER BY ord ASC, id ASC");
    $opts->execute([':id'=>$pid]);
    $options = $opts->fetchAll();
    
    out($options);
}

// Get poll vote count (Manager/Assistant/Professor)
if ($action === 'poll_votes' && $method === 'GET') {
    $pid = isset($_GET['poll_id']) ? (int)$_GET['poll_id'] : 0;
    if ($pid <= 0) out(['error'=>'poll_id required'],400);

    // Get vote count for this poll
    $voteCount = $pdo->prepare("SELECT COUNT(DISTINCT voter_id) as count FROM poll_votes WHERE poll_id=:id");
    $voteCount->execute([':id'=>$pid]);
    $result = $voteCount->fetch();
    
    out(['count' => (int)$result['count']]);
}

// Get poll voters and non-voters (Manager/Assistant/Professor)
if ($action === 'poll_voters' && $method === 'GET') {
    $pid = isset($_GET['poll_id']) ? (int)$_GET['poll_id'] : 0;
    if ($pid <= 0) out(['error'=>'poll_id required'],400);

    // Get all voters for this poll
    $voters = $pdo->prepare("
        SELECT DISTINCT v.voter_id, u.fullname as name, u.email 
        FROM poll_votes v 
        LEFT JOIN app_users u ON u.id = v.voter_id 
        WHERE v.poll_id = :id 
        ORDER BY u.fullname ASC
    ");
    $voters->execute([':id'=>$pid]);
    $voterList = $voters->fetchAll();
    
    // Get all professors who didn't vote
    $nonVoters = $pdo->prepare("
        SELECT u.id, u.fullname as name, u.email 
        FROM app_users u 
        WHERE u.role = 'professor' 
        AND u.id NOT IN (
            SELECT DISTINCT voter_id 
            FROM poll_votes 
            WHERE poll_id = :id
        )
        ORDER BY u.fullname ASC
    ");
    $nonVoters->execute([':id'=>$pid]);
    $nonVoterList = $nonVoters->fetchAll();
    
    out([
        'voters' => $voterList,
        'non_voters' => $nonVoterList
    ]);
}

// Get detailed poll results (Manager/Assistant only)
if ($action === 'poll_results' && $method === 'GET') {

    $u = require_role($pdo, ['manager','assistant']);
    $pid = isset($_GET['poll_id']) ? (int)$_GET['poll_id'] : 0;
    if ($pid <= 0) out(['error'=>'poll_id required'],400);

    $poll = $pdo->prepare("SELECT id, title, description, allow_multi, require_names, mode,
           start_ts, end_ts, defense_minutes, buffer_minutes,
           breaks_count, break_minutes, per_slot_note, created_at
    FROM polls WHERE id=:id");
    $poll->execute([':id'=>$pid]);
    $p = $poll->fetch();
    if (!$p) out(['error'=>'not found'],404);

    $opts = $pdo->prepare("SELECT id, label, ord FROM poll_options WHERE poll_id=:id ORDER BY ord ASC, id ASC");
    $opts->execute([':id'=>$pid]);
    $options = $opts->fetchAll();

    $votes = $pdo->prepare("
        SELECT v.option_id, v.voter_id, a.fullname AS voter_name
        FROM poll_votes v
        LEFT JOIN app_users a ON a.id=v.voter_id
        WHERE v.poll_id=:id
        ORDER BY v.created_at ASC
    ");
    $votes->execute([':id'=>$pid]);
    $rows = $votes->fetchAll();

    $counts = [];
    $byName = [];
    foreach ($options as $o) $counts[$o['id']] = 0;
    foreach ($rows as $r) {
        if (isset($counts[$r['option_id']])) $counts[$r['option_id']]++;
        if ($r['voter_id']) $byName[$r['voter_id']] = $r['voter_name'] ?: ('#'.$r['voter_id']);
    }
    // build a list of voters per option
    $byOption = [];
    foreach ($options as $o) $byOption[(int)$o['id']] = [];

    foreach ($rows as $r) {
        $oid = (int)$r['option_id'];
        $vid = isset($r['voter_id']) ? (int)$r['voter_id'] : null;
        $vname = $r['voter_name'] ?: ($vid ? ('#'.$vid) : null);
        if ($vname !== null) {
            $byOption[$oid][] = ['id' => $vid, 'name' => $vname];
        }
    }
// (optional) sort names alphabetically
    foreach ($byOption as &$arr) usort($arr, fn($a,$b)=>strcmp($a['name'],$b['name']));
    unset($arr);

    // attach counts and voter lists to each option for easier frontend rendering
    foreach ($options as &$opt) {
        $oid = (int)$opt['id'];
        $opt['votes']  = isset($counts[$oid]) ? (int)$counts[$oid] : 0;
        $opt['voters'] = $byOption[$oid] ?? [];
    }
    unset($opt);

// and include it in the response:
    out([
        'poll'    => $p,
        'options' => $options,
        'counts'  => $counts,
        'voters'  => array_values($byName),
        'voters_by_option' => $byOption,   // ← NEW
    ]);
}

/**
 * Vote on poll (Professor only)
 * 
 * POST /?action=vote_poll
 * 
 * Allows a professor to vote on a poll. Each professor can only
 * vote once per poll. The vote can include multiple options if
 * the poll allows multiple selections.
 * 
 * Authentication: Required (Bearer token)
 * Roles: professor
 * 
 * Request Body (JSON):
 * {
 *   "poll_id": 42,                    // Required: Valid poll ID
 *   "option_ids": [1, 3, 5]           // Required: Array of option IDs to vote for
 * }
 * 
 * Response (200):
 * {
 *   "ok": true
 * }
 * 
 * Response (400):
 * {
 *   "error": "poll_id required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "option_ids required"
 * }
 * 
 * Response (400):
 * {
 *   "error": "multiple selections not allowed"
 * }
 * 
 * Response (400):
 * {
 *   "error": "invalid option_ids"
 * }
 * 
 * Response (400):
 * {
 *   "error": "invalid option"
 * }
 * 
 * Response (400):
 * {
 *   "error": "already_voted"
 * }
 * 
 * Response (404):
 * {
 *   "error": "poll not found"
 * }
 * 
 * Response (403):
 * {
 *   "error": "unauthorized_or_forbidden",
 *   "roles_required": ["professor"]
 * }
 */
if ($action === 'vote_poll' && $method === 'POST') {
    $u = require_role($pdo, ['professor']);
    ensure_polls_schema($pdo); // just in case this endpoint is called before any poll creation

    $in = json_input();
    $pid = (int)($in['poll_id'] ?? 0);
    $selected = $in['option_ids'] ?? [];
    if ($pid<=0) out(['error'=>'poll_id required'],400);
    if (!is_array($selected) || count($selected)===0) out(['error'=>'option_ids required'],400);

    // Load poll settings
    $st = $pdo->prepare("SELECT allow_multi FROM polls WHERE id=:id");
    $st->execute([':id'=>$pid]);
    $poll = $st->fetch();
    if (!$poll) out(['error'=>'poll not found'],404);

    if (!$poll['allow_multi'] && count($selected) > 1) {
        out(['error'=>'multiple selections not allowed'],400);
    }

    // Normalize option IDs
    $ids = array_values(array_unique(array_filter(array_map('intval', $selected), fn($v)=>$v>0)));
    if (count($ids)===0) out(['error'=>'invalid option_ids'],400);

    // Validate options belong to poll
    $place = implode(',', array_fill(0, count($ids), '?'));
    $valid = $pdo->prepare("SELECT id FROM poll_options WHERE poll_id=? AND id IN ($place)");
    $params = array_merge([$pid], $ids);
    $valid->execute($params);
    $ok = $valid->fetchAll(PDO::FETCH_COLUMN, 0);
    if (count($ok) !== count($ids)) out(['error'=>'invalid option'],400);

    $pdo->beginTransaction();
    try {
        // Atomic guard: one submission per (poll, voter)
        $guard = $pdo->prepare("
            INSERT INTO poll_voters(poll_id, voter_id, voter_name)
            VALUES(:p,:v,:n)
            ON CONFLICT (poll_id, voter_id) DO NOTHING
        ");
        $guard->execute([':p'=>$pid, ':v'=>$u['id'], ':n'=>$u['fullname']]);

        if ($guard->rowCount() === 0) {
            // The guard row already exists -> this professor already voted
            $pdo->rollBack();
            out(['error'=>'already_voted'],400);
        }

        // Record the selections (one row per chosen option)
        $ins = $pdo->prepare("
            INSERT INTO poll_votes(poll_id, option_id, voter_id, voter_name)
            VALUES(:p,:o,:v,:n)
        ");
        foreach ($ids as $oid) {
            $ins->execute([':p'=>$pid, ':o'=>$oid, ':v'=>$u['id'], ':n'=>$u['fullname']]);
        }

        $pdo->commit();
        out(['ok'=>true]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

// Delete poll (Manager/Assistant only)
if ($action === 'delete_poll' && $method === 'POST') {
    require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $pid = (int)($in['poll_id'] ?? 0);
    if ($pid<=0) out(['error'=>'poll_id required'],400);
    $pdo->prepare("DELETE FROM polls WHERE id=:id")->execute([':id'=>$pid]);
    out(['ok'=>true]);
}
/**
 * Export polls to Excel (Manager/Assistant only)
 * 
 * POST /?action=export_polls
 * 
 * Exports polls to Excel format with comprehensive voting data.
 * Supports three export types:
 * - all: Export all polls in the system
 * - selected: Export specific polls by ID
 * - single: Export a single poll by ID
 * 
 * The Excel file contains:
 * - Poll information and metadata
 * - Voting matrix showing who voted for what
 * - Vote summaries with percentages
 * - Time-slot information (for time-slot polls)
 * 
 * Authentication: Required (Bearer token)
 * Roles: manager, assistant
 * 
 * Request Body (JSON):
 * {
 *   "export_type": "all"              // Required: "all", "selected", or "single"
 * }
 * 
 * OR
 * 
 * {
 *   "export_type": "selected",        // Required: "selected"
 *   "poll_ids": [1, 2, 3]             // Required: Array of poll IDs
 * }
 * 
 * OR
 * 
 * {
 *   "export_type": "single",          // Required: "single"
 *   "poll_ids": [42]                  // Required: Array with single poll ID
 * }
 * 
 * Response: Excel file download
 * - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 * - Filename: varies based on export type and date
 * 
 * Response (400):
 * {
 *   "error": "poll_ids required for selected export"
 * }
 * 
 * Response (404):
 * {
 *   "error": "no polls found for export"
 * }
 * 
 * Response (500):
 * {
 *   "error": "database_query_failed",
 *   "detail": "Database error message"
 * }
 * 
 * Response (500):
 * {
 *   "error": "excel_generation_failed",
 *   "detail": "Excel generation error message"
 * }
 * 
 * Response (500):
 * {
 *   "error": "excel_output_failed",
 *   "detail": "Excel output error message"
 * }
 * 
 * Response (403):
 * {
 *   "error": "unauthorized_or_forbidden",
 *   "roles_required": ["manager", "assistant"]
 * }
 */
if ($action === 'export_polls' && $method === 'POST') {
    $u = require_role($pdo, ['manager','assistant']);
    
    // Increase memory limit for Excel generation
    ini_set('memory_limit', '512M');
    
    $in = json_input();
    $pollIds = $in['poll_ids'] ?? [];
    $exportType = $in['export_type'] ?? 'all'; // 'all', 'selected', 'single'
    
    // Validate input
    if ($exportType === 'selected' && empty($pollIds)) {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error'=>'poll_ids required for selected export']);
        exit;
    }
    
    // Build query based on export type
    $whereClause = '';
    $params = [];
    
    if ($exportType === 'single' && !empty($pollIds)) {
        $whereClause = 'WHERE p.id = :poll_id';
        $params[':poll_id'] = (int)$pollIds[0];
    } elseif ($exportType === 'selected' && !empty($pollIds)) {
        // Limit to maximum 20 polls to prevent memory issues
        $limitedPollIds = array_slice($pollIds, 0, 20);
        $placeholders = implode(',', array_fill(0, count($limitedPollIds), '?'));
        $whereClause = "WHERE p.id IN ($placeholders)";
        $params = array_map('intval', $limitedPollIds);
        
        if (count($pollIds) > 20) {
            // Log warning about limit
            error_log("Export limited to 20 polls out of " . count($pollIds) . " requested");
        }
    } else {
        // For 'all' export, limit to most recent 20 polls
        $whereClause = 'ORDER BY p.created_at DESC, p.id DESC LIMIT 20';
    }
    
    // Get polls data with author information
    $pollsQuery = "
        SELECT p.id, p.title, p.description, p.allow_multi, p.require_names, p.mode,
               p.start_ts, p.end_ts, p.defense_minutes, p.buffer_minutes,
               p.breaks_count, p.break_minutes, p.per_slot_note, p.created_at,
               u.fullname AS author
        FROM polls p
        LEFT JOIN app_users u ON u.id = p.created_by
        " . ($exportType === 'all' ? '' : $whereClause) . "
        ORDER BY p.created_at DESC, p.id DESC
        " . ($exportType === 'all' ? 'LIMIT 20' : '') . "
    ";
    
    try {
        $pollsStmt = $pdo->prepare($pollsQuery);
        $pollsStmt->execute($params);
        $polls = $pollsStmt->fetchAll();
        
        if (empty($polls)) {
            http_response_code(404);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error'=>'no polls found for export']);
            exit;
        }
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error'=>'database_query_failed', 'detail'=>$e->getMessage()]);
        exit;
    }
    
    // Generate Excel data with voting matrix and charts
    try {
        $excelData = generatePollExcelData($pdo, $polls);
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error'=>'excel_generation_failed', 'detail'=>$e->getMessage()]);
        exit;
    }
    
    // Clear any existing output buffers to prevent header conflicts
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Generate descriptive filename based on export type
    $filename = '';
    if ($exportType === 'all') {
        $filename = 'all_polls_' . date('Y-m-d_H-i-s') . '.xlsx';
    } elseif ($exportType === 'single' && !empty($pollIds)) {
        // Get the single poll title for filename
        $singlePoll = $polls[0];
        $pollTitle = preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $singlePoll['title']); // Remove special chars
        $pollTitle = substr($pollTitle, 0, 30); // Limit length
        $pollTitle = trim($pollTitle);
        $filename = $pollTitle . '_' . date('Y-m-d_H-i-s') . '.xlsx';
    } elseif ($exportType === 'selected' && !empty($pollIds)) {
        $filename = 'selected_polls_' . date('Y-m-d_H-i-s') . '.xlsx';
    } else {
        $filename = 'polls_export_' . date('Y-m-d_H-i-s') . '.xlsx';
    }
    
    // Set headers for Excel file download
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: max-age=0');
    header('Pragma: public');
    
    // Output Excel file with voting matrix and visual charts
    try {
        outputExcelFile($excelData);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error'=>'excel_output_failed', 'detail'=>$e->getMessage()]);
        exit;
    }
}

// Delete poll option (Manager/Assistant only)
if ($action === 'delete_poll_option' && $method === 'POST') {
    require_role($pdo, ['manager','assistant']);
    $in = json_input();
    $pid = (int)($in['poll_id'] ?? 0);
    $oid = (int)($in['option_id'] ?? 0);
    if ($pid <= 0 || $oid <= 0) out(['error'=>'poll_id and option_id required'],400);

    // Ensure option belongs to poll
    $st = $pdo->prepare("SELECT 1 FROM poll_options WHERE id=:oid AND poll_id=:pid");
    $st->execute([':oid'=>$oid, ':pid'=>$pid]);
    if (!$st->fetchColumn()) out(['error'=>'option not found for this poll'],404);

    // ON DELETE CASCADE on poll_votes(option_id) handles vote cleanup
    $del = $pdo->prepare("DELETE FROM poll_options WHERE id=:oid AND poll_id=:pid");
    $del->execute([':oid'=>$oid, ':pid'=>$pid]);

    out(['ok'=>true, 'deleted_option_id'=>$oid]);
}

// Professor requests change to different window (Professor only)
if ($action === 'prof_request_change' && $method === 'POST') {
    $u = require_role($pdo, ['professor']);
    $in = json_input();
    $sourceOfferId = (int)($in['source_offer_id'] ?? 0);
    $toWindowId = (int)($in['to_window_id'] ?? 0);
    $comment = trim($in['comment'] ?? '');
    $selectedSlots = $in['selected_slots'] ?? [];
    
    if ($sourceOfferId <= 0) out(['error'=>'source_offer_id required'], 400);
    if ($toWindowId <= 0) out(['error'=>'to_window_id required'], 400);
    
    // Validate source offer belongs to this professor
    $st = $pdo->prepare("SELECT * FROM window_offers WHERE id = :id AND professor_id = :prof_id");
    $st->execute([':id' => $sourceOfferId, ':prof_id' => $u['id']]);
    $sourceOffer = $st->fetch();
    if (!$sourceOffer) out(['error'=>'source offer not found'], 404);
    
    // Validate target window exists
    $st = $pdo->prepare("SELECT * FROM manager_windows WHERE id = :id");
    $st->execute([':id' => $toWindowId]);
    $targetWindow = $st->fetch();
    if (!$targetWindow) out(['error'=>'target window not found'], 404);
    
    $pdo->beginTransaction();
    try {
        // Instead of creating a new offer, modify the existing source offer
        // to indicate a change request to a different window
        $offerId = $sourceOfferId;
        
        // Update the source offer to change_requested status and store the target window info
        $st = $pdo->prepare("UPDATE window_offers SET 
            status = 'change_requested', 
            comment = :comment, 
            requested_window_id = :requested_window_id,
            updated_at = NOW() 
            WHERE id = :id");
        $st->execute([
            ':comment' => $comment ?: null, 
            ':requested_window_id' => $toWindowId,
            ':id' => $sourceOfferId
        ]);
        
        // Handle slot selections if provided
        if (!empty($selectedSlots) && $offerId) {
            // Clear existing slot selections for this offer
            $clear = $pdo->prepare("DELETE FROM offer_slots WHERE offer_id = :id");
            $clear->execute([':id' => $offerId]);
            
            // Insert new slot selections
            $slots = generateWindowSlots($targetWindow);
            $slotIns = $pdo->prepare("INSERT INTO offer_slots(offer_id, slot_index, slot_start_ts, slot_end_ts, is_selected) VALUES(:oid, :idx, :start, :end, :selected)");
            
            foreach ($slots as $index => $slot) {
                $isSelected = false;
                foreach ($selectedSlots as $selectedSlot) {
                    if ($selectedSlot['slot_index'] == $index) {
                        $isSelected = true;
                        break;
                    }
                }
                
                $slotIns->bindValue(':oid', $offerId, PDO::PARAM_INT);
                $slotIns->bindValue(':idx', $index, PDO::PARAM_INT);
                $slotIns->bindValue(':start', $slot['start_ts'], PDO::PARAM_STR);
                $slotIns->bindValue(':end', $slot['end_ts'], PDO::PARAM_STR);
                $slotIns->bindValue(':selected', $isSelected, PDO::PARAM_BOOL);
                $slotIns->execute();
            }
        }
        
        $pdo->commit();
        out(['ok' => true, 'offer_id' => $offerId, 'slots_selected' => count($selectedSlots)]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

/* ==========================================================
   FALLBACK - INVALID ENDPOINTS
   ========================================================== */

// Return 404 for any unrecognized endpoints
out([
    'error'=>'not_found',
    'hint'=>'actions: whoami|users|list_users|create_user|set_active|delete_user|create_window|windows|update_window|delete_window|offer_window|update_offer|delete_offer|my_offers|respond_offer|finalize_offer|slots|notes|save_note|delete_note|available_windows|prof_request_change|events|events_poll|create_poll|polls|poll_results|vote_poll|delete_poll|export_polls'
], 404);