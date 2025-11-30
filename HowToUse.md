# Space Planner - Project Documentation

**Last Updated:** November 2025
**Status:** Phase 7 Complete - Core Features Functional
**Technologies:** HTML5, CSS3, Vanilla JavaScript (OOP)

---

## Project Overview

A web-based 3D space planning application for visualizing room layouts with furniture, windows, and doors. Users can create custom rooms, place objects with real dimensions, and view their space from multiple perspectives (top, front, left, right). Features include intelligent collision detection, object stacking, and real-time statistics.

### Primary Use Cases
- **Home Planning:** Verify furniture fits before purchasing
- **Interior Design:** Visualize room layouts and arrangements
- **Space Optimization:** Calculate floor usage and remaining space
- **Moving Planning:** Plan furniture placement in new spaces

---

## Current Status - What Works Now

### ✅ Core Features (Phases 1-7 Complete)

**Room System**
- Custom dimensions (width, length, height) with metric display
- Grid overlay with 1-meter spacing
- Rulers showing measurements in all views
- Dark theme interface with blue accent colors

**Objects & Furniture**
- **Custom Objects:** User-defined name, dimensions, color
- **70+ Preset Objects:** Organized in 8 categories (Bedroom, Living Room, Kitchen, etc.)
- Auto-numbered naming ("Queen Bed 1", "Queen Bed 2")
- Preset objects have locked dimensions, editable name/color
- Full interactivity: place, select, move, rotate, delete, duplicate
- Context menu (right-click) for editing properties
- Collision detection with room boundaries
- Optional collision toggle for intentional overlapping
- **Intelligent stacking:** Creation-order hierarchy, bilateral collision rules

**Windows**
- Place on any wall (front, back, left, right)
- 8-point PowerPoint-style resize handles (corners + edges)
- Drag to reposition along walls
- Visual indicators: cutouts in side views, wall markers in top view
- Collision prevention with other windows and doors
- Window list in side panel with statistics

**Doors**
- Configurable swing direction (inward/outward) and hinge position (left/right)
- **Swing arc visualization in top view** (quarter-circle clearance zone)
- **Perpendicular arc indicators** (view door clearance from side views)
- Blocked door detection when objects obstruct swing path
- Full collision prevention with windows and other doors
- Door list with blocked status indicators

**Multi-View System**
- 4 perspectives: TOP (floor plan), FRONT, LEFT, RIGHT (elevations)
- Hotkey switching (1, 2, 3, 4 keys)
- **Direction indicators:** Hover over view buttons to see arrows showing viewing angle
- All interactions work in appropriate views (placement, selection, movement)

**Keyboard Shortcuts**
- **Creation:** O (custom object), P (preset object), W (window), B (door)
- **Actions:** R (rotate), D (duplicate), H (hide/show), C (toggle collision)
- **Selection:** Ctrl+A (select all), E (deselect all), Delete (remove)
- **Views:** 1 (top), 2 (front), 3 (left), 4 (right)
- **Help:** ? (show shortcuts)

**Statistics & Analytics**
- Real-time floor space usage (m² and percentage)
- Object count and total volume
- Tallest object and remaining ceiling height
- Window count and total area
- Door count with blocked door tracking

---

## Architecture Overview

### Design Philosophy
**Feature-Based Organization:** Each major domain (Room, Objects, Windows, Doors, Views) is self-contained with minimal cross-dependencies.

**Separation of Concerns:**
- **Models:** Data structures and validation (`Room.js`, `PlaceableObject.js`, `Window.js`, `Door.js`)
- **Controllers:** Business logic and user interactions (`ObjectController.js`, `WindowController.js`, `DoorController.js`)
- **Views:** UI components and modals (`ObjectView.js`, `WindowView.js`, `DoorView.js`)
- **Renderers:** Canvas drawing logic (`RoomRenderer.js`, `ObjectRenderer.js`, `WindowRenderer.js`, `DoorRenderer.js`)

**Event-Driven Communication:** Centralized `EventBus` allows features to communicate without tight coupling.

### File Structure (Simplified)

