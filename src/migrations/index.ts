import * as migration_20250916_020349 from './20250916_020349';
import * as migration_20250917_105142 from './20250917_105142';

export const migrations = [
  {
    up: migration_20250916_020349.up,
    down: migration_20250916_020349.down,
    name: '20250916_020349',
  },
  {
    up: migration_20250917_105142.up,
    down: migration_20250917_105142.down,
    name: '20250917_105142'
  },
];
