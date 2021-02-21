var HamstroneApp = {
  app: {},
  ws: {},
  init: function () {
    this.app = new Vue({
      el: "#app",
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
        onMenuClick: function (m) {
          this.currentPage = m.page;
        },
        findSignalNounString: function (noun) {
          for (n in this.protocol.SignalNoun) {
            if (this.protocol.SignalNoun[n] === noun) return n;
          }
          return noun;
        },
        findValueInfoString: function (key, type) {
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
        handleValue: function (value) {
          let handler = this.valueKeys[value.name]
            ? this.valueKeys[value.name].handler
            : "bypass";
          let handlerfunc =
            HamstroneApp.handler[handler] ?? HamstroneApp.handler["bypass"];
          return handlerfunc(value.value);
        },
      },
      mounted: async function () {
        let val = await axios.get("./definition/value");
        HamstroneApp.app.valueKeys = val.data;
        let protoc = await axios.get("./definition/protocol");
        HamstroneApp.app.protocol = protoc.data;
      },
    });
    this.ws = new WebSocket(
      (location.protocol == "https:" ? "wss:" : "ws:") +
        "//" +
        document.location.host +
        "/ws"
    );
    this.ws.onmessage = function (event) {
      let msgs = event.data.split("\n");
      if (msgs.length > 1) {
        for (m of msgs) {
          HamstroneApp.parseMessage(JSON.parse(m));
        }
      } else {
        HamstroneApp.parseMessage(JSON.parse(msgs[0]));
      }
    };
  },
  parseMessage: function (msg) {
    switch (msg.type) {
      case "value":
        HamstroneApp.app.values.splice(0);
        for (d in msg.data) {
          HamstroneApp.app.values.push({ name: d, value: msg.data[d] });
        }
        break;
      case "signal":
        HamstroneApp.app.signals.push({
          time: new Date().toLocaleString(),
          noun: msg.data[0].noun,
          payload: msg.data[0].payload,
          strpayload: msg.data[1],
        });
        setTimeout(() => {
          const div = document.getElementById("page-signal");
          if (div) div.scrollTop = div.scrollHeight;
        }, 100);
        break;
    }
  },
  handler: {
    bypass: (input) => {
      return input;
    },
    mpu6050_accel: (input) => {
      let buf = new ArrayBuffer(4);
      let dv = new DataView(buf);
      dv.setUint16(0, input);
      return (dv.getInt16(0) / 8191.5).toFixed(2);
    },
    mpu6050_gyro: (input) => {
      let buf = new ArrayBuffer(4);
      let dv = new DataView(buf);
      dv.setUint16(0, input);
      return (dv.getInt16(0) / 131.068).toFixed(2);
    },
    mpu6050_temp: (input) => {
      let buf = new ArrayBuffer(4);
      let dv = new DataView(buf);
      dv.setUint16(0, input);
      return (dv.getInt16(0) / 340 + 36.53).toFixed(2);
    },
    ms_to_hz: (input) => {
      return ((1 / input) * 1000).toFixed(2);
    },
  },
};