```
RoomPlanner/
├── index.html                    # Single-page application
├── css/                          # Styling (base, canvas, panel, modal)
├── js/
│   ├── core/
│   │   ├── app.js                # Application bootstrap
│   │   ├── viewport.js           # Canvas management & coordinate system
│   │   └── eventBus.js           # Event system
│   ├── data/
│   │   └── PresetObjects.js      # Catalog of 70+ furniture items
│   ├── features/
│   │   ├── room/                 # Room.js, RoomController, RoomView, RoomRenderer
│   │   ├── objects/              # PlaceableObject, ObjectManager, ObjectController, ObjectView, ObjectRenderer
│   │   ├── windows/              # Window, WindowManager, WindowController, WindowView, WindowRenderer
│   │   ├── doors/                # Door, DoorManager, DoorController, DoorView, DoorRenderer
│   │   └── views/                # ViewManager, ViewRenderer
│   ├── services/
│   │   ├── CollisionService.js   # Collision detection & validation
│   │   ├── StatisticsService.js  # Calculations and metrics
│   │   └── ExportService.js      # PNG export (in progress)
│   └── utils/
│       ├── geometry.js           # Math helpers
│       ├── drawing.js            # Canvas utilities
│       └── helpers.js            # General utilities
└── README.md
```

### Key Technical Details

**Coordinate System:**
- Internal storage: **centimeters** (cm)
- User display: **meters** (m)
- Canvas coordinates: Pixel positions with viewport scaling
- Z-axis: Floor is Z=0, ceiling is Z=room.height

**View Transformations:**
- TOP view: X-Y plane (floor plan)
- FRONT view: X-Z plane (width × height)
- LEFT view: Y-Z plane (length × height, viewing right wall)
- RIGHT view: Y-Z plane mirrored (length × height, viewing left wall)

**Collision Detection:**
- AABB (Axis-Aligned Bounding Box) for objects
- Per-wall segment overlap for windows/doors
- 80+ sample point checking for door swing arcs
- Bilateral collision rules for stacking

**Stacking System:**
- Creation order determines hierarchy (first created = bottom)
- Stacking occurs when EITHER object has collision disabled
- Z-positions auto-recalculate on movement, rotation, or property changes

---

## Data Models

### Room
```javascript
{
  id: string,
  dimensions: { width: number, length: number, height: number },  // cm
  windows: Window[],
  doors: Door[]
}
```

### PlaceableObject
```javascript
{
  id: string,
  name: string,
  dimensions: { width: number, length: number, height: number },  // cm
  position: { x: number, y: number, z: number },  // cm
  rotation: 0 | 90 | 180 | 270,  // degrees
  color: string,  // hex code
  collisionEnabled: boolean,
  creationOrder: number,
  isPreset: boolean,  // true for catalog objects
  presetId: string | null  // e.g., "queen_bed"
}
```

### Window
```javascript
{
  id: string,
  wall: "front" | "back" | "left" | "right",
  position: number,  // cm along wall
  dimensions: { width: number, height: number },  // cm
  heightFromFloor: number  // cm
}
```

### Door
```javascript
{
  id: string,
  wall: "front" | "back" | "left" | "right",
  position: number,  // cm along wall
  dimensions: { width: number, height: number },  // cm
  swingDirection: "inward" | "outward",
  hingePosition: "left" | "right",
  isBlocked: boolean  // auto-detected by collision service
}
```

---

## User Workflow

1. **Setup:** Define room dimensions via modal (default: 4m × 5m × 2.5m)
2. **Add Furniture:**
   - Press **O** for custom object → enter dimensions, color
   - Press **P** for preset object → browse catalog of 70+ items
   - Click canvas in TOP view to place
3. **Add Windows/Doors:**
   - Press **W** for window or **B** for door
   - Configure wall, dimensions, and properties
   - Click canvas in side view (windows/doors) or top view (doors) to place
4. **Arrange & Edit:**
   - Click objects to select, drag to move
   - Press **R** to rotate, **D** to duplicate, **Delete** to remove
   - Right-click for context menu (edit properties, toggle collision)
   - Use 8-point handles to resize windows
5. **Analyze:**
   - Switch views (1, 2, 3, 4) to see different perspectives
   - Check statistics panel for space usage
   - Hover over view buttons to see directional arrows
6. **Export:** (Coming soon) Save views as PNG images

---

## Known Limitations & Design Decisions

