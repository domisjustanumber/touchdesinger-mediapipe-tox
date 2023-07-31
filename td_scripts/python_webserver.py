import asyncio
import os
import http.server
import socketserver

# Define the port and root directory
PORT = int(parent().par.Mediapipeport)
DIRECTORY = os.path.join(os.getcwd(), 'dist/')

class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    # def translate_path(self, path):
      #  path = super().translate_path(path)
       # return os.path.join(self.directory, os.path.relpath(path, os.path.curdir))

# Define the request handler
Handler = CustomRequestHandler

def start_server():
    try:
        with http.server.HTTPServer(("", PORT), Handler) as httpd:
            print(f"Serving on port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"Port {PORT} is already in use.")
        else:
            print(f"Error starting server: {e}")
            
async def startServer():
	loop = asyncio.get_event_loop()
	# Arrange for func to be called in the specified executor. 
	r = await loop.run_in_executor(None, start_server)

started = False;

def startup():
	coroutines = [startServer()]
	op.TDAsyncIO.Run(coroutines)
	menu = op('menu_names').path
	webcam_options = op('webcam_options').path
	output = f"op('{menu}').module.MyDATMenu('{webcam_options}')"
	me.parent().par.Webcam.menuSource = output


def onStart():
	startup()
	return

def onCreate():
	startup()
	return

def onExit():
	return

def onFrameStart(frame):
	return

def onFrameEnd(frame):
	return

def onPlayStateChange(state):
	return

def onDeviceChange():
	return

def onProjectPreSave():
	return

def onProjectPostSave():
	return
