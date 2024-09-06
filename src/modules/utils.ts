import { isProxy, toRaw } from 'vue';
import Encoding from 'encoding-japanese';

export const times = (count: number): number[] => {
  return [ ...Array(count) ].map((_: undefined, idx: number) => idx);
};

export function seq(first: number, last: number): number[] {
  return [ ...Array(last + 1 - first) ].map((_: undefined, idx: number) => idx + first);
};

export function generate<T>(count: number, generator: (idx: number) => T): T[] {
  return [ ...Array(count) ].map((_: undefined, idx: number) => generator(idx));
};

export function isEmptyLike(value: any) {
  if (value === undefined) return true;
  if (value === null) return true;
  if (typeof value === 'string') return (value.length === 0);
  return false;
}

export function min(...values: number[]) {
  let minValue = values[0];
  for (const value of values) {
    if (minValue > value) minValue = value;
  }
  return minValue;
}

export function max(...values: number[]) {
  let maxValue = values[0];
  for (const value of values) {
    if (maxValue < value) maxValue = value;
  }
  return maxValue;
}

export function clamp(x: number, min: number, max: number) {
  x = (x > max)? max : x;
  x = (x < min)? min : x;
  return x;
}

export function isInRect(rect: DOMRect, x: number, y: number) {
  if (rect.x > x) {
    return false;
  }
  if (rect.y > y) {
    return false;
  }
  if ((rect.x + rect.width) < x) {
    return false;
  }
  if ((rect.y + rect.height) < y) {
    return false;
  }
  return true;
}

export function calculateMinimumPowerOfTwoGreaterThanOrEqualTo(value: number) {
  if (value < 1) throw 'value less than 1 is not supported.';
  let powerOfTwo = 1;
  while (powerOfTwo < value) powerOfTwo *= 2;
  return powerOfTwo;
}

export function calculateMaximumPowerOfTwoLessThanOrEqualTo(value: number) {
  if (value < 1) throw 'value less than 1 is not supported.';
  let powerOfTwo = 1;
  while ((powerOfTwo * 2) <= value) powerOfTwo *= 2;
  return powerOfTwo;
}

export async function getFileInterface(accept?: string): Promise<File | undefined> {
  return new Promise((resolve, reject) => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.onchange = (event: Event) => {
      if (event.target === null) {
        reject(event);
      } else {
        const target = event.target as HTMLInputElement;
        resolve(target.files?.[0])
      }
    };
    if (accept !== undefined) inputElement.accept = accept;
    const windowFocusEventHandler = () => {
      const timeoutId = window.setTimeout(
        () => {
          window.removeEventListener('focus', windowFocusEventHandler);
          window.clearTimeout(timeoutId);
          resolve(undefined);
        },
        10000,
      );
    };
    window.addEventListener('focus', windowFocusEventHandler);
    inputElement.click();
  })
}

export async function loadFileAsUint8Array(file: File): Promise<Uint8Array | undefined> {
  const arrayBuffer = await new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event: ProgressEvent<FileReader>) => { resolve(event.target?.result) };
    fileReader.onabort = () => { reject() };
    fileReader.readAsArrayBuffer(file);
  })
  if (arrayBuffer === null) return undefined;
  return new Uint8Array(arrayBuffer as ArrayBuffer);
}

export async function loadFileAsUTF8Text(file: File) {
  const textUtf8Array = await loadFileAsUint8Array(file);
  if (textUtf8Array === undefined) return undefined;
  const textEncoding = Encoding.detect(textUtf8Array);
  if (!textEncoding) return undefined;
  const textUint8Array = new Uint8Array(Encoding.convert(textUtf8Array, 'UTF8', textEncoding));
  const textDecoder = new TextDecoder();
  return textDecoder.decode(textUint8Array.buffer);
}

export function downloadFile(fileName: string, text: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([ text ], { type: mimeType }));
  const anchor = document.createElement('a');
  document.body.appendChild(anchor);
  anchor.download = fileName;
  anchor.href = url;
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function assertDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    console.error(value);
    throw new TypeError();
  }
  return value;
}

export function raw<T>(value: T | ProxyConstructor): T {
  return <T> (isProxy(value)? toRaw(value) : value);
}