### By Design
- Object placement restricted to TOP view (prevents placement in mid-air)
- Preset object dimensions are locked (maintains catalog integrity)
- Windows/doors only show in relevant views (realistic visualization)
- RIGHT view uses mirrored coordinates (you're looking at the left wall from right side)

### Current Constraints
- Canvas is fixed 800×600 pixels (simplifies rendering calculations)
- No 3D perspective view (2D orthographic projections only)
- Single room per project (multi-room not yet supported)
- No project save/load (session-based only)

### Planned Improvements
See "Future Development" sections below

---

## Future Development (Planned Features)

### Phase 8: Enhanced Statistics & Analytics

**Goal:** Provide deeper insights into space utilization and layout

**Planned Features:**
- Wall space utilization percentage (windows/doors vs available wall area)
- Weight distribution analysis (identify heavy object clusters)
- Traffic flow visualization (pathways between doors)
- Accessibility metrics (clearance for wheelchairs, walkers)
- Light coverage analysis (window placement optimization)

**Implementation Complexity:** Low-Medium
**Estimated Effort:** 8-12 hours
**Dependencies:** None (extends existing StatisticsService)

---

### Phase 9: Export Functionality (IN PROGRESS)

**Goal:** Allow users to save and share their designs

#### 9.1 PNG Export (Priority 1)

**Requirements:**
- Export current view as PNG image
- Include room dimensions and statistics overlay (optional toggle)
- Auto-generated filename: `{ViewName}_{Timestamp}.png` (e.g., `TopView_2025-11-30_14-32.png`)
- Keyboard shortcut: **Ctrl/Cmd + E**
- Export button in control panel

**Technical Approach:**
```javascript
class ExportService {
  exportCurrentViewAsPNG(canvas, viewName, options = {}) {
    // 1. Create temporary offscreen canvas
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');

    // 2. Set dimensions (higher resolution for print quality)
    const scale = options.scale || 2;
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;

    // 3. Copy current canvas with scaling
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);

    // 4. Add optional overlays
    if (options.includeStats) {
      this.drawStatsOverlay(ctx, statistics);
    }
    if (options.includeTitle) {
      this.drawTitleOverlay(ctx, roomName, viewName);
    }

    // 5. Convert to blob and download
    exportCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = this.generateFilename(viewName);
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  generateFilename(viewName) {
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .substring(0, 19);
    return `${viewName}_${timestamp}.png`;
  }

  drawStatsOverlay(ctx, stats) {
    // Draw semi-transparent box in corner
    // Render statistics text
  }
}
```

**UI Components:**
- Export button in control panel
- Export modal with options:
  - [ ] Include statistics overlay
  - [ ] Include title bar
  - [ ] Export resolution (1x, 2x, 4x)
  - [ ] Export all views (batch export to ZIP)

**Edge Cases:**
- Handle high-resolution exports (memory limits)
- Ensure text remains legible at different scales
- Preserve transparency for overlays

**Estimated Effort:** 6-8 hours
**Dependencies:** None

#### 9.2 PDF Export (Priority 2)

**Goal:** Multi-page PDF with all views + specifications sheet

**Features:**
- Page 1: Room specifications and statistics
- Pages 2-5: TOP, FRONT, LEFT, RIGHT views
- Page 6: Object inventory list with dimensions
- Professional formatting with headers/footers

**Technical Approach:**
Use **jsPDF** library:
```javascript
import jsPDF from 'jspdf';

class PDFExportService {
  exportRoomToPDF(room, objects, windows, doors, statistics) {
    const pdf = new jsPDF('landscape', 'mm', 'a4');

    // Page 1: Cover & Specs
    this.addCoverPage(pdf, room, statistics);

    // Pages 2-5: Views
    ['TOP', 'FRONT', 'LEFT', 'RIGHT'].forEach((view, index) => {
      pdf.addPage();
      this.addViewPage(pdf, view, canvas);
    });

    // Page 6: Inventory
    pdf.addPage();
    this.addInventoryPage(pdf, objects, windows, doors);

    pdf.save(`RoomPlan_${timestamp}.pdf`);
  }
}
```

**Estimated Effort:** 10-12 hours
**Dependencies:** jsPDF library (~50KB)

#### 9.3 Project Save/Load (Priority 3)

**Goal:** Persist room designs for later editing

**Save Format (JSON):**
```json
{
  "version": "1.0",
  "room": {
    "dimensions": { "width": 400, "length": 500, "height": 250 }
  },
  "objects": [
    {
      "id": "obj_001",
      "name": "Queen Bed",
      "isPreset": true,
      "presetId": "queen_bed",
      "position": { "x": 100, "y": 150, "z": 0 },
      "rotation": 90,
      "color": "#4A90E2",
      "collisionEnabled": true
    }
  ],
  "windows": [ /* ... */ ],
  "doors": [ /* ... */ ],
  "metadata": {
    "created": "2025-11-30T14:32:00Z",
    "modified": "2025-11-30T15:45:00Z",
    "author": "User Name"
  }
}
```

**Storage Options:**
1. **LocalStorage:** Browser-based (5-10MB limit)
2. **IndexedDB:** Browser-based (unlimited)
3. **File Download/Upload:** .json files
4. **Cloud Sync:** Future backend integration

**Implementation:**
```javascript
class StorageService {
  saveProject(room, objects, windows, doors) {
    const projectData = {
      version: '1.0',
      room: this.serializeRoom(room),
      objects: objects.map(obj => this.serializeObject(obj)),
      windows: windows.map(w => this.serializeWindow(w)),
      doors: doors.map(d => this.serializeDoor(d)),
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    };

    // Save to localStorage
    localStorage.setItem('currentProject', JSON.stringify(projectData));

    // Or download as file
    this.downloadJSON(projectData, 'my-room-plan.json');
  }

  loadProject(jsonData) {
    // Validate version
    // Deserialize and reconstruct objects
    // Restore room state
    // Trigger full re-render
  }
}
```

**Auto-Save Feature:**
- Save to localStorage every 30 seconds
- Detect browser close and prompt to save
- "Restore previous session" on app launch

**Estimated Effort:** 12-15 hours

**Total Export Phase Effort:** 28-35 hours

---

### Phase 10: Undo/Redo Functionality

**Goal:** Allow users to revert mistakes and experiment freely

#### Implementation Strategy: Command Pattern

**Why Command Pattern?**
- Encapsulates each action as an object with `execute()` and `undo()` methods
- Natural fit for undo/redo stacks
- Easy to extend with new command types
- Supports macro commands (multiple actions as one undo unit)

#### Core Architecture

```javascript
// Base command interface
class Command {
  execute() { throw new Error('Must implement execute()'); }
  undo() { throw new Error('Must implement undo()'); }
  redo() { this.execute(); }  // Most commands can reuse execute()
}

// Command history manager
class CommandHistory {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 50;  // Limit memory usage
  }

  execute(command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];  // Clear redo on new action

    // Limit history size
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    this.eventBus.emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  undo() {
    if (!this.canUndo()) return;

    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);

    this.eventBus.emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  redo() {
    if (!this.canRedo()) return;

    const command = this.redoStack.pop();
    command.redo();
    this.undoStack.push(command);

    this.eventBus.emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
```

#### Example Commands

**1. Add Object Command**
```javascript
class AddObjectCommand extends Command {
  constructor(objectManager, object) {
    super();
    this.objectManager = objectManager;
    this.object = object;
  }

  execute() {
    this.objectManager.addObject(this.object);
    // Emit event for rendering
  }

  undo() {
    this.objectManager.removeObject(this.object.id);
    // Emit event for rendering
  }
}
```

**2. Move Object Command**
```javascript
class MoveObjectCommand extends Command {
  constructor(object, oldPosition, newPosition) {
    super();
    this.object = object;
    this.oldPosition = { ...oldPosition };
    this.newPosition = { ...newPosition };
  }

  execute() {
    this.object.move(this.newPosition.x, this.newPosition.y, this.newPosition.z);
  }

  undo() {
    this.object.move(this.oldPosition.x, this.oldPosition.y, this.oldPosition.z);
  }
}
```

**3. Rotate Object Command**
```javascript
class RotateObjectCommand extends Command {
  constructor(object, oldRotation, newRotation) {
    super();
    this.object = object;
    this.oldRotation = oldRotation;
    this.newRotation = newRotation;
  }

  execute() {
    this.object.rotation = this.newRotation;
  }

  undo() {
    this.object.rotation = this.oldRotation;
  }
}
```

**4. Edit Properties Command (Complex)**
```javascript
class EditObjectCommand extends Command {
  constructor(object, oldProps, newProps) {
    super();
    this.object = object;
    this.oldProps = { ...oldProps };
    this.newProps = { ...newProps };
  }

  execute() {
    Object.assign(this.object, this.newProps);
    // Recalculate stacking if dimensions changed
  }

  undo() {
    Object.assign(this.object, this.oldProps);
    // Recalculate stacking
  }
}
```

**5. Macro Command (Multi-Step Action)**
```javascript
class MacroCommand extends Command {
  constructor(commands) {
    super();
    this.commands = commands;
  }

  execute() {
    this.commands.forEach(cmd => cmd.execute());
  }

  undo() {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

// Example: Duplicate object (delete original + add copy = 1 undo)
const duplicate = new MacroCommand([
  new AddObjectCommand(manager, copy),
  new MoveObjectCommand(copy, originalPos, offsetPos)
]);
```

#### Integration Points

**1. Modify Controllers:**
```javascript
// Before (ObjectController):
deleteSelectedObjects() {
  this.objectManager.removeObject(id);
}

// After:
deleteSelectedObjects() {
  const cmd = new DeleteObjectCommand(this.objectManager, object);
  this.commandHistory.execute(cmd);
}
```

**2. Drag-and-Drop Challenge:**
Dragging emits many position updates. Options:
- **A) Record only on mouse-up:**
  ```javascript
  handleMouseDown() {
    this.dragStartPos = { ...object.position };
  }

  handleMouseUp() {
    const dragEndPos = { ...object.position };
    if (positionChanged(this.dragStartPos, dragEndPos)) {
      const cmd = new MoveObjectCommand(object, this.dragStartPos, dragEndPos);
      this.commandHistory.execute(cmd);
    }
  }
  ```

