type UUID = { uuid: number[] };

type TimeStamp = { sec: number; nanosec: number };

type Header = { stamp: TimeStamp; frame_id: string };

type Position = { x: number; y: number; z: number };
type Orientation = { x: number; y: number; z: number; w: number };
type Pose = { position: Position; orientation: Orientation };
type PoseStamped = { header: Header; pose: Pose };

type Duration = { sec: number; nanosec: number };

export type NavigateToPoseFeedback = {
  goal_id?: UUID;
  feedback: {
    current_pose?: PoseStamped;
    navigation_time?: Duration;
    estimated_time_remaining?: Duration;
    number_of_recoveries?: number;
    distance_remaining?: number;
  };
};

export type RobotStatus = "MOVING" | "SUCCEEDED" | "ABORTED" | "IDLE";

export type PanelConfig = {
  goalTopic: string;
  goalX: number;
  goalY: number;
  stopTopic: string;
};

export type Vector3 = { x: number; y: number; z: number };
export type Twist = { linear: Vector3; angular: Vector3 };
export type TwistStamped = { header: Header; twist: Twist };
export type CmdVelMessage = Twist | TwistStamped;

export const DEFAULT_CONFIG: PanelConfig = {
  goalTopic: "/clicked_point",
  goalX: 1.0,
  goalY: 1.0,
  stopTopic: "/cmd_vel",
};