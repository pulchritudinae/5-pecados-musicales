from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import mimetypes
import os

ROOT = Path(__file__).resolve().parent.parent

# Ensure .copy files are served as HTML for previewing.
mimetypes.add_type('text/html', '.copy', True)
mimetypes.add_type('text/html', '.COPY', True)

class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        # Keep the terminal output clean while previewing.
        pass


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8002))
    server = ThreadingHTTPServer(('0.0.0.0', port), PreviewHandler)
    print(f'Preview server running at http://localhost:{port}')
    print('Copy files such as leo.copy will be served as HTML.')
    server.serve_forever()
