import type { Server } from 'socket.io';

let _io: Server | null = null;

export function setIO(io: Server): void {
  _io = io;
}

/** Récupère l'instance Socket.io — doit être appelé après setIO() */
export function getIO(): Server {
  if (!_io) {
    throw new Error('Socket.io non initialisé — appeler setIO() au démarrage');
  }
  return _io;
}
