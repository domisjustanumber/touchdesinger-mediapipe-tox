# me - this DAT
# scriptOp - the OP which is cooking

import json

triangles = []
mesh = op('facemesh_triangles')
for i in range(mesh.numRows):
	data = [int(mesh[i, 0]), int(mesh[i, 1]), int(mesh[i, 2])]
	triangles.append(data)

# press 'Setup Parameters' in the OP to call this function to re-create the parameters
def onSetupParameters(scriptOp):
	return

# called whenever custom pulse parameter is pushed
def onPulse(par):
	if par.name == 'Load':
		op = par.owner
		mesh = op.par.Mesh.eval()
		for i in range(mesh.numRows):
			data = [int(mesh[i, 0]), int(mesh[i, 1]), int(mesh[i, 2])]
			triangles.append(data)
	return

def onCook(scriptOp):
	rawdata = json.loads(op('landmark_data').text)
	# print(rawdata['faceLandmarks'][0][0]['x'])
	scriptOp.clear()
	landmarks = rawdata['faceLandmarks'][0]

	for i in range (len(landmarks)):
		p = scriptOp.appendPoint()
		p.x = landmarks[i]['x']
		p.y = 1- landmarks[i]['y']
		p.z = landmarks[i]['z']

	for poly in triangles:
		pp = scriptOp.appendPoly(3, closed=True, addPoints=False)
		pp[0].point = scriptOp.points[poly[0]]
		pp[1].point = scriptOp.points[poly[1]]
		pp[2].point = scriptOp.points[poly[2]]
			
	return