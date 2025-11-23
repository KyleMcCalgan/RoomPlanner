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

**Project Type:** Web Application  
**Technologies:** HTML5, CSS3, Vanilla JavaScript  
**Primary Use Case:** Interior space planning and furniture arrangement  
**Target Users:** Anyone needing to visualize if items fit in a space  

**Document Version:** 1.0  
**Last Updated:** November 2025