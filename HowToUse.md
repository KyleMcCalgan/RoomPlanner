# Space Planner - Refactored Project Specification

## Project Overview

A web-based space planning application that allows users to check if items will fit into a defined space. Users define a floor plan with specific dimensions and add objects with height, width, and length properties. Multiple views (top-down and side views) visualize object placement with real-time statistics about space utilization.

---

## Current Implementation Status

**Last Updated:** November 2025 (Post-Phase 7.1-7.4)
**Current Status:** Windows Complete, Ready for Doors (Phase 7.5+)
**Completed Phases:** 1-6, 7.1-7.4 (Foundation, Objects, Views, Windows)
**Remaining Phases:** 7.5-7.10 (Doors), 8-10 (Statistics, Export, Polish)

### ✅ What's Working Now:
- ✓ Room creation and visualization with grid pattern
- ✓ Object creation, placement, movement, rotation, deletion
- ✓ Collision detection with room boundaries and other objects
- ✓ Per-object collision toggle for intentional overlapping/stacking
- ✓ **Intelligent stacking system based on creation order**
- ✓ Real-time statistics with accurate overlap handling
- ✓ Dark theme interface
- ✓ **All four views: Top, Front, Left, Right with hotkey switching (1-4)**
- ✓ **Full object editing modal with position fine-tuning**
- ✓ Context menu (right-click) for object actions
- ✓ Object duplication functionality
- ✓ Transparent objects with colored outlines
- ✓ Selection and manipulation in all views
- ✓ **Windows system with full interactivity (Phases 7.1-7.4)**
  - Window creation, placement, editing, deletion
  - PowerPoint-style resize handles (8 handles: corners + edges)
  - Drag to reposition along walls
  - Keyboard shortcuts (D=duplicate, Delete, Escape)
  - Window list in right panel with selection
  - Top view indicators (faint lines on walls)
  - Statistics (window count and total area)
  - Silent collision detection (prevents overlaps)

### 🔄 Key Design Changes from Original Spec:
1. **Dark Theme:** Changed from light to dark color scheme for better visibility
2. **No Header:** Removed top header bar; controls in left panel, toggle in footer
3. **Meters Display:** Units shown in meters (m) for user input/display, stored internally as cm
4. **Grid Pattern:** 1-meter grid overlay on room floor for spatial reference
5. **Transparent Objects:** Objects render with 15% fill opacity, 100% outline opacity
6. **Panel Position:** Side panel on left instead of right, collapsible
7. **Canvas Size:** Fixed 800x600 canvas with maximized viewport usage
8. **Creation-Order Stacking:** Objects stack based on creation order - first created = bottom of stack
9. **Bilateral Collision Toggle:** Stacking occurs when EITHER object has collision disabled

### 📋 Still To Implement:
- Phase 7.5-7.10: Doors feature with swing arc visualization
- Phase 8: Statistics refinements and additional metrics
- Phase 9: PNG export functionality
- Phase 10: Final polish and testing

### 💡 Potential Future Enhancements (Windows):
- Arrow key nudging for fine positioning
- Snap to grid/intervals along walls
- Alignment tools (align tops/bottoms, distribute evenly)
- Window size presets (small/medium/large)
- Multi-select windows (Ctrl+click)

---

## Core Philosophy

**File Organization:** Object-oriented, feature-based structure

- Each feature (Room, Objects, Windows/Doors) is self-contained
- Related concerns (logic, rendering, UI interactions) grouped together
- Clear boundaries between features with minimal cross-file dependencies

**User Flow:**

1. **Setup Phase:** Define room dimensions
2. **Creation Phase:** Create object with dimensions, name, color → click canvas to place
3. **Editing Phase:** Move objects, rotate, adjust properties, toggle collision
4. **Analysis Phase:** View statistics, switch between views, export

---

## Project File Structure

