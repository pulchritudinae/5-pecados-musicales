# Previewing copy files

Use the server script below whenever you want to preview a `.copy` page as HTML:

```bash
python scripts/serve_copy_previews.py
```

Then open URLs such as:
- http://localhost:8002/leo.copy
- http://localhost:8002/kim.copy
- http://localhost:8002/ander.copy
- http://localhost:8002/asher.copy
- http://localhost:8002/bodhi copy.html
- http://localhost:8002/preview.html

Why this works:
- The script registers `.copy` as `text/html`.
- This prevents the browser from treating the file as a download.
- It lets you preview the exact copy files you are editing.
