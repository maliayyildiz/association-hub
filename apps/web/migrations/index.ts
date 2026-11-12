import * as migration_20261112_213720_initial from './20261112_213720_initial';

export const migrations = [
  {
    up: migration_20261112_213720_initial.up,
    down: migration_20261112_213720_initial.down,
    name: '20261112_213720_initial'
  },
];
