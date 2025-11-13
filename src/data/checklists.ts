import { ChecklistCategory } from '@/types/checklist';

/**
 * B747-8i デジタルチェックリスト サンプルデータ
 * 実際の航空機運用手順を参考にしたチェックリスト
 */
export const checklistData: ChecklistCategory[] = [
  {
    id: 'passenger-signs',
    title: 'Passenger signs',
    checklists: [
      {
        id: 'preflight-signs',
        name: 'Pre-flight Signs Check',
        phase: 'Pre-flight',
        items: [
          { id: 'ps-1', text: 'SEAT BELTS sign.................ON', completed: false, required: true },
          { id: 'ps-2', text: 'NO SMOKING sign.................ON', completed: false, required: true },
          { id: 'ps-3', text: 'RETURN TO SEAT sign...........AUTO', completed: false },
          { id: 'ps-4', text: 'Emergency lights...............ARMED', completed: false, required: true },
        ],
      },
    ],
  },
  {
    id: 'electrical',
    title: 'Electrical',
    checklists: [
      {
        id: 'electrical-power',
        name: 'Electrical Power Setup',
        phase: 'Pre-flight',
        items: [
          { id: 'el-1', text: 'Battery switch..................ON', completed: false, required: true },
          { id: 'el-2', text: 'External power.............AVAILABLE', completed: false },
          { id: 'el-3', text: 'APU generator switches..........ON', completed: false },
          { id: 'el-4', text: 'Bus tie switches..............AUTO', completed: false, required: true },
          { id: 'el-5', text: 'Generator drive switches........ON', completed: false, required: true },
          { id: 'el-6', text: 'Standby power...............NORMAL', completed: false, required: true },
        ],
      },
    ],
  },
  {
    id: 'fuel',
    title: 'Fuel',
    checklists: [
      {
        id: 'fuel-check',
        name: 'Fuel System Check',
        phase: 'Pre-flight',
        items: [
          { id: 'fu-1', text: 'Fuel quantity..............CHECKED', completed: false, required: true },
          { id: 'fu-2', text: 'Fuel pumps......................ON', completed: false, required: true },
          { id: 'fu-3', text: 'Crossfeed valves.............CLOSED', completed: false, required: true },
          { id: 'fu-4', text: 'Fuel temperature............NORMAL', completed: false },
          { id: 'fu-5', text: 'Fuel balance.................NORMAL', completed: false },
        ],
      },
    ],
  },
  {
    id: 'hydraulics',
    title: 'Hydraulics',
    checklists: [
      {
        id: 'hydraulic-systems',
        name: 'Hydraulic Systems',
        phase: 'Pre-flight',
        items: [
          { id: 'hy-1', text: 'Engine hydraulic pumps..........ON', completed: false, required: true },
          { id: 'hy-2', text: 'Electric hydraulic pumps.......OFF', completed: false, required: true },
          { id: 'hy-3', text: 'Hydraulic quantity..........NORMAL', completed: false, required: true },
          { id: 'hy-4', text: 'Hydraulic pressure..........NORMAL', completed: false, required: true },
        ],
      },
    ],
  },
  {
    id: 'flight-controls',
    title: 'Flight Controls',
    checklists: [
      {
        id: 'control-check',
        name: 'Flight Control Check',
        phase: 'Pre-flight',
        items: [
          { id: 'fc-1', text: 'Yaw damper......................ON', completed: false, required: true },
          { id: 'fc-2', text: 'Flight controls..............FREE', completed: false, required: true },
          { id: 'fc-3', text: 'Aileron trim.................ZERO', completed: false, required: true },
          { id: 'fc-4', text: 'Rudder trim..................ZERO', completed: false, required: true },
          { id: 'fc-5', text: 'Stabilizer trim..........SET TAKEOFF', completed: false, required: true },
          { id: 'fc-6', text: 'Flaps.......................SET', completed: false, required: true },
          { id: 'fc-7', text: 'Speedbrakes................RETRACTED', completed: false, required: true },
        ],
      },
    ],
  },
  {
    id: 'engines',
    title: 'Engines',
    checklists: [
      {
        id: 'engine-start',
        name: 'Engine Start Procedure',
        phase: 'Engine Start',
        items: [
          { id: 'en-1', text: 'Beacon light....................ON', completed: false, required: true },
          { id: 'en-2', text: 'Engine start switches........GROUND', completed: false, required: true },
          { id: 'en-3', text: 'APU bleed......................ON', completed: false },
          { id: 'en-4', text: 'Engine 4 start lever.........IDLE', completed: false, required: true },
          { id: 'en-5', text: 'N2 rotation...............CONFIRMED', completed: false, required: true },
          { id: 'en-6', text: 'Engine 4 parameters.........NORMAL', completed: false, required: true },
          { id: 'en-7', text: 'Engine 3 start lever.........IDLE', completed: false, required: true },
          { id: 'en-8', text: 'Engine 3 parameters.........NORMAL', completed: false, required: true },
          { id: 'en-9', text: 'Engine 2 start lever.........IDLE', completed: false, required: true },
          { id: 'en-10', text: 'Engine 2 parameters.........NORMAL', completed: false, required: true },
          { id: 'en-11', text: 'Engine 1 start lever.........IDLE', completed: false, required: true },
          { id: 'en-12', text: 'Engine 1 parameters.........NORMAL', completed: false, required: true },
        ],
      },
      {
        id: 'after-start',
        name: 'After Start',
        phase: 'Engine Start',
        items: [
          { id: 'as-1', text: 'APU bleed.....................OFF', completed: false },
          { id: 'as-2', text: 'Engine start switches.........AUTO', completed: false, required: true },
          { id: 'as-3', text: 'Generator switches..............ON', completed: false, required: true },
          { id: 'as-4', text: 'Probe heat.....................ON', completed: false, required: true },
          { id: 'as-5', text: 'Anti-ice..................AS REQUIRED', completed: false },
        ],
      },
    ],
  },
  {
    id: 'before-taxi',
    title: 'Before Taxi',
    checklists: [
      {
        id: 'taxi-prep',
        name: 'Taxi Preparation',
        phase: 'Before Taxi',
        items: [
          { id: 'bt-1', text: 'Flight controls..............CHECKED', completed: false, required: true },
          { id: 'bt-2', text: 'Trim settings................CHECKED', completed: false, required: true },
          { id: 'bt-3', text: 'Transponder....................ON', completed: false, required: true },
          { id: 'bt-4', text: 'Recalls......................CHECKED', completed: false, required: true },
          { id: 'bt-5', text: 'Autobrake.......................RTO', completed: false, required: true },
          { id: 'bt-6', text: 'Ground equipment.............CLEAR', completed: false, required: true },
        ],
      },
    ],
  },
  {
    id: 'before-takeoff',
    title: 'Before Takeoff',
    checklists: [
      {
        id: 'takeoff-prep',
        name: 'Takeoff Preparation',
        phase: 'Before Takeoff',
        items: [
          { id: 'to-1', text: 'Cabin.....................SECURED', completed: false, required: true },
          { id: 'to-2', text: 'Flight attendants............SEATED', completed: false, required: true },
          { id: 'to-3', text: 'Flaps......................SET', completed: false, required: true },
          { id: 'to-4', text: 'Stabilizer trim.............SET', completed: false, required: true },
          { id: 'to-5', text: 'Takeoff data...............VERIFIED', completed: false, required: true },
          { id: 'to-6', text: 'Autobrake.......................RTO', completed: false, required: true },
          { id: 'to-7', text: 'Strobe lights...................ON', completed: false, required: true },
          { id: 'to-8', text: 'Runway......................CLEAR', completed: false, required: true },
        ],
      },
    ],
  },
];
