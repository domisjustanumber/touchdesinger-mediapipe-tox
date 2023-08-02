# me - this DAT
# scriptOp - the OP which is cooking
#

import json

# press 'Setup Parameters' in the OP to call this function to re-create the parameters.
def onSetupParameters(scriptOp):
	return

# called whenever custom pulse parameter is pushed
def onPulse(par):
	return

def onCook(scriptOp):
	scriptOp.clear()
	scriptOp.setSize(4,4)

	rawdata = json.loads(op('landmark_data').text)
	# print(rawdata['faceLandmarks'])
	transformMatrix = rawdata['facialTransformationMatrixes'][0]['data']
	# print(len(transformMatrix))
	for i in range (len(transformMatrix)):
		scriptOp[0,0] = transformMatrix[0]
		scriptOp[1,0] = transformMatrix[1]
		scriptOp[2,0] = transformMatrix[2]
		scriptOp[3,0] = transformMatrix[3]
		scriptOp[0,1] = transformMatrix[4]
		scriptOp[1,1] = transformMatrix[5]
		scriptOp[2,1] = transformMatrix[6]
		scriptOp[3,1] = transformMatrix[7]
		scriptOp[0,2] = transformMatrix[8]
		scriptOp[1,2] = transformMatrix[9]
		scriptOp[2,2] = transformMatrix[10]
		scriptOp[3,2] = transformMatrix[11]
		scriptOp[0,3] = transformMatrix[12]
		scriptOp[1,3] = transformMatrix[13]
		scriptOp[2,3] = transformMatrix[14]
		scriptOp[3,3] = transformMatrix[15]
	return
