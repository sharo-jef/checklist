import { ChecklistCategory, MenuType } from "@/types/checklist";

/**
 * 自家用車運転前チェックリスト
 */
export const checklistData: ChecklistCategory[] = [
  {
    id: "predrive",
    title: "PREDRIVE",
    menuType: MenuType.NORMAL,
    checklists: [
      {
        id: "predrive-check",
        name: "PREDRIVE",
        items: [
          {
            id: "pd-1",
            item: "Parking brake",
            value: "Set",
            required: true,
          },
          {
            id: "pd-2",
            item: "Gears",
            value: "N",
            required: true,
          },
          {
            id: "pd-3",
            item: "Master switch",
            value: "CUTOFF",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "before-start",
    title: "BEFORE START",
    menuType: MenuType.NORMAL,
    checklists: [
      {
        id: "before-start-check",
        name: "BEFORE START",
        items: [
          {
            id: "bs-1",
            item: "Doors",
            value: "LOCKED",
            required: true,
          },
          {
            id: "bs-2",
            item: "Mirrors",
            value: "Set",
            required: true,
          },
          {
            id: "bs-3",
            item: "Belts",
            value: "Set",
            required: true,
          },
          {
            id: "bs-4",
            item: "Master switch",
            value: "ACC",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "before-departure",
    title: "BEFORE DEPARTURE",
    menuType: MenuType.NORMAL,
    checklists: [
      {
        id: "before-departure-check",
        name: "BEFORE DEPARTURE",
        items: [
          {
            id: "bd-1",
            item: "Navigation",
            value: "AS REQUIRED",
            required: true,
          },
          {
            id: "bd-2",
            item: "Master switch",
            value: "ON",
            required: true,
          },
          {
            id: "bd-3",
            item: "Caution lights",
            value: "Clear",
            required: true,
          },
          {
            id: "bd-4",
            item: "Lights",
            value: "AUTO",
            required: true,
          },
          {
            id: "bd-5",
            item: "Roof",
            value: "AS REQUIRED",
            required: true,
          },
          {
            id: "bd-6",
            item: "Room lamp",
            value: "AUTO",
            required: true,
          },
          {
            id: "bd-7",
            item: "Parking brake",
            value: "Release",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "parking",
    title: "PARKING",
    menuType: MenuType.NORMAL,
    checklists: [
      {
        id: "parking-check",
        name: "PARKING",
        items: [
          {
            id: "pk-1",
            item: "Gears",
            value: "N",
            required: true,
          },
          {
            id: "pk-2",
            item: "Parking brake",
            value: "Set",
            required: true,
          },
          {
            id: "pk-3",
            item: "Roof",
            value: "CLOSED & LOCKED",
            required: true,
          },
          {
            id: "pk-4",
            item: "Doors",
            value: "UNLOCKED",
            required: true,
          },
          {
            id: "pk-5",
            item: "Windows",
            value: "CLOSED",
            required: true,
          },
          {
            id: "pk-6",
            item: "Seat heaters",
            value: "OFF",
            required: true,
          },
          {
            id: "pk-7",
            item: "Master switch",
            value: "CUTOFF",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "secure",
    title: "SECURE",
    menuType: MenuType.NORMAL,
    checklists: [
      {
        id: "secure-check",
        name: "SECURE",
        items: [
          {
            id: "sc-1",
            item: "ETC card",
            value: "REMOVED",
            required: true,
          },
          {
            id: "sc-2",
            item: "Room lamp",
            value: "AUTO",
            required: true,
          },
          {
            id: "sc-3",
            item: "Doors",
            value: "LOCKED",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "accident",
    title: "ACCIDENT",
    menuType: MenuType.NON_NORMAL,
    checklists: [
      {
        id: "accident-check",
        name: "ACCIDENT",
        items: [
          {
            id: "ac-1",
            item: "Call ambulance",
            value: "AS REQUIRED",
            required: false,
          },
          {
            id: "ac-2",
            item: "Call police",
            value: "AS REQUIRED",
            required: false,
          },
          {
            id: "ac-3",
            item: "Call dealer",
            value: "AS REQUIRED",
            required: false,
          },
          {
            id: "ac-4",
            item: "Call insurer",
            value: "AS REQUIRED",
            required: false,
          },
        ],
      },
    ],
  },
];
