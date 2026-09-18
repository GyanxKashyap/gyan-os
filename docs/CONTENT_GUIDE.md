# Editing the portfolio

## Profile and projects

- `src/data/about.json`: biography, contact links, interests, skill groups,
  journey and achievements. Keep claims tied to actual work.
- `src/data/projects.json`: project ID, title, category, description, technologies,
  status, source/demo URLs and optional highlights. A null link hides that action.
- `src/data/knowledge.json`: categorized notes and related topics.
- `src/data/aizen.json` and `loss_curves.json`: documented model results and
  training curves. Update these from source results rather than estimating.

## Project screenshots

Place screenshots in `src/assets/shots/` using `<project-id>-1.png`,
`<project-id>-2.jpg`, etc. Supported extensions are defined in Projects.tsx.
The project ID must match its JSON entry. The first image appears in the card;
all matching images appear in its gallery. The Aizen and AI Chatbot galleries
contain the screenshots supplied by Gyan.

Use a new number for each image, keep the original aspect ratio, and verify the
thumbnail and full view at a narrow window size. Files are bundled at build time.

## Profile image and résumé

`src/apps/About.tsx` discovers files in `src/assets/profile/`. Use `avatar.png`
(or another supported image format) and optionally `resume.pdf`. A résumé button
appears only when a matching file exists. Avatar zoom/focus are set in About.tsx.

## Wallpaper defaults

`src/lib/wallpapers.ts` selects `samurai` as the fresh-install default. The video
and still poster live in `public/wallpapers/`. The poster is used when motion or
Live wallpaper is off. Built-in wallpaper previews live in Settings.

An existing browser preference takes precedence over the default. To try the
new default in an existing installation, select **Samurai Crimson Gaze** in
Settings. Do not clear browser data merely to change wallpaper: that can also
remove saved notes and Timer history. Custom uploads remain private to the browser
and are not automatically added to GitHub.

## Verify edits

Run `npm test`, `npm run lint`, and `npm run build`. Open the changed app in the
browser and inspect its normal and narrow layouts. Do not include model weights,
private configuration, generated build output, or personal browser databases in
source commits.
