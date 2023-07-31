# me - this DAT
# scriptOp - the OP which is cooking

triangles = []

op = me.owner
mesh = op.par.Mesh.eval()
for i in range(mesh.numRows):
	data = [int(mesh[i, 0]), int(mesh[i, 1]), int(mesh[i, 2])]
	triangles.append(data)

# press 'Setup Parameters' in the OP to call this function to re-create the parameters
def onSetupParameters(scriptOp):
	page = scriptOp.appendCustomPage('Custom')
	m = page.appendDAT('Mesh', label='Mesh data')
	b = page.appendPulse('Load', label='Load data')
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
	scriptOp.clear()
	landmarks = op('landmarks')

	for i in range (landmarks.numRows):
		p = scriptOp.appendPoint()
		p.x = landmarks[i,0]
		p.y = 1- landmarks[i,1]
		p.z = landmarks[i,2]

	for poly in triangles:
		pp = scriptOp.appendPoly(3, closed=True, addPoints=False)
		pp[0].point = scriptOp.points[poly[0]]
		pp[1].point = scriptOp.points[poly[1]]
		pp[2].point = scriptOp.points[poly[2]]
			
	return