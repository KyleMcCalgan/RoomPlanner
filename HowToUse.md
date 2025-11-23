# Space Planning Tool - Project Specification

## Project Overview

A simple web-based space planning application that allows users to check if items will fit into a defined space. Users can create a floor plan with specific dimensions and add objects with height, width, and length properties. The tool provides multiple views (top-down and side views) to visualize object placement and provides real-time statistics about space utilization.

## Core Concept

- Define a rectangular floor plan with custom dimensions
- Create 3D objects with specified dimensions (height, width, length)
- View objects from multiple angles (top-down, front, left, right)
- Toggle collision detection for stacking objects
- Add architectural features (windows, doors)
- Display real-time space statistics

---

## Project Requirements - Q&A Format

### 1. Interaction & Controls

**Q: How should object creation/placement work?**
- Objects should only be rotated in 90-degree increments
- Placement mechanism to be determined during implementation (likely click-to-place)

**Q: How should object manipulation work after placement?**
- Right-click on an object to open a context menu
- Menu options should include:
  - Edit dimensions (width, length, height)
  - Change outline color
  - Fine-tune position values (X, Y, Z coordinates)
  - Assign/edit object name

**Q: What measurement units should be used?**
- All measurements in centimeters (cm)

### 2. Floor Plan Details

**Q: What room shapes are supported?**
- Rectangular rooms only (for initial version)

**Q: Should multiple rooms be supported?**
- Single room only

**Q: How should walls be handled?**
- Walls are not a concern for this application
- Focus is purely on interior space planning
- No wall thickness calculations needed

### 3. Objects & Collision

**Q: How should collision detection work?**
- Collision with room boundaries is permanent (objects cannot be placed outside the room)
- Collision between objects can be toggled off per object
- When collision is disabled, objects can be placed on top of existing objects
- Stacking order is determined by creation order (first created = bottom layer)
- Example: Create 2x2m object, place it, then create 1x1m object and stack it on top

**Q: How should stacking behavior work?**
- Manual positioning (no auto-snap to top of other objects)
- This allows for overhanging objects and precise control

**Q: Should there be a library of preset furniture?**
- No preset library
- All objects are custom-created with dimensions
- Users can assign custom names to objects during creation and editing

### 4. Views & Visualization

**Q: Should all views be visible simultaneously?**
- Show one view at a time
- Allow cycling through views with hotkeys
- Quick-switch functionality between views

**Q: How should camera controls work?**
- Views should be fitted to show the entire room area
- Automatically scaled to fit viewport

**Q: Should there be measurement indicators?**
- Yes, always display rulers showing dimensions in all views
- Rulers should help users understand scale and measurements

### 5. Windows & Walls

**Q: How should windows be represented?**
- Purely flat cutouts in the wall (visible in side views only)
- Not present/visible in top-down view
- No depth or sill depth

**Q: Should doors be included?**
- Yes, treat doors the same as windows (cutouts in side views)
- In top-down view: Display the arc showing door swing range
- Assumption: Doors always swing inwards

### 6. Statistics & Data

**Q: What statistics should be displayed?**
- Floor space available (remaining)
- Total floor space
- Floor space used (by objects)
- Floor space percentage used
- Total volume of all objects
- Number of objects in room
- Tallest object height
- Remaining vertical space (room height - tallest object)

**Q: Should projects be saveable or exportable?**
- Export functionality: PNG export for each view separately
- Top-down view → export as PNG
- Front view → export as PNG
- Left view → export as PNG
- Right view → export as PNG

### 7. Technical Preferences

**Q: What platform should this be built for?**
- Web application
- Technologies: HTML, CSS, and vanilla JavaScript
- Keep implementation simple and straightforward
- No frameworks required for MVP

**Q: Feature completeness level?**
- Keep it simple and functional for initial version
- Focus on core features working properly
- Additional features can be added incrementally later

---

## Feature Breakdown

### Core Features (MVP)

1. **Room Definition**
   - Input fields for room dimensions (length, width, height in cm)
   - Visual representation of room boundaries
   - Room dimensions always displayed

2. **Object Creation**
   - Create objects with custom dimensions (width, length, height)
   - Assign names to objects
   - Choose outline color for each object
   - 90-degree rotation only

