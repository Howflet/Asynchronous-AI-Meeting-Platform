import { Server } from "socket.io";
export function createRealtime(server) {
    const io = new Server(server, {
        cors: { origin: process.env.CORS_ORIGIN?.split(",") || ["*"], credentials: true }
    });
    function emitUpdate(meetingId, event, payload) {
        io.to(`meeting:${meetingId}`).emit(event, payload);
    }
    io.on("connection", (socket) => {
        socket.on("join", (meetingId) => {
            socket.join(`meeting:${meetingId}`);
        });
    });
    return {
        io,
        emitUpdate,
        broadcastTurn: (meetingId, turn) => emitUpdate(meetingId, "turn", turn),
        broadcastWhiteboard: (meetingId, whiteboard) => emitUpdate(meetingId, "whiteboard", whiteboard),
        broadcastStatus: (meetingId, status, pauseReason) => emitUpdate(meetingId, "status", { status, pauseReason })
    };
}
