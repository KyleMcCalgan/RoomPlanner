# RoomPlanner

An interactive web-based space planning application that allows users to design and visualize items within a defined room. Users can define a floor plan with specific dimensions, add objects, windows, and doors, and visualize the layout in multiple views (top-down, front, left, right). The application provides real-time statistics about space utilization.

***

## Pre-release v0.9

This project is currently in a pre-release stage. It is functionally complete and includes the core features for room, object, and window management. The final 1.0 release will include some additional improvements to doors, export functionality, and general polish.

***

## ✅ Features

-   **Room Definition:** Create a room with custom width, length, and height.
-   **Object Management:**
    -   Add, move, rotate, and delete objects.
    -   Edit object properties (dimensions, color).
    -   Toggle collision detection per-object to allow stacking.
    -   Intelligent stacking system based on creation order.
    -   Context menu for quick actions (edit, duplicate, delete).
-   **Window Management:**
    -   Add, move, resize, and delete windows on walls.
    -   PowerPoint-style resize handles for intuitive editing.
    -   Windows are visualized as cutouts in side views.
-   **Multiple Views:**
    -   Switch between Top, Front, Left, and Right views.
    -   Hotkeys (1-4) for quick view changes.
    -   Selection and manipulation of objects is supported in all views.
-   **Real-time Statistics:**
    -   See live data on floor space usage, object count, volume, and more.
-   **Dark Theme Interface:** A modern, dark-themed UI.

***

## 📋 How to Use

1.  **Setup Room:** Define the room dimensions using the "Room Setup" control.
2.  **Add Items:**
    -   Use "Add Object" to create and place furniture and other items.
    -   Use "Add Window" to place windows on the walls (best viewed from side views).
3.  **Edit Layout:**
    -   **Click** to select an object.
    -   **Drag** to move it.
    -   Press **'R'** to rotate it.
    -   **Right-click** an object for more options like "Edit" or "Duplicate".
4.  **Change Perspective:** Use the number keys `1`, `2`, `3`, `4` to switch between Top, Front, Left, and Right views to see your layout from all angles.
5.  **Analyze:** Check the statistics panel on the left to understand space utilization.

***

## ⌨️ Hotkeys & Controls

| Action              | Hotkey                    |
| ------------------- | ------------------------- |
| Top-Down View       | `1`                       |
| Front View          | `2`                       |
| Left View           | `3`                       |
| Right View          | `4`                       |
| Rotate Selected     | `R`                       |
| Delete Selected     | `Delete` / `Backspace`    |
| Deselect/Close Menu | `Escape`                  |

***

## 🔮 Future Development

The following features are planned for the upcoming 1.0 release and beyond:

-   **Export:** Functionality to export the current view as a PNG image.
-   **Undo/Redo:** Undo and redo actions.
-   **Final Polish:** General UI/UX improvements and bug fixes.