3. **Object Management**
   - Right-click context menu for editing
   - Move objects within the room
   - Fine-tune position with coordinate inputs
   - Delete objects
   - Toggle collision detection per object

4. **Multiple Views**
   - Top-down view (primary view)
   - Front side view
   - Left side view
   - Right side view
   - Hotkey switching between views
   - View indicator showing current view

5. **Architectural Features**
   - Add windows (cutouts in side views)
   - Add doors (cutouts in side views, swing arc in top-down)
   - Position windows/doors on specific walls

6. **Visual Elements**
   - Object outlines (color-coded)
   - Measurement rulers on all views
   - Grid overlay (optional)
   - Clear visual distinction between stacked objects

7. **Statistics Panel**
   - Real-time updates
   - Floor space metrics
   - Object volume calculations
   - Height information
   - Object count

8. **Export Functionality**
   - Export current view as PNG
   - Filename indicates view type and timestamp

---

## Suggested File Structure

```
space-planner/
│
├── index.html                 # Main HTML file
│
├── css/
│   ├── main.css              # Main stylesheet
│   ├── views.css             # View-specific styles
│   ├── controls.css          # UI controls styling
│   └── stats.css             # Statistics panel styling
│
├── js/
│   ├── main.js               # Application initialization
│   ├── room.js               # Room/floor plan management
│   ├── object.js             # Object class and management
│   ├── renderer.js           # Canvas rendering logic
│   ├── views.js              # View switching and management
│   ├── collision.js          # Collision detection logic
│   ├── ui.js                 # UI controls and interactions
│   ├── contextMenu.js        # Right-click menu functionality
│   ├── statistics.js         # Statistics calculations
│   ├── export.js             # PNG export functionality
│   └── utils.js              # Utility functions
│
├── assets/
│   └── icons/                # UI icons if needed
│
└── README.md                 # Project documentation
```

---

## User Interface Layout

### Main Application Layout

```
┌─────────────────────────────────────────────────────┐
│  Space Planning Tool                        [Export]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Room Setup]  [Add Object]  [Add Window/Door]     │
│                                                     │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   Statistics Panel   │     Main Canvas View         │
│                      │                              │
│  Floor Space: XXX cm²│     [Current View Display]   │
│  Space Used: XX%     │                              │
│  Objects: X          │                              │
│  Total Volume: XXX   │                              │
│  Tallest: XXX cm     │                              │
│                      │                              │
│                      │                              │
└──────────────────────┴──────────────────────────────┘
│  View: [Top] [Front] [Left] [Right]   Hotkeys: 1234│
└─────────────────────────────────────────────────────┘
```

---

## Technical Implementation Notes

### Canvas Rendering

- Use HTML5 Canvas for all visualizations
- Separate rendering logic for each view type
- Scale factor calculations to fit room in viewport
- Clear separation between model data and view rendering

### Object Data Structure

```javascript
{
  id: unique_identifier,
  name: "Object Name",
  dimensions: {
    width: cm,
    length: cm,
    height: cm
  },
  position: {
    x: cm,
    y: cm,
    z: cm  // height off ground
  },
  rotation: 0 | 90 | 180 | 270,  // degrees
  color: "#hexcolor",
  collisionEnabled: boolean,
  creationOrder: number  // for stacking order
}
```

### Room Data Structure

```javascript
{
  dimensions: {
    width: cm,
    length: cm,
    height: cm
  },
  windows: [
    {
      wall: "front" | "back" | "left" | "right",
      position: cm,  // position along wall
      width: cm,
      height: cm,
      heightFromFloor: cm
    }
  ],
  doors: [
    {
      wall: "front" | "back" | "left" | "right",
      position: cm,
      width: cm,
      height: cm,
      swingDirection: "left" | "right"
    }
  ]
}
```

### View Rendering Priorities

**Top-Down View:**
- Draw room boundary
- Draw objects as rectangles (with rotation)
- Draw door swing arcs
- Show object names/labels
- Display measurement rulers
- Color-coded outlines

