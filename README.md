# RoomPlanner

An interactive web-based space planning application that allows users to design and visualize items within a defined room. Users can define a floor plan with specific dimensions, add objects, windows, and doors, and visualize the layout in multiple views (top-down, front, left, right). The application provides real-time statistics about space utilization.

***

## Pre-release v0.95

This project is in late pre-release stage with all core features complete. The final 1.0 release will include export functionality, undo/redo, and additional polish.

***

## ✅ Features

-   **Room Definition:** Create a room with custom width, length, and height.
-   **Object Management:**
    -   **70+ Preset Objects** across 8 categories (Bedroom, Kitchen, Living Room, etc.)
    -   Add custom objects with user-defined dimensions
    -   Move, rotate, and delete objects with full interaction
    -   Edit object properties (dimensions, color, name)
    -   Toggle collision detection per-object to allow stacking
    -   Intelligent stacking system based on creation order
    -   Context menu for quick actions (edit, duplicate, delete, toggle collision)
-   **Window Management:**
    -   Add, move, resize, and delete windows on any wall
    -   PowerPoint-style 8-point resize handles for intuitive editing
    -   Windows visualized as cutouts in side views, wall markers in top view
    -   Collision prevention with doors and other windows
-   **Door Management:**
    -   Configurable swing direction (inward/outward) and hinge position (left/right)
    -   Swing arc visualization in top view showing clearance zones
    -   Perpendicular arc indicators in side views
    -   Automatic blocked door detection when objects obstruct swing path
    -   Collision prevention with windows and other doors
-   **Multiple Views:**
    -   Switch between Top, Front, Left, and Right views
    -   Hotkeys (1-4) for quick view changes
    -   Direction indicators showing viewing angle when hovering over view buttons
    -   Selection and manipulation of objects supported in all views
-   **Real-time Statistics:**
    -   Floor space usage (area and percentage)
    -   Object count and total volume
    -   Window count and total area
    -   Door count with blocked door tracking
    -   Tallest object and remaining ceiling height
-   **Keyboard Shortcuts:** Single-key shortcuts for all major actions (see below)
-   **Dark Theme Interface:** Modern, dark-themed UI with blue accents

***

## 📋 How to Use

1.  **Setup Room:** Define the room dimensions using the "Room Setup" button (default: 4m × 5m × 2.5m).
2.  **Add Items:**
    -   Press **O** to add a custom object with your own dimensions
    -   Press **P** to browse and select from 70+ preset objects
    -   Press **W** to add a window on a wall
    -   Press **B** to add a door with configurable swing
3.  **Edit Layout:**
    -   **Click** to select an object/window/door
    -   **Drag** to move it
    -   Press **R** to rotate objects
    -   Press **D** to duplicate selected items
    -   **Right-click** for context menu with more options
    -   **Windows:** Use 8-point resize handles to adjust dimensions
4.  **Change Perspective:**
    -   Use number keys `1`, `2`, `3`, `4` to switch between Top, Front, Left, and Right views
    -   Hover over view buttons to see directional arrows showing viewing angle
5.  **Analyze:** Check the statistics panel on the left to understand space utilization and blocked doors

***

## ⌨️ Keyboard Shortcuts

| Action              | Hotkey                    |
| ------------------- | ------------------------- |
| **CREATION**        |                           |
| Add Custom Object   | `O`                       |
| Add Preset Object   | `P`                       |
| Add Window          | `W`                       |
| Add Door            | `B`                       |
| **VIEWS**           |                           |
| Top View            | `1`                       |
| Front View          | `2`                       |
| Left View           | `3`                       |
| Right View          | `4`                       |
| **ACTIONS**         |                           |
| Rotate Selected     | `R`                       |
| Duplicate Selected  | `D`                       |
| Hide/Show Selected  | `H`                       |
| Toggle Collision    | `C`                       |
| Delete Selected     | `Delete` / `Backspace`    |
| **SELECTION**       |                           |
| Select All          | `Ctrl+A`                  |
| Deselect All        | `E`                       |
| Deselect/Cancel     | `Escape`                  |
| **HELP**            |                           |
| Show Shortcuts      | `?`                       |

***

## 🔮 Future Development

The following features are planned for the 1.0 release and beyond:

-   **Export Functionality:**
    -   Export current view as PNG image
    -   Multi-page PDF export with all views
    -   Project save/load (JSON format)
-   **Undo/Redo:** Full command pattern implementation for all actions
-   **Enhanced Statistics:** Wall utilization, traffic flow analysis, accessibility metrics
-   **Final Polish:** UI/UX improvements, performance optimization, comprehensive testing

For detailed technical documentation and implementation plans, see [HowToUse.md](HowToUse.md).

***

## 🛠️ Technical Details

-   **Technologies:** HTML5 Canvas, CSS3, Vanilla JavaScript (ES6+ OOP)
-   **Architecture:** Feature-based organization with event-driven communication
-   **Design Pattern:** MVC-inspired (Model-Controller-View-Renderer separation)
-   **No Dependencies:** Pure vanilla JavaScript, no external libraries required

***

## 📄 License

MIT License (or specify your license)
