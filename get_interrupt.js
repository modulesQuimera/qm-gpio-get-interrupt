module.exports = function(RED) {

    // "use strict";
    var mapeamentoNode;

    function get_interruptNode(config) {
        RED.nodes.createNode(this, config);
        this.serial = config.serial;
        this.serialConfig = RED.nodes.getNode(this.serial);
        this.mapeamento = config.mapeamento;
        this.compare_select = config.compare_select
        this.maxValue = config.maxValue;
        this.minValue = config.minValue;
 
        var node = this;
        mapeamentoNode = RED.nodes.getNode(this.mapeamento);

        node.on('input', function(msg, send, done) {

            var _compare = {};
            if (node.compare_select == "interval") {
                _compare = {
                    count: {">=": parseFloat(node.minValue), "<=": parseFloat(node.maxValue)}
                };
            }
            if (node.compare_select == "maxValue") {
                _compare = {
                    count: {">=": null, "<=": parseFloat(node.maxValue)}
                };
            }
            if (node.compare_select == "minValue") {
                _compare = {
                    count: {">=": parseFloat(node.minValue), "<=": null}
                };
            }

            var globalContext = node.context().global;
            var currentMode = globalContext.get("currentMode");
            var command = {
                type: "GPIO_modular_V1_0",
                slot: parseInt(mapeamentoNode.slot),
                method: "get_interrupt",
                compare: _compare,
                get_output: {}
            }
            var file = globalContext.get("exportFile");
            var slot = globalContext.get("slot");

            if(!(slot === "begin" || slot === "end")){
                if(currentMode == "test"){
                    file.slots[slot].jig_test.push(command);
                }
                else{
                    file.slots[slot].jig_error.push(command);
                }
            }
            else{
                if(slot === "begin"){
                    file.slots[0].jig_test.push(command);
                }
                else{
                    file.slots[3].jig_test.push(command);
                }
            }
            globalContext.set("exportFile", file);
            send(msg);
        });
    }

    RED.nodes.registerType("get_interrupt", get_interruptNode);
};