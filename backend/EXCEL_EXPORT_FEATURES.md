# Excel Export Features Documentation

## Overview
The poll export system has been enhanced with comprehensive Excel export functionality, including voting matrix visualization for clean data presentation.

## Features Added

### 1. **Poll Export Endpoint**
- **Endpoint**: `POST /index.php?action=export_polls`
- **Authorization**: Manager and Assistant roles only
- **Parameters**:
  - `export_type`: 'all', 'selected', or 'single'
  - `poll_ids`: Array of poll IDs (required for 'selected' and 'single')

### 2. **Multi-Sheet Excel Structure**
Each poll gets its own worksheet containing:

#### **A. Poll Information Section**
- Title, Description, Author
- Created date, Mode, Settings
- Time slot information (if applicable)

#### **B. Voting Matrix Section**
- **Vertical**: Professor names
- **Horizontal**: Poll options
- **Data**: Checkmarks (✓) showing which options each professor voted for
- **Clean Format**: No more comma-separated messy lists

#### **C. Vote Summary Section**
- Option labels, vote counts, percentages
- Total votes calculation



### 3. **Technical Implementation**

#### **Dependencies**
- `phpoffice/phpspreadsheet` via Composer
- PHP 8.4+ compatibility

#### **Key Functions**

##### `generatePollExcelData(PDO $pdo, array $polls): array`
- Processes poll data from database
- Fetches options, votes, and voter information
- Calculates vote percentages
- Sanitizes sheet names for Excel compatibility
- Returns structured data for Excel generation

##### `outputExcelFile(array $excelData): void`
- Creates multi-sheet Excel file using PhpSpreadsheet
- Implements voting matrix with professor names vs options
- Auto-sizes columns for optimal display
- Saves directly to output stream for compatibility

### 4. **Frontend Integration**

#### **Manager Console Features**
- **Export All**: Downloads all polls with charts
- **Export Selected**: Checkbox selection for specific polls
- **Export Single**: Individual poll export button
- **Visual Feedback**: Toast notifications for success/error

#### **UI Elements**
- Export buttons with icons (📊)
- Poll selection checkboxes
- Select All/Deselect All functionality
- Individual export buttons per poll

### 5. **Error Handling**
- **Header Conflict Prevention**: Output buffer management
- **Authentication**: Role-based access control
- **File Compatibility**: Numbers/Excel compatibility
- **Detailed Error Messages**: JSON error responses

### 6. **File Format**
- **Format**: Microsoft Excel 2007+ (.xlsx)
- **Compatibility**: Works with Numbers, Excel, Google Sheets
- **Size**: Optimized for performance
- **Naming**: Descriptive filenames based on export type:
  - **All Polls**: `all_polls_YYYY-MM-DD_HH-MM-SS.xlsx`
  - **Single Poll**: `[Poll Title]_YYYY-MM-DD_HH-MM-SS.xlsx`
  - **Selected Polls**: `selected_polls_YYYY-MM-DD_HH-MM-SS.xlsx`

## Usage Examples

### Export All Polls
```javascript
await fetch(API + '?action=export_polls', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    },
    body: JSON.stringify({
        export_type: 'all',
        poll_ids: []
    })
});
```

### Export Selected Polls
```javascript
await fetch(API + '?action=export_polls', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    },
    body: JSON.stringify({
        export_type: 'selected',
        poll_ids: [123, 456, 789]
    })
});
```

## Benefits
1. **Professional Reports**: Clean, organized Excel format
2. **Visual Analysis**: Charts for quick data interpretation
3. **Voting Transparency**: Clear professor voting patterns
4. **Cross-Platform**: Works with all major spreadsheet applications
5. **Scalable**: Handles multiple polls efficiently
6. **User-Friendly**: Intuitive export interface

## Maintenance
- **Dependencies**: Managed via Composer
- **Code Organization**: Well-documented functions
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized for large datasets