```
space-planner/
│
├── index.html                          # Single HTML file
│
├── css/
│   ├── base.css                        # Global styles, layout, theme
│   ├── canvas.css                      # Canvas and viewport styling
│   ├── panel.css                       # Control panels and sidebars
│   └── modal.css                       # Dialog/modal styling
│
├── js/
│   ├── core/
│   │   ├── app.js                      # Application entry point & state
│   │   ├── viewport.js                 # Canvas management & scaling
│   │   └── eventBus.js                 # Application event system
│   │
│   ├── features/
│   │   │
│   │   ├── room/
│   │   │   ├── Room.js                 # Room data model
│   │   │   ├── RoomController.js       # Room creation/management logic
│   │   │   ├── RoomView.js             # Room UI components & dialogs
│   │   │   └── RoomRenderer.js         # Room rendering logic
│   │   │
│   │   ├── objects/
│   │   │   ├── PlaceableObject.js      # Object data model
│   │   │   ├── ObjectManager.js        # Object CRUD & state management
│   │   │   ├── ObjectController.js     # Object interaction handlers
│   │   │   ├── ObjectView.js           # Object UI components
│   │   │   └── ObjectRenderer.js       # Object rendering logic
│   │   │
│   │   ├── windows/
│   │   │   ├── Window.js               # Window data model
│   │   │   ├── WindowController.js     # Window creation/management
│   │   │   ├── WindowView.js           # Window UI
│   │   │   └── WindowRenderer.js       # Window rendering
│   │   │
│   │   ├── doors/
│   │   │   ├── Door.js                 # Door data model
│   │   │   ├── DoorController.js       # Door creation/management
│   │   │   ├── DoorView.js             # Door UI
│   │   │   └── DoorRenderer.js         # Door rendering
│   │   │
│   │   └── views/
│   │       ├── ViewManager.js          # View state & switching
│   │       └── ViewRenderer.js         # Multi-view rendering orchestration
│   │
│   ├── services/
│   │   ├── CollisionService.js         # Collision detection logic
│   │   ├── StatisticsService.js        # Statistics calculations
│   │   ├── ExportService.js            # PNG export functionality
│   │   └── StorageService.js           # Project save/load (future)
│   │
│   └── utils/
│       ├── geometry.js                 # Mathematical utilities
│       ├── drawing.js                  # Canvas drawing helpers
│       └── helpers.js                  # General utilities
│
└── README.md                           # Documentation
```

**Rationale:**

- **`core/`** - Application infrastructure (bootstrap, events, viewport)
- **`features/`** - Each major domain (Room, Objects, Windows, Doors, Views) contains all related code
- **`services/`** - Shared business logic used by multiple features
- **`utils/`** - Pure utility functions with no dependencies
- **Fewer files per feature** means less file-hopping during development
- **Clear naming** (Controller/View/Renderer/Model) shows responsibility

**Currently Implemented Files:**
- ✓ All core/ files
- ✓ All features/room/ files
- ✓ All features/objects/ files
- ✓ All features/views/ files
- ✓ CollisionService.js (with window collision detection)
- ✓ StatisticsService.js
- ✓ **All features/windows/ files (Phases 7.1-7.4 COMPLETE)**
- ⏳ Doors/ features (Phase 7.5-7.10)
- ⏳ ExportService.js (Phase 9)

---

## User Interface Layout (CURRENT IMPLEMENTATION)

### Main Layout Structure

```
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│  CONTROLS   │                                                  │
│  PANEL      │                                                  │
│  (Left)     │           MAIN CANVAS AREA                      │
│             │           (Fixed 800x600)                        │
│ Room Setup  │       Dark background with grid                 │
│ Add Object  │                                                  │
│ Add Window  │                                                  │
│ Add Door    │                                                  │
│ Export View │                                                  │
│             │                                                  │
│ STATISTICS  │                                                  │
│  Floor: Xm² │                                                  │
│  Used: X%   │                                                  │
│  Objects: X │                                                  │
│  Volume: Xm³│                                                  │
│  Tallest: Xm│                                                  │
│  Remain: Xm │                                                  │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┤
│ [≡] [1] [2] [3] [4]                            Mode: Ready     │  Footer
└────────────────────────────────────────────────────────────────┘
```

### Layout Details

**Left Side Panel (280px, Collapsible):**

- **Controls Section:**
  - Room Setup (opens modal for dimensions)
  - Add Object (opens modal for object properties)
  - Add Window (enabled - fully functional)
  - Add Door (disabled - Phase 7.5+)
  - Export View (placeholder - Phase 9)
- **Statistics Section:**
  - Floor Space (m²)
  - Space Used (%)
  - Object Count
  - Total Volume (m³)
  - Tallest Object (m)
  - Remaining Height (m)
  - **Windows Count**
  - **Window Area (m²)**
- Collapses completely off-screen when toggled
- Smooth slide animation

**Main Canvas (800x600):**

