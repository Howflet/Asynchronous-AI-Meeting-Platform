const noop = () => { };
const state = {
    broadcastTurn: noop,
    broadcastWhiteboard: noop,
    broadcastStatus: noop
};
export function setBroadcasters(b) {
    state.broadcastTurn = b.broadcastTurn;
    state.broadcastWhiteboard = b.broadcastWhiteboard;
    state.broadcastStatus = b.broadcastStatus;
}
export function broadcastTurn(meetingId, turn) {
    // Clean speaker names by removing AI:/Human: prefixes before broadcasting
    const cleanTurn = turn && typeof turn === 'object' && 'speaker' in turn
        ? {
            ...turn,
            speaker: typeof turn.speaker === 'string'
                ? turn.speaker.replace(/^(AI:|Human:)\s*/, '').trim() || turn.speaker
                : turn.speaker
        }
        : turn;
    state.broadcastTurn(meetingId, cleanTurn);
}
export function broadcastWhiteboard(meetingId, whiteboard) {
    state.broadcastWhiteboard(meetingId, whiteboard);
}
export function broadcastStatus(meetingId, status, pauseReason) {
    state.broadcastStatus(meetingId, status, pauseReason);
}
