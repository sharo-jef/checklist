import { ChecklistCategory } from '@/types/checklist';

/**
 * 自家用車運転前チェックリスト
 */
export const checklistData: ChecklistCategory[] = [
  {
    id: 'predrive',
    title: 'PREDRIVE',
    checklists: [
      {
        id: 'predrive-check',
        name: 'PREDRIVE',
        phase: 'Pre-drive',
        items: [
          { id: 'pd-1', item: 'Parking brake', value: 'Set', completed: false, required: true },
          { id: 'pd-2', item: 'Master switch', value: 'CUTOFF', completed: false, required: true },
        ],
      },
    ],
  },
  {
    id: 'before-start',
    title: 'BEFORE START',
    checklists: [
      {
        id: 'before-start-check',
        name: 'BEFORE START',
        phase: 'Before Start',
        items: [
          { id: 'bs-1', item: 'Doors', value: 'LOCKED', completed: false, required: true },
          { id: 'bs-2', item: 'Mirrors', value: 'Set', completed: false, required: true },
          { id: 'bs-3', item: 'Belts', value: 'Set', completed: false, required: true },
        ],
      },
    ],
  },
  {
    id: 'before-departure',
    title: 'BEFORE DEPARTURE',
    checklists: [
      {
        id: 'before-departure-check',
        name: 'BEFORE DEPARTURE',
        phase: 'Before Departure',
        items: [
          { id: 'bd-1', item: 'Lights', value: 'AS REQUIRED', completed: false, required: true },
        ],
      },
    ],
  },
];