- **B) Batch intermediate moves:**
  Record final position only, discard intermediate states

**3. UI Components:**
- Undo/Redo buttons in toolbar (enabled/disabled based on stack state)
- Keyboard shortcuts: **Ctrl+Z** (undo), **Ctrl+Shift+Z** or **Ctrl+Y** (redo)
- Optional: Show undo history dropdown (last 10 actions)

#### Trackable Actions

**Objects:**
- ✅ Add/Delete
- ✅ Move (drag or property edit)
- ✅ Rotate
- ✅ Resize
- ✅ Toggle collision
- ✅ Toggle visibility
- ✅ Edit properties (name, color)
- ✅ Duplicate

**Windows:**
- ✅ Add/Delete
- ✅ Move (drag along wall)
- ✅ Resize (via handles)
- ✅ Edit properties (wall, dimensions)
- ✅ Duplicate

**Doors:**
- ✅ Add/Delete
- ✅ Move (drag along wall)
- ✅ Edit properties (swing direction, hinge, wall)
- ✅ Duplicate

**Room:**
- ✅ Change dimensions (warns about objects outside new bounds)

#### Edge Cases & Considerations

**1. Collision Failures:**
If undo/redo places object in invalid position (e.g., room was resized):
- Option A: Allow temporary invalid state with warning
- Option B: Adjust position to nearest valid location
- Option C: Skip that undo step with notification

