// src/projects/minimalEnerstaticNetwork/src/events/energyTransfer.ts
export type TransferFn = (from: any, to: any, amount: number) => void;

let listener: TransferFn | null = null;

export function setTransferListener(fn: TransferFn | null) {
  listener = fn;
}

export function clearTransferListener() {
  listener = null;
}

export function emitTransfer(from: any, to: any, amount: number) {
  if (listener && typeof amount === 'number' && amount > 0) {
    listener(from, to, amount);
  }
}