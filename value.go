package main

import (
	"encoding/json"
	"io/ioutil"
	"sync"
)

type (
	ValueInfo struct {
		Name    string `json:"name"`
		Unit    string `json:"unit"`
		Handler string `json:"handler"`
	}
)

var (
	// ValueIDToKey is definition of string value key's integer id
	ValueIDToKey map[string]ValueInfo = map[string]ValueInfo{}
	Value        map[string]uint32    = map[string]uint32{}
	ValueMutex   *sync.Mutex          = &sync.Mutex{}
)

func ReadValueData(path string) error {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}
	if err := json.Unmarshal(data, &ValueIDToKey); err != nil {
		return err
	}
	return nil
}