**2. Memory Management:**
- Limit stack to 50 actions (configurable)
- Deep clone object state (avoid reference issues)
- Clear history on room reset

**3. Multi-Select:**
```javascript
class DeleteMultipleCommand extends Command {
  constructor(objectManager, objects) {
    super();
    this.objectManager = objectManager;
    this.objects = objects.map(obj => ({ ...obj }));  // Clone
  }

  execute() {
    this.objects.forEach(obj => this.objectManager.removeObject(obj.id));
  }

  undo() {
    this.objects.forEach(obj => this.objectManager.addObject(obj));
  }
}
```

**4. Stacking Recalculation:**
Some actions (move, resize, toggle collision) trigger Z-position recalculation for all objects. Command must store:
- Direct changes (moved object position)
- Indirect changes (other objects' Z positions)

```javascript
class MoveWithStackingCommand extends Command {
  constructor(object, oldPosition, newPosition, affectedObjects) {
    super();
    this.object = object;
    this.oldPosition = oldPosition;
    this.newPosition = newPosition;
    this.affectedZPositions = affectedObjects.map(obj => ({
      id: obj.id,
      z: obj.position.z
    }));
  }

  execute() {
    this.object.move(this.newPosition.x, this.newPosition.y, this.newPosition.z);
    recalculateAllZPositions();
  }

  undo() {
    this.object.move(this.oldPosition.x, this.oldPosition.y, this.oldPosition.z);
    // Restore Z positions
    this.affectedZPositions.forEach(({ id, z }) => {
      const obj = objectManager.getObject(id);
      if (obj) obj.position.z = z;
    });
  }
}
```

#### Development Phases

**Phase 10.1: Core System (8-10 hours)**
- Implement Command base class and CommandHistory
- Add basic commands (Add, Delete, Move, Rotate for objects)
- Integrate with ObjectController
- Wire up Ctrl+Z / Ctrl+Y keyboard shortcuts
- Add toolbar buttons with enabled/disabled states

**Phase 10.2: Extended Commands (6-8 hours)**
- Implement property editing commands (resize, color, name)
- Add window and door commands
- Handle multi-select operations
- Test edge cases (room resize, collision failures)

**Phase 10.3: UI Polish (4-6 hours)**
- Add visual feedback (toast notifications: "Undid: Add Queen Bed")
- Optional: History dropdown showing last actions
- Keyboard shortcut hints in tooltips
- Test with rapid undo/redo sequences

**Total Effort:** 18-24 hours

#### Success Criteria
- [ ] All object, window, door actions are undoable
- [ ] Undo/redo stacks limited to 50 actions
- [ ] Keyboard shortcuts work reliably
- [ ] No memory leaks from retained object references
- [ ] State remains consistent after undo/redo sequences
- [ ] UI buttons reflect available actions
- [ ] Drag-and-drop creates single undo action

---

## Development Roadmap Summary

### Completed (Phases 1-7)
- ✅ Room system with multi-view rendering
- ✅ Custom and preset objects (70+ catalog)
- ✅ Windows with resize handles
- ✅ Doors with swing arc visualization
- ✅ Collision detection and stacking
- ✅ Statistics and analytics
- ✅ Keyboard shortcuts for all actions
- ✅ Direction indicators for view navigation

### In Progress
- 🔄 Phase 9: Export functionality (PNG, PDF, save/load)

### Planned
- 📋 Phase 10: Undo/redo system
- 📋 Phase 11: Advanced features (templates, multi-room, 3D view)

### Long-Term Vision
- Cloud sync and collaboration
- Community object marketplace
- AR/VR integration for immersive visualization
- AI-powered layout suggestions

---

## Quick Reference

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| O | Add custom object |
| P | Add preset object |
| W | Add window |
| B | Add door |
| R | Rotate selected |
| D | Duplicate selected |
| H | Hide/show selected |
| C | Toggle collision |
| E | Deselect all |
| Delete | Remove selected |
| 1-4 | Switch views |
| Ctrl+A | Select all |
| Ctrl+Z | Undo (planned) |
| Ctrl+Y | Redo (planned) |
| Ctrl+E | Export (planned) |
| ? | Show help |

### UI Layout
```
┌─────────────┬────────────────────┐
│ CONTROLS    │                    │
│ - Room      │                    │
│ - Objects   │    CANVAS AREA     │
│ - Windows   │    (800×600)       │
│ - Doors     │                    │
│             │                    │
│ STATISTICS  │                    │
│ - Floor     │                    │
│ - Objects   │                    │
│ - Windows   │                    │
│ - Doors     │                    │
└─────────────┴────────────────────┤
│ [≡] [1][2][3][4]    Mode: Ready  │
└──────────────────────────────────┘
```

### Event Flow
```
User Action → Controller → Command (future) → Manager →
EventBus → Renderers → Canvas Update
```

---

## Contributing & Extension

### Adding Preset Objects
Edit `js/data/PresetObjects.js`:
```javascript
bedroom: {
  categoryName: "Bedroom",
  items: [
    {
      id: "super_king_bed",
      name: "Super King Bed",
      width: 200,
      length: 200,
      height: 50,
      color: "#4A90E2"
    }
  ]
}
```

### Creating New Commands (Undo/Redo)
```javascript
class MyCustomCommand extends Command {
  constructor(params) {
    super();
    this.params = params;
  }

  execute() {
    // Perform action
    // Emit events for rendering
  }

  undo() {
    // Reverse action
    // Emit events for rendering
  }
}
```

### Adding Statistics
Extend `StatisticsService.js`:
```javascript
calculateCustomMetric(objects, room) {
  // Your calculation logic
  return result;
}
```

---

**Document Version:** 5.0
**Authors:** Development Team
**License:** MIT (or specify your license)
