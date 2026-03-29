"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PHASES = exports.CurrentDevState = void 0;
var CurrentDevState;
(function (CurrentDevState) {
    CurrentDevState[CurrentDevState["IDLE"] = 0] = "IDLE";
    CurrentDevState[CurrentDevState["PHASE_GENERATING"] = 1] = "PHASE_GENERATING";
    CurrentDevState[CurrentDevState["PHASE_IMPLEMENTING"] = 2] = "PHASE_IMPLEMENTING";
    CurrentDevState[CurrentDevState["REVIEWING"] = 3] = "REVIEWING";
    CurrentDevState[CurrentDevState["FILE_REGENERATING"] = 4] = "FILE_REGENERATING";
    CurrentDevState[CurrentDevState["FINALIZING"] = 5] = "FINALIZING";
})(CurrentDevState || (exports.CurrentDevState = CurrentDevState = {}));
exports.MAX_PHASES = 10;
