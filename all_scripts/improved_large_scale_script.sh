#!/bin/bash

set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}
BASE_URL="http://localhost:8000/backend/index.php"
MANAGER_TOKEN="devtoken"
curl_json() {
    local method="$1"
    local url="$2"
    local data="$3"
    local token="$4"
    
    if [[ -n "$data" ]]; then
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            "$url"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $token" \
            "$url"
    fi
}

json_get() {
    echo "$1" | jq -r "$2" 2>/dev/null || echo "null"
}
log "Checking database status..."
user_count=$(curl_json "GET" "$BASE_URL?action=users" "" "$MANAGER_TOKEN" | jq -r 'length' 2>/dev/null || echo "0")

if [[ "$user_count" -gt 10 ]]; then
    log "Database appears to be populated with $user_count users. Skipping initial setup."
    log "Proceeding with offer responses and exploration..."
    
    professor_tokens=()
    for i in {32..130..2}; do
        professor_tokens+=("prof_token_$i")
    done
    
    log "Simulating professor responses with existing data..."
else
    log "Setting up fresh database with improved logic..."
    log "Step 1: Creating 50 professors..."
    professor_names=(
        "Dr. Alice Johnson" "Prof. Bob Smith" "Dr. Carol Davis" "Prof. David Wilson" "Dr. Emma Brown"
        "Prof. Frank Miller" "Dr. Grace Lee" "Prof. Henry Taylor" "Dr. Irene Garcia" "Prof. Jack Martinez"
        "Dr. Kate Anderson" "Prof. Larry Thompson" "Dr. Maria White" "Prof. Nick Harris" "Dr. Olivia Clark"
        "Prof. Paul Lewis" "Dr. Quinn Robinson" "Prof. Rachel Walker" "Dr. Sam Hall" "Prof. Tina Young"
        "Dr. Uma Allen" "Prof. Victor King" "Dr. Wendy Wright" "Prof. Xavier Lopez" "Dr. Yara Hill"
        "Prof. Zach Scott" "Dr. Amy Green" "Prof. Ben Baker" "Dr. Cindy Adams" "Prof. Dan Nelson"
        "Dr. Eva Carter" "Prof. Fred Mitchell" "Dr. Gina Perez" "Prof. Hugo Roberts" "Dr. Ivy Turner"
        "Prof. Jake Phillips" "Dr. Kelly Campbell" "Prof. Leo Parker" "Dr. Mia Evans" "Prof. Noah Edwards"
        "Dr. Opal Collins" "Prof. Pete Stewart" "Dr. Quinn Sanchez" "Prof. Ruby Morris" "Dr. Sam Rogers"
        "Prof. Tom Reed" "Dr. Uma Cook" "Prof. Vince Morgan" "Dr. Wendy Bell" "Prof. Xavier Murphy"
    )

    professor_ids=()
    professor_tokens=()

    for name in "${professor_names[@]}"; do
        email=$(echo "$name" | tr ' ' '.' | tr '[:upper:]' '[:lower:]' | sed 's/\././g')"@university.edu"
        professor_data="{\"fullname\":\"$name\",\"email\":\"$email\",\"role\":\"professor\",\"password\":\"testpass123\"}"
        response=$(curl_json "POST" "$BASE_URL?action=create_user" "$professor_data" "$MANAGER_TOKEN")
        
        if echo "$response" | grep -q '"ok":true' && echo "$response" | grep -q '"id"'; then
            prof_id=$(echo "$response" | jq -r '.id')
            prof_token=$(echo "$response" | jq -r '.auth_token')
            if [[ "$prof_id" != "null" && "$prof_token" != "null" && "$prof_id" != "" && "$prof_token" != "" ]]; then
                professor_ids+=("$prof_id")
                professor_tokens+=("$prof_token")
                success "Created professor: $name (ID: $prof_id)"
            else
                error "Failed to parse professor data for $name: $response"
                exit 1
            fi
        else
            error "Failed to create professor $name: $response"
            exit 1
        fi
    done

    log "Step 2: Creating 5 assistants..."
    assistant_names=("Test Assistant 1" "Test Assistant 2" "Test Assistant 3" "Test Assistant 4" "Test Assistant 5")

    assistant_ids=()
    assistant_tokens=()
    for name in "${assistant_names[@]}"; do
        email=$(echo "$name" | tr ' ' '.' | tr '[:upper:]' '[:lower:]' | sed 's/\././g')"@university.edu"
        assistant_data="{\"fullname\":\"$name\",\"email\":\"$email\",\"role\":\"assistant\",\"password\":\"testpass123\"}"
        response=$(curl_json "POST" "$BASE_URL?action=create_user" "$assistant_data" "$MANAGER_TOKEN")
        
        if echo "$response" | grep -q '"ok":true' && echo "$response" | grep -q '"id"'; then
            assistant_id=$(echo "$response" | jq -r '.id')
            assistant_token=$(echo "$response" | jq -r '.auth_token')
            if [[ "$assistant_id" != "null" && "$assistant_token" != "null" && "$assistant_id" != "" && "$assistant_token" != "" ]]; then
                assistant_ids+=("$assistant_id")
                assistant_tokens+=("$assistant_token")
                success "Created assistant: $name (ID: $assistant_id)"
            else
                error "Failed to parse assistant data for $name: $response"
                exit 1
            fi
        else
            error "Failed to create assistant $name: $response"
            exit 1
        fi
    done

    log "Step 3: Creating diverse polls for voting..."
    poll_titles=(
        "Preferred Defense Time - September" "Defense Duration Preference - September"
        "Preferred Defense Time - October" "Defense Duration Preference - October"
        "Available Time Slots - November" "Available Time Slots - December"
        "Available Time Slots - January" "Available Time Slots - February"
        "Available Time Slots - March"
    )

    poll_modes=("text" "text" "text" "text" "timeslots" "timeslots" "timeslots" "timeslots" "timeslots")

    for i in "${!poll_titles[@]}"; do
        title="${poll_titles[$i]}"
        mode="${poll_modes[$i]}"
        
        if [[ "$mode" == "text" ]]; then
            poll_data="{\"title\":\"$title\",\"mode\":\"$mode\",\"description\":\"Please provide your preferences for $title\",\"options\":[\"Morning (9-12)\",\"Afternoon (12-17)\",\"Evening (17-20)\",\"Flexible\"]}"
        else
            current_date=$(date -u +"%Y-%m-%d")
            start_ts="${current_date}T09:00:00Z"
            end_ts="${current_date}T17:00:00Z"
            poll_data="{\"title\":\"$title\",\"mode\":\"$mode\",\"description\":\"Please select your preferred time slots\",\"start_ts\":\"$start_ts\",\"end_ts\":\"$end_ts\",\"defense_minutes\":20,\"buffer_minutes\":5}"
        fi
        
        response=$(curl_json "POST" "$BASE_URL?action=create_poll" "$poll_data" "$MANAGER_TOKEN")
        
        if echo "$response" | grep -q '"ok":true' || echo "$response" | grep -q '"id"'; then
            poll_id=$(echo "$response" | jq -r '.id')
            success "Created poll: $title (ID: $poll_id) - Mode: $mode"
        else
            error "Failed to create poll $title: $response"
        fi
    done

    log "Step 4: Professors voting on polls (70% participation rate)..."
    voting_professors=()
    for i in "${!professor_tokens[@]}"; do
        if [[ $((RANDOM % 10)) -lt 7 ]]; then
            voting_professors+=("$i")
        fi
    done
    
    log "Selected ${#voting_professors[@]} professors to participate in voting"
    
    for prof_index in "${voting_professors[@]}"; do
        prof_token="${professor_tokens[$prof_index]}"
        prof_name="${professor_names[$prof_index]}"
        
        polls_to_vote=$((3 + RANDOM % 4))
        poll_indices=()
        for ((j=0; j<polls_to_vote; j++)); do
            poll_indices+=($((RANDOM % 9)))
        done
        
        for poll_idx in "${poll_indices[@]}"; do
            poll_id=$((poll_idx + 1))
            
            if [[ $poll_idx -lt 4 ]]; then
                responses=("Morning sessions work best" "Afternoon preferred" "Flexible with timing" "Weekdays only" "Weekends acceptable")
                vote_text="${responses[$((RANDOM % ${#responses[@]}))]}"
                vote_data="{\"poll_id\":$poll_id,\"vote_text\":\"$vote_text\"}"
            else
                time_slots=("09:00-11:00" "11:00-13:00" "13:00-15:00" "15:00-17:00")
                selected_slot="${time_slots[$((RANDOM % ${#time_slots[@]}))]}"
                vote_data="{\"poll_id\":$poll_id,\"vote_text\":\"$selected_slot\"}"
            fi
            
            response=$(curl_json "POST" "$BASE_URL?action=vote_poll" "$vote_data" "$prof_token")
            if [[ $(echo "$response" | grep -o 'HTTP [0-9]*' | cut -d' ' -f2) == "200" ]]; then
                success "Professor voted on poll $poll_id"
            fi
        done
    done

    log "Step 5: Creating defense windows..."
    window_titles=(
        "September Defense Session 1" "September Defense Session 2"
        "October Defense Session 1" "October Defense Session 2"
        "November Defense Session 1" "November Defense Session 2"
        "December Defense Session 1" "December Defense Session 2"
        "January Defense Session 1" "January Defense Session 2"
    )

    window_ids=()
    assistant_index=0
    for title in "${window_titles[@]}"; do
        assistant_token="${assistant_tokens[$assistant_index]}"
        
        days_from_now=$((7 + (assistant_index * 7)))
        start_time=$(date -v+${days_from_now}d +%Y-%m-%dT09:00:00Z 2>/dev/null || date -d "+$days_from_now days 09:00" +%Y-%m-%dT09:00:00Z 2>/dev/null || date +%Y-%m-%dT09:00:00Z)
        end_time=$(date -v+${days_from_now}d +%Y-%m-%dT17:00:00Z 2>/dev/null || date -d "+$days_from_now days 17:00" +%Y-%m-%dT17:00:00Z 2>/dev/null || date +%Y-%m-%dT17:00:00Z)
        
        window_data="{\"title\":\"$title\",\"start_ts\":\"$start_time\",\"end_ts\":\"$end_time\",\"defense_minutes\":20,\"buffer_minutes\":5}"
        response=$(curl_json "POST" "$BASE_URL?action=create_window" "$window_data" "$assistant_token")
        
        if echo "$response" | grep -q '"ok":true' || echo "$response" | grep -q '"id"'; then
            window_id=$(echo "$response" | jq -r '.id')
            window_ids+=("$window_id")
            success "Created window: $title (ID: $window_id) by Assistant $((assistant_index + 1))"
        else
            error "Failed to create window $title: $response"
            exit 1
        fi
        
        assistant_index=$((assistant_index + 1))
        if [[ $assistant_index -ge ${#assistant_tokens[@]} ]]; then
            assistant_index=0
        fi
    done

    log "Step 6: Assigning professors to windows (ENSURING ALL PROFESSORS GET OFFERS)..."
    offer_count=0
    assistant_index=0
    log "First pass: Ensuring every professor gets at least one offer..."
    for prof_index in "${!professor_ids[@]}"; do
        prof_id="${professor_ids[$prof_index]}"
        window_id="${window_ids[$((prof_index % ${#window_ids[@]}))]}"
        assistant_token="${assistant_tokens[$((assistant_index % ${#assistant_tokens[@]}))]}"
        
        offer_data="{\"window_id\":$window_id,\"professor_id\":$prof_id,\"comment\":\"Primary assignment - every professor gets at least one offer\"}"
        response=$(curl_json "POST" "$BASE_URL?action=offer_window" "$offer_data" "$assistant_token")
        
        if echo "$response" | grep -q '"ok":true' || echo "$response" | grep -q '"id"'; then
            offer_count=$((offer_count + 1))
            success "Created primary offer: Window $window_id → Professor $prof_id"
        else
            error "Failed to create primary offer: $response"
        fi
        
        assistant_index=$((assistant_index + 1))
    done
    
    log "Second pass: Adding additional offers for some professors..."
    additional_offers=$((RANDOM % 20 + 10))
    
    for ((i=0; i<additional_offers; i++)); do
        prof_index=$((RANDOM % ${#professor_ids[@]}))
        window_index=$((RANDOM % ${#window_ids[@]}))
        prof_id="${professor_ids[$prof_index]}"
        window_id="${window_ids[$window_index]}"
        assistant_token="${assistant_tokens[$((assistant_index % ${#assistant_tokens[@]}))]}"
        
        offer_data="{\"window_id\":$window_id,\"professor_id\":$prof_id,\"comment\":\"Additional assignment - some professors get multiple offers\"}"
        response=$(curl_json "POST" "$BASE_URL?action=offer_window" "$offer_data" "$assistant_token")
        
        if echo "$response" | grep -q '"ok":true' || echo "$response" | grep -q '"id"'; then
            offer_count=$((offer_count + 1))
            success "Created additional offer: Window $window_id → Professor $prof_id"
        else
            error "Failed to create additional offer: $response"
        fi
        
        assistant_index=$((assistant_index + 1))
    done

    log "Total offers created: $offer_count"
    log "Every professor now has at least one offer!"
fi

log "Step 7: Professors responding to offers through their consoles..."
accepted_count=0
declined_count=0
request_change_count=0

log "Simulating professors logging into their consoles and responding to offers..."

for prof_index in "${!professor_tokens[@]}"; do
    prof_token="${professor_tokens[$prof_index]}"
    prof_name="${professor_names[$prof_index]}"
    
    log "Professor $prof_name logging into console..."
    
    response=$(curl_json "GET" "$BASE_URL?action=my_offers" "" "$prof_token")
    http_code=$(echo "$response" | grep -o 'HTTP [0-9]*' | cut -d' ' -f2)
    
    if [[ "$http_code" == "200" ]]; then
        offer_ids=$(echo "$response" | jq -r '.[] | .id' 2>/dev/null | grep -v "null" | tr '\n' ' ')
        offer_count=$(echo "$offer_ids" | wc -w | tr -d ' ')
        
        if [[ -n "$offer_ids" && $offer_count -gt 0 ]]; then
            log "Professor $prof_name has $offer_count offer(s) to review"
            
            for offer_id in $offer_ids; do
                if [[ -n "$offer_id" && "$offer_id" != "null" ]]; then
                    log "Professor $prof_name reviewing offer $offer_id"
                    
                    response_decision=$((RANDOM % 10))
                    
                    if [[ $response_decision -lt 5 ]]; then
                        accept_data="{\"offer_id\":$offer_id,\"decision\":\"accept\",\"comment\":\"Time slot works well for me\"}"
                        accept_response=$(curl_json "POST" "$BASE_URL?action=respond_offer" "$accept_data" "$prof_token")
                        if [[ $(echo "$accept_response" | grep -o 'HTTP [0-9]*' | cut -d' ' -f2) == "200" ]]; then
                            accepted_count=$((accepted_count + 1))
                            success "Professor $prof_name accepted offer $offer_id"
                        else
                            error "Failed to accept offer $offer_id: $accept_response"
                        fi
                    elif [[ $response_decision -lt 8 ]]; then
                        decline_data="{\"offer_id\":$offer_id,\"decision\":\"reject\",\"comment\":\"Time slot conflicts with existing commitments\"}"
                        decline_response=$(curl_json "POST" "$BASE_URL?action=respond_offer" "$decline_data" "$prof_token")
                        if [[ $(echo "$decline_response" | grep -o 'HTTP [0-9]*' | cut -d' ' -f2) == "200" ]]; then
                            declined_count=$((declined_count + 1))
                            success "Professor $prof_name declined offer $offer_id"
                        else
                            error "Failed to decline offer $offer_id: $decline_response"
                        fi
                    elif [[ $response_decision -lt 9 ]]; then
                        current_date=$(date -u +"%Y-%m-%d")
                        request_change_data="{\"offer_id\":$offer_id,\"decision\":\"change\",\"comment\":\"Would prefer morning slot if available\",\"requested_start\":\"${current_date}T09:00:00Z\",\"requested_end\":\"${current_date}T11:00:00Z\"}"
                        request_change_response=$(curl_json "POST" "$BASE_URL?action=respond_offer" "$request_change_data" "$prof_token")
                        if [[ $(echo "$request_change_response" | grep -o 'HTTP [0-9]*' | cut -d' ' -f2) == "200" ]]; then
                            request_change_count=$((request_change_count + 1))
                            success "Professor $prof_name requested change for offer $offer_id"
                        else
                            error "Failed to request change for offer $offer_id: $request_change_response"
                        fi
                    fi
                    
                    sleep 0.1
                fi
            done
        else
            log "Professor $prof_name has no offers to review"
        fi
    else
        error "Professor $prof_name cannot view offers: $response"
    fi
    
    log "Professor $prof_name console session completed"
done

log "Professor console responses completed:"
log "  - Accepted: $accepted_count offers"
log "  - Declined: $declined_count offers" 
log "  - Requested changes: $request_change_count offers"

log "Step 8: Manager finalizing accepted offers..."
finalized_count=0

response=$(curl_json "GET" "$BASE_URL?action=my_offers" "" "$MANAGER_TOKEN")
if [[ $(echo "$response" | grep -o 'HTTP [0-9]*' | cut -d' ' -f2) == "200" ]]; then
    accepted_offers=$(echo "$response" | jq -r '.[] | select(.status == "accepted") | .id' 2>/dev/null | grep -v "null")
    
    for offer_id in $accepted_offers; do
        if [[ -n "$offer_id" && "$offer_id" != "null" ]]; then
            finalize_data="{\"offer_id\":$offer_id}"
            finalize_response=$(curl_json "POST" "$BASE_URL?action=finalize_offer" "$finalize_data" "$MANAGER_TOKEN")
            
            if [[ $(echo "$finalize_response" | grep -o 'HTTP [0-9]*' | cut -d' ' -f2) == "200" ]]; then
                finalized_count=$((finalized_count + 1))
                success "Finalized offer $offer_id"
            else
                error "Failed to finalize offer $offer_id: $finalize_response"
            fi
        fi
    done
fi

log "Finalized $finalized_count offers"

log "Step 9: Verifying results..."

total_professors=$(curl_json "GET" "$BASE_URL?action=users" "" "$MANAGER_TOKEN" | jq -r '[.[] | select(.role == "professor")] | length' 2>/dev/null || echo "0")
total_offers=$(curl_json "GET" "$BASE_URL?action=my_offers" "" "$MANAGER_TOKEN" | jq -r 'length' 2>/dev/null || echo "0")
total_slots=$(curl_json "GET" "$BASE_URL?action=slots" "" "$MANAGER_TOKEN" | jq -r 'length' 2>/dev/null || echo "0")

log "Final Statistics:"
log "  - Total professors: $total_professors"
log "  - Total offers created: $total_offers"
log "  - Total defense slots: $total_slots"
log "  - Professors who voted: ${#voting_professors[@]} (70% participation)"
log "  - Professors who didn't vote: $((total_professors - ${#voting_professors[@]})) (30% non-participation)"

log "=================================================="
log "IMPROVED LARGE SCALE SCRIPT COMPLETED SUCCESSFULLY!"
log "Every professor now has at least one offer!"
log "Some professors may have 0 slots if they declined all offers"
log "Some professors didn't vote (realistic scenario)"
log "=================================================="