**Side Views (Front/Left/Right):**
- Draw room profile (floor and ceiling)
- Draw objects as rectangles showing width and height
- Show stacked objects correctly
- Draw windows and doors as cutouts
- Display measurement rulers
- Show depth perception with shading/lines

---

## Hotkeys

- `1` - Switch to Top-Down view
- `2` - Switch to Front view
- `3` - Switch to Left view
- `4` - Switch to Right view
- `Delete` - Delete selected object
- `R` - Rotate selected object 90°
- `Ctrl/Cmd + E` - Export current view
- `Escape` - Deselect object / Close context menu

---

## Future Enhancement Ideas

(Not included in MVP, but noted for future development)

- Undo/Redo functionality
- Object duplication
- Save/Load projects (JSON format)
- Multiple rooms/floor plans
- Non-rectangular room shapes
- Preset furniture library
- 3D isometric view
- Measurement tools (distance between objects)
- Object grouping
- Layer system
- Grid snapping toggle
- Custom object colors and textures
- Print functionality
- Object templates/favorites

---

## Development Phases

### Phase 1: Core Setup
- Basic HTML structure
- Room definition interface
- Canvas setup and basic rendering
- Top-down view implementation

### Phase 2: Object Management
- Object creation system
- Object placement and movement
- Rotation functionality
- Object data management

### Phase 3: Context Menu & Editing
- Right-click context menu
- Edit dimensions interface
- Color picker
- Position fine-tuning

### Phase 4: Multiple Views
- Front view implementation
- Left/Right view implementation
- View switching system
- Hotkey controls

### Phase 5: Collision & Stacking
- Collision detection system
- Toggle collision per object
- Stacking visualization
- Z-ordering management

### Phase 6: Architectural Features
- Window creation and placement
- Door creation and placement
- Door swing arc visualization

### Phase 7: Statistics & Polish
- Statistics calculation
- Real-time statistics panel
- Measurement rulers
- UI polish and refinement

### Phase 8: Export
- Canvas to PNG conversion
- Export functionality for all views
- Filename generation

---

## Success Criteria

The MVP will be considered complete when:

1. ✅ Users can define a rectangular room with custom dimensions
2. ✅ Users can create objects with custom dimensions and names
3. ✅ Objects can be placed, moved, and rotated (90° increments)
4. ✅ Right-click context menu allows editing of all object properties
5. ✅ All four views (top, front, left, right) render correctly
6. ✅ View switching works smoothly with hotkeys
7. ✅ Collision detection works for room boundaries
8. ✅ Objects can be stacked when collision is toggled off
9. ✅ Windows and doors can be added and display correctly
10. ✅ Statistics panel updates in real-time with accurate calculations
11. ✅ Each view can be exported as a PNG image
12. ✅ Measurement rulers are visible and accurate in all views
13. ✅ The application is responsive and performs smoothly

---

## Notes & Considerations

- Keep the UI minimal and functional
- Prioritize accuracy in measurements and calculations
- Ensure visual clarity in all views
- Test stacking behavior thoroughly
- Validate room and object dimensions (positive values only)
- Consider maximum reasonable dimensions for performance
- Handle edge cases (objects at boundaries, extreme dimensions)
- Provide clear visual feedback for user actions
- Display helpful error messages when needed
- Ensure export images are high quality and properly scaled

---

# Order of Operations Map

## PHASE 1: Foundation & Basic Rendering ⭐ START HERE
**Goal:** Get a canvas displaying a room boundary

### Step 1.1 - HTML Structure & Styling
- Create `index.html` with basic layout
- Create `css/main.css` with layout structure
- Create empty placeholder JS files
- **Deliverable:** Static UI that loads without errors
- **Dependencies:** None

### Step 1.2 - Room Definition System
- Create `js/room.js` - Room data structure and management
- Create `js/main.js` - Initialize application and room setup form
- **Deliverable:** Can input room dimensions and store them
- **Dependencies:** None

### Step 1.3 - Basic Canvas Rendering
- Create `js/renderer.js` - Canvas setup and room boundary drawing
- Implement scale calculations to fit room in viewport
- Add rulers/measurements
- **Deliverable:** See your room boundaries drawn on canvas
- **Dependencies:** 1.2 (needs room data)

