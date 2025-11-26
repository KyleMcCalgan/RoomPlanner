# Space Planner - Refactored Project Specification

## Project Overview

A web-based space planning application that allows users to check if items will fit into a defined space. Users define a floor plan with specific dimensions and add objects with height, width, and length properties. Multiple views (top-down and side views) visualize object placement with real-time statistics about space utilization.

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

---

## User Interface Layout

### Main Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│  Space Planning Tool                              [≡] [Export]  │  Header
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                     MAIN CANVAS AREA                            │  80% of viewport
│                  (Fixed 800x600 or similar)                     │
│                                                                  │
│                                                                  │
│                                                                  │
├──────────────────┬─────────────────────────────────────────────┤
│  View Selector   │  Current Mode Indicator                      │  Footer
│  [1] [2] [3] [4] │  (Creating/Editing/Viewing)                │
└──────────────────┴─────────────────────────────────────────────┘

    [Collapsible Side Panel - Toggled via ≡ button]
    ┌──────────────────────┐
    │ Control Panel        │
    │ ├─ Room Setup        │
    │ ├─ Add Object        │
    │ ├─ Add Window/Door   │
    │ └─ Settings          │
    │                      │
    │ Statistics Panel     │
    │ ├─ Floor Space       │
    │ ├─ Space Used        │
    │ ├─ Objects: X        │
    │ ├─ Total Volume      │
    │ ├─ Tallest Object    │
    │ └─ Remaining Height  │
    └──────────────────────┘
```

### Layout Details

**Header:**

- Title on left
- Menu toggle (≡) and Export button on right
- Always visible

**Main Canvas:**

- Fixed size (recommend 800x600 or 1000x700)
- Centered on screen
- Measurement rulers displayed
- Current view rendered here

**Footer:**

- View selector buttons (1,2,3,4)
- Mode indicator (shows current state: "Ready to Place Object", "Editing Mode", etc.)

**Side Panel (Collapsible):**

- Toggle via ≡ button in header
- **Control Section:** Room setup, Add Object, Add Window/Door, Settings
- **Statistics Section:** Real-time updates
- Collapses to right edge when not needed
- Smooth slide animation

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

**`WindowController.js` (Logic)**

- Add window to room
- Edit window properties
- Validate position

**`WindowView.js` (UI)**

- Window creation modal
- Window list
- Edit window modal

**`WindowRenderer.js` (Rendering)**

- Draw windows in side views only (as cutouts)
- Not visible in top-down view

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

### Phase 1: Foundation & Room

**Goal:** See a room rendered on canvas

- **1.1** Create file structure, HTML/CSS skeleton, base classes
- **1.2** Implement `Room.js`, `RoomController.js`
- **1.3** Implement `Viewport.js` and canvas setup
- **1.4** Implement `RoomRenderer.js` → draw room + rulers
- **1.5** Implement `RoomView.js` → room setup modal

**Deliverable:** Can define room dimensions and see room on canvas

---

### Phase 2: Objects - Creation & Rendering

**Goal:** Create and see objects on canvas

- **2.1** Implement `PlaceableObject.js` data model
- **2.2** Implement `ObjectManager.js` for state management
- **2.3** Implement `ObjectView.js` → object creation modal
- **2.4** Implement `ObjectRenderer.js` → draw objects (top-down)
- **2.5** Implement placement mode (click-to-place logic)

**Deliverable:** Can create objects and place them on canvas in top-down view

---

### Phase 3: Objects - Selection & Movement

**Goal:** Interact with placed objects

- **3.1** Implement `ObjectController.js` → click detection & selection
- **3.2** Implement drag-to-move functionality
- **3.3** Implement rotation (R key)
- **3.4** Implement deletion (Delete key)
- **3.5** Visual feedback for selection (highlight)

**Deliverable:** Can select, move, rotate, and delete objects

---

### Phase 4: Collision Detection & Stacking

**Goal:** Prevent objects from leaving room; enable stacking

- **4.1** Implement `CollisionService.js`
- **4.2** Boundary collision (objects can't leave room)
- **4.3** Object-to-object collision detection
- **4.4** Implement collision toggle per object
- **4.5** Stacking visualization

**Deliverable:** Collisions work; can toggle per object to stack

---

### Phase 5: Object Editing

**Goal:** Fine-tune object properties after placement

- **5.1** Implement `ObjectController.js` context menu handler
- **5.2** Right-click context menu UI
- **5.3** Edit modal for dimensions/name/color/position
- **5.4** Property updates with re-rendering

**Deliverable:** Can right-click objects and edit all properties

---

### Phase 6: Multiple Views

**Goal:** See all four perspectives

- **6.1** Implement `ViewManager.js`
- **6.2** Implement `ViewRenderer.js` orchestration
- **6.3** Update `ObjectRenderer.js` for side views
- **6.4** Update `RoomRenderer.js` for side views
- **6.5** Hotkey switching (1, 2, 3, 4)
- **6.6** View indicator in footer

**Deliverable:** All four views render correctly; can switch with hotkeys

---

### Phase 7: Windows & Doors

**Goal:** Add architectural features

- **7.1** Implement `Window.js`, `WindowController.js`, `WindowView.js`, `WindowRenderer.js`
- **7.2** Window creation and rendering in side views
- **7.3** Implement `Door.js`, `DoorController.js`, `DoorView.js`, `DoorRenderer.js`
- **7.4** Door swing arc visualization (top-down)
- **7.5** Door cutout in side views

**Deliverable:** Can add windows and doors; they render correctly

---

### Phase 8: Statistics

**Goal:** Real-time space utilization data

- **8.1** Implement `StatisticsService.js` calculations
- **8.2** Implement statistics panel UI
- **8.3** Wire statistics to update on object changes
- **8.4** Display real-time metrics

**Deliverable:** Statistics panel updates in real-time with accurate data

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

✅ Room can be defined with custom dimensions  
✅ Objects can be created with all properties  
✅ Click-to-place workflow works smoothly  
✅ Objects can be selected, moved, rotated, deleted  
✅ Right-click context menu allows property editing  
✅ All four views render correctly  
✅ Hotkeys switch views seamlessly  
✅ Collision detection prevents leaving room  
✅ Objects can be stacked (collision toggle)  
✅ Windows and doors render in appropriate views  
✅ Statistics update in real-time  
✅ Canvas exports to PNG successfully  
✅ UI is polished and responsive  
✅ Code is organized and maintainable

---

**Project Type:** Web Application  
**Technologies:** HTML5, CSS3, Vanilla JavaScript (OOP)  
**Architecture:** Event-driven, feature-based  
**Document Version:** 3.0 (Refactored)  
**Last Updated:** November 2025