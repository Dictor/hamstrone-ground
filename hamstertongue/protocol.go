package hamstertongue

// MessageConstant is definition of protocol constant
var MessageConstant map[string](map[string]uint8) = map[string](map[string]uint8){
	"Structure": map[string]uint8{
		"Marker": 0xFF,
	},
	"Verb": map[string]uint8{
		"Heartbeat": 0x00,
		"Value":     0x01,
		"Signal":    0x02,
		"Debug":     0x03,
	},
	"SignalNoun": map[string]uint8{
		"InitOK":      0x00,
		"InitFail":    0x01,
		"I2CReadFail": 0x02,
	},
}