---

## PHASE 2: Object Creation & Placement ⭐ CORE FUNCTIONALITY
**Goal:** Click to place simple rectangular objects

### Step 2.1 - Object Data Structure
- Create `js/object.js` - Object class with properties (dimensions, position, color, etc.)
- Object creation form/modal in UI
- **Deliverable:** Can create object data (even if not visible yet)
- **Dependencies:** None (standalone)

### Step 2.2 - Object Rendering (Top-Down View)
- Extend `js/renderer.js` to draw objects as rectangles
- Draw objects with colors and names/labels
- **Deliverable:** Objects appear on canvas in top-down view
- **Dependencies:** 2.1, 1.3

### Step 2.3 - Click-to-Place System
- Create `js/ui.js` - Handle canvas mouse events
- Implement placement mode (click canvas to place pending object)
- Preview object at mouse position before placement
- **Deliverable:** Can click canvas to place objects
- **Dependencies:** 2.1, 2.2

### Step 2.4 - Basic Collision Detection
- Create `js/collision.js` - Room boundary collision only
- Prevent objects from being placed outside room
- Visual feedback when placement is invalid
- **Deliverable:** Objects can't be placed outside room boundaries
- **Dependencies:** 2.3

---

## PHASE 3: Object Manipulation
**Goal:** Select, move, rotate, and delete objects

### Step 3.1 - Object Selection
- Extend `js/ui.js` to detect clicks on existing objects
- Visual feedback for selected object (highlight/outline)
- **Deliverable:** Can click to select placed objects
- **Dependencies:** 2.2

### Step 3.2 - Object Movement
- Drag selected objects to new positions
- Real-time collision checking while dragging
- **Deliverable:** Can drag objects around the room
- **Dependencies:** 3.1, 2.4

### Step 3.3 - Rotation & Deletion
- Add keyboard controls for rotation (R key = 90° rotation)
- Add delete key to remove selected object
- Update rendering to handle rotated objects
- **Deliverable:** Can rotate and delete objects with keyboard
- **Dependencies:** 3.1

---

## PHASE 4: Context Menu & Advanced Editing
**Goal:** Right-click menu for detailed object editing

### Step 4.1 - Context Menu System
- Create `js/contextMenu.js` - Right-click menu display
- Create `css/controls.css` - Style the context menu
- Menu appears on right-click on object
- **Deliverable:** Context menu appears and closes properly
- **Dependencies:** 3.1

### Step 4.2 - Edit Properties Modal/Form
- Create forms for editing dimensions, position, color, name
- Update object data on submit
- Refresh canvas rendering
- **Deliverable:** Can edit all object properties via context menu
- **Dependencies:** 4.1

### Step 4.3 - Collision Toggle Per Object
- Add checkbox in edit form to toggle collision
- Update collision detection to respect this flag
- **Deliverable:** Can stack objects by disabling collision
- **Dependencies:** 4.2, 2.4

---

## PHASE 5: Multiple Views
**Goal:** Switch between top-down, front, left, right views

