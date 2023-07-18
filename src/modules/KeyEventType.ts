export type KeyEventType = 'key'
  | 'key_with_ctrl'
  | 'key_with_ctrl_and_shift'
  | 'key_with_alt'
  | 'key_with_alt_and_shift'
  | 'key_with_shift'
  | 'repeated_key'
  | 'repeated_key_with_ctrl'
  | 'repeated_key_with_ctrl_and_shift'
  | 'repeated_key_with_alt'
  | 'repeated_key_with_alt_and_shift'
  | 'repeated_key_with_shift';

export function getKeyEventType(event: KeyboardEvent): KeyEventType {
  if (event.repeat) {
    if (event.ctrlKey) {
      return (event.shiftKey)? 'repeated_key_with_ctrl_and_shift' : 'repeated_key_with_ctrl';
    } else if (event.altKey) {
      return (event.shiftKey)? 'repeated_key_with_alt_and_shift' : 'repeated_key_with_alt';
    } else if (event.shiftKey) {
      return 'repeated_key_with_shift';
    } else {
      return 'repeated_key';
    }
  } else {
    if (event.ctrlKey) {
      return (event.shiftKey)? 'key_with_ctrl_and_shift' : 'key_with_ctrl';
    } else if (event.altKey) {
      return (event.shiftKey)? 'key_with_alt_and_shift' : 'key_with_alt';
    } else if (event.shiftKey) {
      return 'key_with_shift';
    } else {
      return 'key';
    }
  }
}
