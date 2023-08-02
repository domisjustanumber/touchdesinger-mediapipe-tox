# me - this DAT
# scriptOp - the OP which is cooking

import json

# press 'Setup Parameters' in the OP to call this function to re-create the parameters.
def onSetupParameters(scriptOp):
	return

# called whenever custom pulse parameter is pushed
def onPulse(par):
	return

def onCook(scriptOp):
	scriptOp.clear()
	scriptOp.numSamples = 3
	rawdata = json.loads(op('landmark_data').text)
	# print(rawdata['faceLandmarks'])
	landmarks = rawdata['faceLandmarks'][0]

	for i in range (len(landmarks)):
		p = scriptOp.appendChan(i)
		p[0] = landmarks[i]['x']
		p[1] = 1- landmarks[i]['y']
		p[2] = landmarks[i]['z']

	return