### Step 5.1 - View Management System
- Create `js/views.js` - Track current view state
- Add view switching buttons and hotkeys (1,2,3,4)
- Create `css/views.css` - Style view controls
- **Deliverable:** Can switch views (even if they don't render differently yet)
- **Dependencies:** None (standalone)

### Step 5.2 - Side View Rendering
- Extend `js/renderer.js` with side view logic
- Implement front view (show width and height)
- Implement left/right views (show length and height)
- Handle stacked objects correctly
- **Deliverable:** All four views render correctly
- **Dependencies:** 5.1, 2.2

### Step 5.3 - View-Specific Rulers
- Add appropriate measurements for each view
- Update ruler display when switching views
- **Deliverable:** Rulers show correct measurements in all views
- **Dependencies:** 5.2

---

## PHASE 6: Architectural Features
**Goal:** Add windows and doors

### Step 6.1 - Window System
- Extend `js/room.js` to store windows
- Create window creation form
- Render windows in side views only (as cutouts)
- **Deliverable:** Can add and see windows in side views
- **Dependencies:** 5.2

### Step 6.2 - Door System
- Extend `js/room.js` to store doors
- Create door creation form
- Render doors in side views (cutouts) and top view (swing arc)
- **Deliverable:** Can add and see doors in all views
- **Dependencies:** 6.1, 5.2

---

## PHASE 7: Statistics & Polish
**Goal:** Real-time statistics and visual polish

### Step 7.1 - Statistics Calculation
- Create `js/statistics.js` - Calculate all metrics
- Create `css/stats.css` - Style statistics panel
- **Deliverable:** Statistics display and update in real-time
- **Dependencies:** 2.1 (needs object data)

### Step 7.2 - UI Polish
- Add loading states, better visual feedback
- Improve error handling and user messages
- Refine colors, spacing, overall aesthetics
- **Deliverable:** Professional-looking, smooth interface
- **Dependencies:** All previous phases

---

## PHASE 8: Export Functionality
**Goal:** Export each view as PNG

### Step 8.1 - PNG Export System
- Create `js/export.js` - Canvas to PNG conversion
- Add export button with filename generation
- Create `js/utils.js` - Helper functions for dates, formatting
- **Deliverable:** Can export current view as PNG file
- **Dependencies:** 5.1 (needs view management)

---

## Dependency Visualization

```
1.1 (HTML/CSS) ──> 1.2 (Room Data) ──> 1.3 (Canvas) ──┐
                                                      │
2.1 (Object Data) ────────────────────────┐          │
                                           ↓          ↓
                                    2.2 (Render Objects)
                                           ↓
                                    2.3 (Placement)
                                           ↓
                                    2.4 (Collision)
                                           ↓
                                    3.1 (Selection)
                                      ↙        ↘
                            3.2 (Movement)  3.3 (Rotate/Delete)
                                  ↓
                            4.1 (Context Menu)
                                  ↓
                            4.2 (Edit Form)
                                  ↓
                            4.3 (Collision Toggle)

5.1 (View System) ──> 5.2 (Side Views) ──> 5.3 (View Rulers)
                           ↓
                    6.1 (Windows) ──> 6.2 (Doors)

7.1 (Statistics) ──> 7.2 (Polish)

8.1 (Export) [depends on 5.1]
```

---

## Critical Path (Minimum Viable Product)

To get a **working MVP**, you must complete:
- 1.1 → 1.2 → 1.3 (See room)
- 2.1 → 2.2 → 2.3 → 2.4 (Place objects)
- 3.1 → 3.2 (Select and move objects)
- 7.1 (Statistics)

Everything else enhances but isn't strictly required for "functional."

---

## Recommended Build Order

1. **Phase 1** (entire) - Foundation
2. **Phase 2** (entire) - MAJOR MILESTONE: Object placement working
3. **Phase 3** (Steps 3.1, 3.2) - Basic manipulation
4. **Phase 7** (Step 7.1) - Quick win: see stats working
5. **Phase 3** (Step 3.3) - Complete basic manipulation
6. **Phase 4** (entire) - Advanced editing
7. **Phase 5** (entire) - Multiple views
8. **Phase 6** (entire) - Windows/doors
9. **Phase 7** (Step 7.2) - Final polish
10. **Phase 8** (entire) - Export functionality

---

## Implementation Notes for Developers

### Starting Phase 1
When beginning development, create all files in the suggested structure first, even if they're empty. This prevents import errors and allows you to build incrementally.

### Testing Checkpoints
After each phase step, test thoroughly:
- Does it work as expected?
- Are there console errors?
- Does it break any previous functionality?

### Common Pitfalls to Avoid
- Not validating user input (negative dimensions, etc.)
- Forgetting to update canvas after data changes
- Not handling edge cases in collision detection
- Coordinate system confusion between canvas pixels and room centimeters

### Performance Considerations
- Redraw canvas only when necessary
- Use requestAnimationFrame for smooth interactions
- Limit re-calculations during drag operations

---

**Project Type:** Web Application  
**Technologies:** HTML5, CSS3, Vanilla JavaScript  
**Primary Use Case:** Interior space planning and furniture arrangement  
**Target Users:** Anyone needing to visualize if items fit in a space  

**Document Version:** 2.0  
**Last Updated:** November 2025