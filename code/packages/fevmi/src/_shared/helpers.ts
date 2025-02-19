import { NID, FeNidGentrT } from './types.js';
import { nanoid } from 'nanoid/non-secure';

export const nidGentr: FeNidGentrT<number> = nanoid as FeNidGentrT<number>;