- Centered in remaining space
- Dark background (#2D2D30)
- 1-meter grid pattern (white lines, 15% opacity)
- Room rendered with:
  - Light gray background (#3A3A3C)
  - Blue border (#5B9BD5)
  - Horizontal and vertical rulers showing meters
- Objects render as transparent (15% fill) with solid outline
- Red diagonal lines indicate collision disabled

**Footer:**

- **Left side:**
  - ≡ Toggle panel button
  - View selector buttons: [1] [2] [3] [4]
    - Currently only [1] (top-down) is active
    - [2], [3], [4] disabled (Phase 6)
- **Right side:**
  - Mode indicator: "Ready" / "Click to place object..." / "Editing mode"

---

## Feature Breakdown

### Features Overview

Each feature follows the same pattern:

```
Feature/
├─ Model.js           # Data structure & validation
├─ Controller.js      # Business logic & interactions
├─ View.js            # UI components & modals
└─ Renderer.js        # Canvas drawing
```

---

### 1. Room Feature

**`Room.js` (Data Model)**

```javascript
class Room {
  constructor(width, length, height) {
    this.id = generateId();
    this.dimensions = { width, length, height };
    this.windows = [];
    this.doors = [];
  }
  
  updateDimensions(width, length, height) { ... }
  isPointInBounds(x, y, z) { ... }
  getFloorArea() { ... }
}
```

**`RoomController.js` (Logic)**

- Initialize default room
- Handle room dimension updates
- Validate dimensions
- Emit events when room changes

**`RoomView.js` (UI)**

- Room setup form/modal
- Dimension input fields
- Validation feedback

**`RoomRenderer.js` (Rendering)**

- Draw room boundaries in all views
- Draw rulers with measurements
- Handle view-specific room drawing

---

### 2. Objects Feature

**`PlaceableObject.js` (Data Model)**

```javascript
class PlaceableObject {
  constructor(name, width, length, height, color) {
    this.id = generateId();
    this.name = name;
    this.dimensions = { width, length, height };
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = 0; // 0, 90, 180, 270
    this.color = color;
    this.collisionEnabled = true;
    this.creationOrder = 0;
  }
  
  move(x, y, z) { ... }
  rotate(degrees) { ... }
  isAt(x, y, z) { ... }
  getBounds() { ... }
}
```

**`ObjectManager.js` (State Management)**

- Store all objects
- CRUD operations
- Track selected object
- Handle object ordering

**`ObjectController.js` (Interactions)**

- Creation flow (modal → placement mode)
- Selection (click detection)
- Movement (drag handling)
- Rotation (keyboard)
- Deletion
- Property editing

**`ObjectView.js` (UI)**

- Create object modal (name, dimensions, color)
- Edit object modal (same fields)
- Right-click context menu
- Color picker
- Object list/inspector

**`ObjectRenderer.js` (Rendering)**

- Draw objects as rectangles in top-down view
- Draw objects in side views
- Draw selection highlight
- Handle rotation visualization
- Draw object labels

---

### 3. Windows Feature

**`Window.js` (Data Model)**

```javascript
class Window {
  constructor(wall, position, width, height, heightFromFloor) {
    this.id = generateId();
    this.wall = wall; // "front", "back", "left", "right"
    this.position = position; // along wall
    this.width = width;
    this.height = height;
    this.heightFromFloor = heightFromFloor;
  }
}
```

**`WindowManager.js` (State Management)**

- Store all windows
- CRUD operations
- Track selected window
- Calculate total window area

**`WindowController.js` (Logic)**

- Creation flow (modal → placement mode → click to place)
- Selection (click detection in side views)
- Movement (drag-to-reposition along wall)
- Resizing (PowerPoint-style handles - 8 resize handles)
- Deletion and duplication
- Property editing
- Keyboard shortcuts (D, Delete, Escape)
- Cursor feedback (move, resize directions)

**`WindowView.js` (UI)**

- Window creation modal (wall, dimensions, heightFromFloor)
- Edit window modal (all properties + position along wall)
- Right-click context menu (Edit, Duplicate, Delete)
- Default dimensions: width=20% of room, height=30% of room, heightFromFloor=30% of room

**`WindowListView.js` (UI - Right Panel)**

- Display all windows in list format
- Show window number, dimensions, wall location
- Click to select window
- Right-click for context menu
- Visual selection highlighting

**`WindowRenderer.js` (Rendering)**

- **Side views (FRONT/LEFT/RIGHT):** Draw as cutouts with canvas background visible, grid removed, white border
- **Top view:** Draw position indicators on walls (faint white lines, blue for selected)
- Selection highlighting with blue dashed border
- **8 Resize handles** when selected (corners + edges)
- Preview rendering during placement

---

### 4. Doors Feature

**`Door.js` (Data Model)**

```javascript
class Door {
  constructor(wall, position, width, height, swingDirection) {
    this.id = generateId();
    this.wall = wall;
    this.position = position;
    this.width = width;
    this.height = height;
    this.swingDirection = swingDirection; // "left", "right"
  }
  
  getSwingArc() { ... } // for top-down visualization
}
```

**`DoorController.js`, `DoorView.js`, `DoorRenderer.js`**

- Similar pattern to Windows
- Door rendering shows swing arc in top-down view
- Cutout in side views

---

### 5. Views Feature

**`ViewManager.js` (State)**

- Track current view (TOP, FRONT, LEFT, RIGHT)
- Handle view switching
- Hotkey bindings

**`ViewRenderer.js` (Orchestration)**

- Determine which renderers to call based on current view
- Call RoomRenderer, ObjectRenderer, WindowRenderer, DoorRenderer appropriately
- Handle canvas setup/clearing per view

---

## Core Services

### CollisionService

```javascript
class CollisionService {
  checkBoundaryCollision(object, room) { ... }
  checkObjectCollision(object1, object2) { ... }
  canPlace(object, allObjects, room) { ... }
  getStackingOrder(objects) { ... } // by creation order
}
```

### StatisticsService

```javascript
class StatisticsService {
  calculateFloorArea(room) { ... }
  calculateUsedArea(objects, room) { ... }
  calculatePercentageUsed(objects, room) { ... }
  calculateTotalVolume(objects) { ... }
  getTallestObject(objects) { ... }
  calculateRemainingHeight(objects, room) { ... }
}
```

### ExportService

```javascript
class ExportService {
  exportCurrentViewAsPNG(viewManager, canvas, filename) { ... }
  generateFilename(viewName) { ... } // "TopView_2025-11-26_14-32.png"
}
```

---

## Application Flow & State

### Initialization (`app.js`)

```javascript
class SpaceplannerApp {
  constructor() {
    this.eventBus = new EventBus();
    this.viewport = new Viewport(canvas);
    this.room = new Room(400, 500, 250); // default
    this.objectManager = new ObjectManager();
    this.viewManager = new ViewManager();
    this.state = {
      mode: "READY", // READY, CREATING, EDITING
      selectedObjectId: null,
      isDragging: false
    };
    this.setup();
  }
  
  setup() {
    // Initialize controllers
    this.roomController = new RoomController(this.room, this.eventBus);
    this.objectController = new ObjectController(
      this.objectManager,
      this.viewport,
      this.eventBus,
      this.state
    );
    // ... other controllers
    
    // Bind events
    this.eventBus.on("room:updated", () => this.render());
    this.eventBus.on("object:added", () => this.render());
    // ...
  }
  
  render() {
    const view = this.viewManager.getCurrentView();
    const renderers = this.getRenderersForView(view);
    renderers.forEach(r => r.render(this.viewport));
  }
}
```

### User Interactions

**Creating an Object:**

1. User clicks "Add Object" button
2. ObjectView shows modal
3. User enters name, dimensions, color
4. Modal closes → app enters CREATING state
5. Canvas shows preview of object at cursor
6. User clicks canvas → object placed
7. App enters EDITING state

**Editing an Object:**

1. User clicks object on canvas
2. ObjectController detects click
3. Object highlighted (selected)
4. User can:
    - **Drag** to move
    - **R key** to rotate
    - **Delete key** to delete
    - **Right-click** for context menu
5. Context menu allows:
    - Edit dimensions/name/color
    - Toggle collision
    - Fine-tune position (X, Y, Z inputs)

---

## User Interface Components

### Header

- Logo/Title (left)
- Menu toggle button (≡) (right)
- Export button (right)

### Side Panel (Collapsible)

**Control Section:**

- Room Setup button → modal
- Add Object button → modal
- Add Window button → modal
- Add Door button → modal
- Settings button → modal

**Statistics Section:**

- Floor Space Available: X cm²
- Total Floor Space: X cm²
- Floor Space Used: X% (with progress bar)
- Total Object Volume: X cm³
- Objects Count: X
- Tallest Object: X cm
- Remaining Height: X cm

### Main Canvas

- Measurement rulers on all sides
- Current view rendered
- Object labels visible
- Selection highlighting

### Footer

- View selector: [1] [2] [3] [4] (with hotkey hints)
- Mode indicator: "Ready" / "Creating Object..." / "Editing Mode"

### Modals/Dialogs

**Room Setup Modal**

- Width, Length, Height inputs (cm)
- Confirmation buttons

**Object Creation Modal**

- Name input
- Dimensions (width, length, height)
- Color picker
- Create button

**Object Edit Modal**

- Same as creation (name, dimensions, color)
- Collision toggle checkbox
- Position fine-tuning (X, Y, Z numerical inputs)
- Update button

**Window/Door Creation Modals**

- Wall selector (dropdown)
- Position along wall
- Width, Height
- Additional properties (heightFromFloor for windows, swingDirection for doors)

---

## Hotkeys & Controls

|Action|Hotkey|
|---|---|
|Top-Down View|`1`|
|Front View|`2`|
|Left View|`3`|
|Right View|`4`|
|Rotate Selected|`R`|
|Delete Selected|`Delete` / `Backspace`|
|Export Current View|`Ctrl/Cmd + E`|
|Deselect/Close Menu|`Escape`|
|Toggle Side Panel|`Ctrl/Cmd + \`|

---

## Implementation Phases (Revised)

### ✅ Phase 1: Foundation & Room (COMPLETE)

**Goal:** See a room rendered on canvas

- **1.1** ✓ Create file structure, HTML/CSS skeleton, base classes
- **1.2** ✓ Implement `Room.js`, `RoomController.js`
- **1.3** ✓ Implement `Viewport.js` and canvas setup
- **1.4** ✓ Implement `RoomRenderer.js` → draw room + rulers + grid
- **1.5** ✓ Implement `RoomView.js` → room setup modal

**Deliverable:** ✓ Can define room dimensions and see room on canvas

**Implementation Notes:**
- Dark theme implemented from start
- Room has 1-meter grid overlay
- Rulers show meters instead of cm
- Canvas is 800x600 fixed size

---

### ✅ Phase 2: Objects - Creation & Rendering (COMPLETE)

**Goal:** Create and see objects on canvas

- **2.1** ✓ Implement `PlaceableObject.js` data model
- **2.2** ✓ Implement `ObjectManager.js` for state management
- **2.3** ✓ Implement `ObjectView.js` → object creation modal
- **2.4** ✓ Implement `ObjectRenderer.js` → draw objects (top-down)
- **2.5** ✓ Implement placement mode (click-to-place logic)

**Deliverable:** ✓ Can create objects and place them on canvas in top-down view

**Implementation Notes:**
- Objects render with 15% fill opacity, 100% outline opacity
- All measurements displayed in meters, stored as cm internally

---

### ✅ Phase 3: Objects - Selection & Movement (COMPLETE)

**Goal:** Interact with placed objects

- **3.1** ✓ Implement `ObjectController.js` → click detection & selection
- **3.2** ✓ Implement drag-to-move functionality
- **3.3** ✓ Implement rotation (R key)
- **3.4** ✓ Implement deletion (Delete key)
- **3.5** ✓ Visual feedback for selection (blue dashed outline)

**Deliverable:** ✓ Can select, move, rotate, and delete objects

**Implementation Notes:**
- Context menu implemented (right-click)
- Toggle collision working

---

### ✅ Phase 4: Collision Detection & Stacking (COMPLETE)

**Goal:** Prevent objects from leaving room; enable stacking

- **4.1** ✓ Implement `CollisionService.js`
- **4.2** ✓ Boundary collision (objects can't leave room)
- **4.3** ✓ Object-to-object collision detection with AABB
- **4.4** ✓ Implement collision toggle per object
- **4.5** ✓ Stacking visualization (Z-ordering by creation order)
- **4.6** ✓ Intelligent stacking system with bilateral collision rules

**Deliverable:** ✓ Collisions work; can toggle per object to allow overlapping/stacking

**Implementation Notes:**
- Real-time collision checking during placement and dragging
- Objects snap back to valid position if collision detected
- Per-object collision toggle via context menu
- StatisticsService also implemented with accurate overlap handling
- **Stacking Rules:**
  - Creation order determines hierarchy: first created = bottom of stack
  - Stacking occurs when EITHER object has collision disabled
  - Example: Object A (created first, collision ON) + Object B (created second, collision OFF) → A at bottom, B stacks on top
  - Z positions recalculate automatically when objects move, rotate, or collision toggles
- Boundary check includes Z-axis (objects cannot exceed ceiling height)

---

### ✅ Phase 5: Object Editing (COMPLETE)

**Goal:** Fine-tune object properties after placement

- **5.1** ✓ Implement `ObjectController.js` context menu handler
- **5.2** ✓ Right-click context menu UI
- **5.3** ✓ Edit modal for dimensions/name/color/position
- **5.4** ✓ Property updates with re-rendering
- **5.5** ✓ Object duplication via context menu
- **5.6** ✓ Collision toggle via context menu

**Deliverable:** ✓ Can right-click objects and edit all properties

**Implementation Notes:**
- Edit modal includes X, Y, Z position fine-tuning
- Validation prevents objects from exceeding room boundaries
- Collision toggle updates stacking in real-time
- Duplicate creates copy in placement mode

---

### ✅ Phase 6: Multiple Views (COMPLETE)

**Goal:** See all four perspectives

- **6.1** ✓ Implement `ViewManager.js`
- **6.2** ✓ Implement `ViewRenderer.js` orchestration
- **6.3** ✓ Update `ObjectRenderer.js` for side views
- **6.4** ✓ Update `RoomRenderer.js` for side views
- **6.5** ✓ Hotkey switching (1, 2, 3, 4)
- **6.6** ✓ View indicator in footer

**Deliverable:** ✓ All four views render correctly; can switch with hotkeys

**Implementation Notes:**
- TOP view: X-Y plane, shows floor layout
- FRONT view: X-Z plane, shows width and height
- LEFT view: Y-Z plane, shows length and height
- RIGHT view: Y-Z plane (reversed), shows length and height from opposite side
- Object selection and interaction works in all views
- Placement only allowed in TOP view (enforced with alert)

---

### Phase 7: Windows & Doors

**Goal:** Add architectural features with full interaction support

#### Phase 7.1: Window Foundation
**Goal:** Create window data model and basic infrastructure

- **7.1.1** Implement `Window.js` data model
  - Properties: wall, position, width, height, heightFromFloor, id
  - Validation methods for bounds and placement
- **7.1.2** Implement `WindowManager.js` for CRUD operations
- **7.1.3** Update Room.js to store windows array
- **7.1.4** Add window-window collision detection to CollisionService

**Deliverable:** Window data structures and management ready

---

#### Phase 7.2: Window UI & Creation
**Goal:** Allow users to create windows through modal interface

- **7.2.1** Implement `WindowView.js` - UI components
  - Creation modal: wall dropdown, dimensions, heightFromFloor
  - Default dimensions: width=8% of room, height=30% of room, heightFromFloor=30% of room
  - Edit modal and right-click context menu
- **7.2.2** Implement `WindowController.js` - Creation flow
  - Handle "Add Window" button → modal → placement mode
  - Window preview at cursor (only in FRONT/LEFT/RIGHT views)
  - Validate no overlap with other windows/doors
  - Click to place on wall
- **7.2.3** Wire up UI buttons and event handlers

**Deliverable:** Can create windows via modal and place them

---

#### Phase 7.3: Window Rendering
**Goal:** Visualize windows in side views

- **7.3.1** Implement `WindowRenderer.js` - Drawing logic
  - Render only in FRONT, LEFT, RIGHT views (not visible in TOP)
  - Draw as cutout: grey canvas background visible, grid lines removed in window area, thin white border
  - Calculate correct position based on wall and heightFromFloor
- **7.3.2** Update ViewRenderer.js to call WindowRenderer
- **7.3.3** Add selection highlighting for windows
- **7.3.4** Add hover effects

**Deliverable:** Windows render correctly in side views as cutouts

---

#### Phase 7.4: Window Interactions
**Goal:** Make windows fully interactive

- **7.4.1** Implement click detection for window selection
- **7.4.2** Implement drag-to-move along wall (constrained to same wall)
- **7.4.3** Implement right-click context menu → Edit/Delete
- **7.4.4** Add windows to right-hand panel list (similar to ObjectListView)
- **7.4.5** Update statistics panel: window count, total wall area used

**Deliverable:** Windows are fully interactive - selectable, movable, editable, deletable

---

----

#### Phase 7.5: Door Foundation (TODO)
**Goal:** Create door data model and infrastructure

- **7.5.1** Implement `Door.js` data model
  - Properties: wall, position, width, height, swingDirection (inward/outward), hingePosition (left/right), id
  - Methods: getSwingArc() for rendering swing arc, validation
- **7.5.2** Implement `DoorManager.js` for CRUD operations
- **7.5.3** Update Room.js to store doors array
- **7.5.4** Add door-door and door-window collision detection to CollisionService

**Deliverable:** Door data structures and management ready

---

#### Phase 7.6: Door UI & Creation
**Goal:** Allow users to create doors through modal interface

- **7.6.1** Implement `DoorView.js` - UI components
  - Creation modal: wall dropdown, dimensions, swingDirection (inward/outward), hingePosition (left/right)
  - Default dimensions: width=10% of room, height=80% of room
  - Edit modal and right-click context menu
- **7.6.2** Implement `DoorController.js` - Creation flow
  - Handle placement mode with view-specific behavior:
    - TOP view: door + arc visible, draggable to any wall
    - Side views: door visible as cutout, constrained to current wall
  - Preview door with swing arc
  - Validate no overlap with other doors/windows
- **7.6.3** Wire up UI buttons and event handlers

**Deliverable:** Can create doors via modal and place them with appropriate behavior per view

---

#### Phase 7.7: Door Rendering
**Goal:** Visualize doors in all views

- **7.7.1** Implement `DoorRenderer.js` - Drawing logic
  - **TOP view:** Draw small rectangle for door + swing arc (quarter circle)
  - **Side views:** Draw as cutout (grey background, no grid, thin white border)
  - Calculate swing arc based on swingDirection and hingePosition
  - Handle door thickness/width representation
- **7.7.2** Update ViewRenderer.js to call DoorRenderer for all views
- **7.7.3** Add selection highlighting and hover effects

**Deliverable:** Doors render correctly in all views with swing arc in TOP view

---

#### Phase 7.8: Door Interactions
**Goal:** Make doors fully interactive

- **7.8.1** Implement click detection and selection in all views
- **7.8.2** Implement drag-to-move with view-specific behavior:
  - TOP view: drag to any wall, snap to nearest wall
  - Side views: drag along same wall only (similar to windows)
- **7.8.3** Implement right-click context menu → Edit/Delete
- **7.8.4** Add doors to right-hand panel list
- **7.8.5** Update statistics: door count, wall area used

**Deliverable:** Doors are fully interactive with view-specific movement behavior

---

#### Phase 7.9: Collision & Clearance Logic
**Goal:** Implement advanced collision detection and clearance warnings

- **7.9.1** Implement door swing arc collision detection with objects
- **7.9.2** Add visual indicators when objects block door swing (clearance warnings)
- **7.9.3** Update statistics panel with clearance warnings count/details
- **7.9.4** Ensure validation prevents window/door overlap during placement and editing
- **7.9.5** Verify objects can overlap windows/doors (realistic behavior)

**Deliverable:** Comprehensive collision system with clearance warnings for blocked doors

---

#### Phase 7.10: Integration & Polish
**Goal:** Ensure seamless integration with existing features

- **7.10.1** Test window placement, editing, deletion in all side views
- **7.10.2** Test door placement, editing, deletion with view switching
- **7.10.3** Verify statistics update correctly for all operations
- **7.10.4** Test interaction between windows, doors, and objects
- **7.10.5** Ensure view switching maintains window/door state correctly
- **7.10.6** Polish UI styling to match dark theme
- **7.10.7** Add keyboard shortcuts if beneficial (optional)
- **7.10.8** Update right-hand panel to show windows/doors with proper icons/labels

**Deliverable:** Fully polished and integrated windows & doors feature

---

### Design Specifications for Phase 7

#### Window Specifications (IMPLEMENTED):
- **Default Dimensions:** Width = 20% of room width, Height = 30% of room height
- **Default Position:** 30% of wall height from floor
- **Placement:** Only in FRONT, LEFT, RIGHT views (not in TOP view)
- **Movement:** Drag along same wall only; maintains click offset
- **Resizing:** 8 PowerPoint-style handles (4 corners + 4 edges)
- **Minimum Size:** 10cm width and height
- **Collision:** Silent detection - prevents overlaps without popups
- **Selection:** Blue dashed border with resize handles
- **Top View:** Faint white indicator lines on walls (blue when selected)
- **Keyboard Shortcuts:** D (duplicate), Delete/Backspace (delete), Escape (deselect)
- **Statistics:** Window count and total area displayed
- **List View:** Shows in right panel with name, dimensions, wall location

#### Door Specifications (TODO - Phase 7.5+):ifferent wall, delete and recreate in appropriate view
- **Rendering:** Empty cutout (canvas grey background visible, grid lines removed, thin white border)
- **Collision:** Cannot overlap with other windows or doors; objects CAN overlap windows

#### Door Specifications:
- **Default Dimensions:** Width = 10% of room width, Height = 80% of room height
- **Swing Direction:** User chooses inward or outward during creation
- **Hinge Position:** User chooses left or right during creation
- **Placement:**
  - TOP view: Shows small rectangle + swing arc, draggable to any wall
  - Side views: Shows as cutout, draggable along same wall only
- **Movement:** View-specific behavior (TOP = any wall, Side = same wall only)
- **Rendering:**
  - TOP view: Rectangle + quarter-circle swing arc
  - Side views: Empty cutout (canvas grey background, no grid, thin white border)
- **Collision:** Cannot overlap with other doors or windows; objects CAN overlap doors
- **Clearance:** Detect if swing arc is blocked by objects and show warnings

#### Wall Naming Convention:
- **Front Wall:** Bottom edge in TOP view (Y=0)
- **Back Wall:** Top edge in TOP view (Y=length)
- **Left Wall:** Left edge in TOP view (X=0)
- **Right Wall:** Right edge in TOP view (X=width)

#### UI Integration:
- **Panel List:** Windows and doors appear in right-hand panel (similar to ObjectListView)
- **Context Menu:** Right-click on window/door → Edit, Delete, Move options
- **Statistics Updates:**
  - Window count
  - Door count
  - Total wall area used by windows/doors (as percentage)
  - Clearance warnings (number of doors blocked by objects)

**Complete Deliverable:** Fully functional windows and doors with creation, placement, editing, movement, deletion, and statistics integration

---

### ✅ Phase 8: Statistics (MOSTLY COMPLETE)

**Goal:** Real-time space utilization data

- **8.1** ✓ Implement `StatisticsService.js` calculations
- **8.2** ✓ Implement statistics panel UI
- **8.3** ✓ Wire statistics to update on object changes
- **8.4** ✓ Display real-time metrics

**Deliverable:** ✓ Statistics panel updates in real-time with accurate data

**Current Statistics Displayed:**
- Floor Space (m²)
- Space Used (%)
- Object Count
- Total Volume (m³)
- Tallest Object (m)
- Remaining Height (m)

**Potential Additions (Phase 8 refinement):**
- Window count and total window area
- Door count
- Wall space utilization

---

### Phase 9: Export

**Goal:** Save views as PNG

- **9.1** Implement `ExportService.js`
- **9.2** Canvas-to-PNG conversion
- **9.3** Filename generation (view + timestamp)
- **9.4** Export button in header

**Deliverable:** Can export any view as PNG

---

### Phase 10: Polish & Testing

**Goal:** Refine UX, fix bugs, optimize

- **10.1** UI refinement (colors, spacing, fonts)
- **10.2** Error handling and validation
- **10.3** Edge case testing (extreme dimensions, overlaps, etc.)
- **10.4** Performance optimization
- **10.5** Accessibility review

**Deliverable:** Production-ready MVP

---

## Data Models Summary

### Room

```javascript
{
  id: string,
  dimensions: { width, length, height },
  windows: Window[],
  doors: Door[]
}
```

### PlaceableObject

```javascript
{
  id: string,
  name: string,
  dimensions: { width, length, height },
  position: { x, y, z },
  rotation: 0 | 90 | 180 | 270,
  color: string (hex),
  collisionEnabled: boolean,
  creationOrder: number
}
```

### Window

```javascript
{
  id: string,
  wall: "front" | "back" | "left" | "right",
  position: number,
  width: number,
  height: number,
  heightFromFloor: number
}
```

### Door

```javascript
{
  id: string,
  wall: "front" | "back" | "left" | "right",
  position: number,
  width: number,
  height: number,
  swingDirection: "left" | "right"
}
```

### Application State

```javascript
{
  mode: "READY" | "CREATING" | "EDITING",
  selectedObjectId: string | null,
  isDragging: boolean,
  currentView: "TOP" | "FRONT" | "LEFT" | "RIGHT"
}
```

---

## Event Bus Pattern

The application uses a centralized `EventBus` for loose coupling:

```javascript
// Any component can emit events
this.eventBus.emit("object:created", { object });
this.eventBus.emit("object:moved", { objectId, newPosition });

// Any component can listen
this.eventBus.on("object:created", (data) => {
  this.render();
  this.updateStatistics();
});
```

Common events:

- `room:updated`
- `object:created`, `object:updated`, `object:deleted`, `object:selected`
- `window:created`, `window:deleted`
- `door:created`, `door:deleted`
- `view:changed`
- `mode:changed`

---

## Key Design Decisions

1. **Feature-Based Organization:** Each domain (Room, Objects, Windows, Doors) is self-contained, making it easy to develop, test, and refactor independently.
    
2. **Controller/View/Renderer Split:** Separates business logic, UI presentation, and canvas rendering for clarity and testability.
    
3. **Event Bus:** Loose coupling allows features to communicate without direct dependencies.
    
4. **Fixed Canvas Size:** Simplifies viewport calculations and rendering logic.
    
5. **Click-to-Place Workflow:** User creates object → modal closes → placement mode → click canvas → editing mode. Clear state transitions.
    
6. **Collapsible Statistics Panel:** Maximizes canvas real estate while keeping stats accessible.
    
7. **Simple State Model:** Minimal, centralized app state prevents bugs from inconsistent data.
    

---

## Development Tips

### Starting Phase 1

1. Create all files in structure (even if empty)
2. Set up basic HTML with canvas and panels
3. Create `EventBus.js` first (other code depends on it)
4. Bootstrap `app.js` to initialize everything
5. Get room rendering before moving to Phase 2

### Testing Strategy

After each phase:

- Test in isolation (that feature works)
- Test integration (doesn't break previous features)
- Check console for errors
- Verify canvas renders correctly

### Common Gotchas

- **Canvas coordinates vs room coordinates:** Keep clear which system you're using
- **Rotation calculations:** Test all four angles (0, 90, 180, 270)
- **Event listener cleanup:** Prevent duplicate listeners
- **Z-ordering:** Remember creation order determines stacking
- **Ruler calculations:** Ensure scales are accurate

---

## Success Criteria

### ✅ Completed:
- ✅ Room can be defined with custom dimensions
- ✅ Objects can be created with all properties
- ✅ Click-to-place workflow works smoothly
- ✅ Objects can be selected, moved, rotated, deleted
- ✅ Right-click context menu allows property editing
- ✅ All four views render correctly
- ✅ Hotkeys switch views seamlessly (1-4 keys)
- ✅ Collision detection prevents leaving room
- ✅ Objects can be stacked (bilateral collision toggle)
- ✅ Stacking hierarchy based on creation order
- ✅ Statistics update in real-time
- ✅ Code is organized and maintainable

### ⏳ Remaining:
- ⏳ Windows and doors render in appropriate views
- ⏳ Canvas exports to PNG successfully
- ⏳ UI is polished and responsive
- ⏳ Final testing and edge case handling

---

**Project Type:** Web Application
**Technologies:** HTML5, CSS3, Vanilla JavaScript (OOP)
**Architecture:** Event-driven, feature-based
**Document Version:** 4.0 (Post-Phase 6)
**Last Updated:** November 2025

---

## Recent Updates & Bug Fixes

### Phase 6 Completion (Multiple Views)
- ✅ All four views (TOP, FRONT, LEFT, RIGHT) fully implemented
- ✅ Hotkey switching (1-4 keys) working correctly
- ✅ Object selection and rendering in all views
- ✅ View indicator updates in footer

### Stacking System Refinement
**Issue Fixed:** Stacking logic now properly respects creation order in all scenarios

**Previous Behavior:**
- Objects could only stack when the BOTTOM object had collision disabled
- Object A (created first, collision ON) could not stack on Object B (created second, collision OFF)

**Current Behavior:**
- Stacking occurs when EITHER object has collision disabled
- Creation order ALWAYS determines hierarchy (first created = bottom)
- Z positions recalculate automatically when:
  - Objects are moved or dragged
  - Objects are rotated
  - Collision is toggled on/off
  - Objects are deleted
  - Object dimensions are edited

**Implementation:**
- CollisionService.js:189 - Modified calculateStackingZ to check bilateral collision
- ObjectController.js:649 - recalculateAllZPositions maintains creation order hierarchy

### Known Limitations
- Object placement only allowed in TOP view (by design)
- No undo/redo functionality yet
- Windows and doors features not yet implemented



add the foor arc to the side views to make placing easier (if the door is on the right wall we should see the maximum arc front eh front view )
add difference between custom objects and preCreated obejcts
add keybinds to create object, custom object, window, door
windows and doors should not overlap
Further down the line I want undo redo functionality
finsh export functionality


