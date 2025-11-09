type Broadcasters = {
  broadcastTurn: (meetingId: string, turn: unknown) => void;
  broadcastWhiteboard: (meetingId: string, whiteboard: unknown) => void;
  broadcastStatus: (meetingId: string, status: string, pauseReason?: string | null) => void;
};

const noop = () => {};
const state: Broadcasters = {
  broadcastTurn: noop,
  broadcastWhiteboard: noop,
  broadcastStatus: noop
};

export function setBroadcasters(b: Broadcasters) {
  state.broadcastTurn = b.broadcastTurn;
  state.broadcastWhiteboard = b.broadcastWhiteboard;
  state.broadcastStatus = b.broadcastStatus;
}

export function broadcastTurn(meetingId: string, turn: unknown) {
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

export function broadcastWhiteboard(meetingId: string, whiteboard: unknown) {
  state.broadcastWhiteboard(meetingId, whiteboard);
}

export function broadcastStatus(meetingId: string, status: string, pauseReason?: string | null) {
  state.broadcastStatus(meetingId, status, pauseReason);
}
