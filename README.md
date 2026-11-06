# Progress Pie

A rebuild of the project progress pie from Things, matched to the reference video.

Reference: [Design Spells — Progress indicator animation in Things](https://designspells.com/spells/progress-indicator-animation-in-things)

## Interaction

Checking an item fills the pie next to the title clockwise from 12 o'clock in 0.09s; unchecking shrinks it in 0.1s. With all three checked the circle is full.

While pressed, the row turns grey and the checkbox grows slightly. On check, the blue fill grows over 0.17s, the check mark draws after 0.2s and the label dims after 0.33s. Only the title row and checklist are shown; the sidebar and window chrome are left out.

## How it was made

- Positions, sizes, colors and timing were measured frame by frame from the video (1920x1080). The video is the app zoomed about 2.4x, so the page draws it at real app size, centered in the window.
- Inter stands in for the macOS system font, sized so cap height and ink width match the video.
- No build step: just `index.html`, `style.css` and `main.js`.

## URL options

- `?demo`: checks and unchecks the items in turn, as in the video (for the gallery preview).
- `?full`: keeps the original video framing (for comparison).
