var HamstroneApp = {
    app: {},
    ws: {},
    init: function() {
        this.app = new Vue({
            el: '#app',
            data: {
                menus: [
                    { text: "Value", page: "value" },
                    { text: "Signal", page: "signal" },
                ],
                values: [],
                valueKeys: {},
                protocol: {},
                signals: [],
                currentPage: "value",
            },
            methods: {
                onMenuClick: function(m) {
                    this.currentPage = m.page;
                },
                findSignalNounString: function(noun) {
                    for (n in this.protocol.Noun.Signal) {
                        if (this.protocol.Noun.Signal[n] === noun) return n;
                    }
                    return noun;
                },
                findValueInfoString: function(key, type) {
                    if (this.valueKeys[key]) {
                        switch (type) {
                            case "name":
                                return this.valueKeys[key].name;
                            case "unit":
                                return this.valueKeys[key].unit;
                        }
                    } else {
                        switch (type) {
                            case "name":
                                return key;
                            case "unit":
                                return "";
                        }
                    }
                },
                handleValue: function(value) {
                    let handler = this.valueKeys[value.name] ? this.valueKeys[value.name].handler : 'bypass';
                    return HamstroneApp.handler[handler](value.value);
                }
            },
            mounted: async function() {
                let val = await axios.get("./definition/value");
                HamstroneApp.app.valueKeys = val.data;
                let protoc = await axios.get("./definition/protocol");
                HamstroneApp.app.protocol = (protoc).data;
            },
        });
        this.ws = new WebSocket((location.protocol == "https:" ? "wss:" : "ws:") + "//" + document.location.host + "/ws");
        this.ws.onmessage = function(event) {
            let msgs = event.data.split("\n");
            if (msgs.length > 1) {
                for (m of msgs) {
                    HamstroneApp.parseMessage(JSON.parse(m));
                }
            } else {
                HamstroneApp.parseMessage(JSON.parse(msgs[0]));
            }
        }
    },
    parseMessage: function(msg) {
        switch (msg.type) {
            case "value":
                HamstroneApp.app.values.splice(0);
                for (d in msg.data) {
                    HamstroneApp.app.values.push({ name: d, value: msg.data[d] });
                }
                break;
            case "signal":
                HamstroneApp.app.signals.push({ time: new Date().toLocaleString(), noun: msg.data[0].noun, payload: msg.data[0].payload, strpayload: msg.data[1]});
                break;
        }
    },
    handler: {
        bypass: (input) => {
            return input;
        },
        itg3205_temp: (input) => {
            //return input;
            let exp = ((input & 0x7C00) >>> 10) - 15;
            let pre = (input & 0x03FF);
            let sign = (input & 0x8000) >>> 15;
            console.log(exp, pre, sign)
            return (Math.pow(2, exp) + (1 + pre / 1024)) * (sign === 0 ? 1 : -1);
            //return (input / 1708.475).toFixed(2);
        }
    }
}