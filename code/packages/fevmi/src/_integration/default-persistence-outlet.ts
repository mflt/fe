/*
import { _feIsObject, } from 'fe3/utils';
import { FePersistenceOutlet } from '../out-persistence/persistence.outlet.js';

declare namespace globalThis {
  var fePersistence: FePersistenceOutlet;
}

(function () {
  if (!('fePersistence' in globalThis && _feIsObject(globalThis.fePersistence))) {
    console.log(`[fevmi]: fePersistence global variable/store does no exist, creating. Its "factory defaults" will be in effect.`);
    globalThis.fePersistence = new FePersistenceOutlet();
  } else {
    console.log(`[fevmi]: Custom fePersistence global variable/store exists.`);
  }
})();
*/
