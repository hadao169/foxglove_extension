import { PanelExtensionContext, MessageEvent, SettingsTreeAction } from "@foxglove/extension";
import { useEffect, useLayoutEffect, useState, useCallback, CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { NavigateToPoseFeedback, RobotStatus, PanelConfig, DEFAULT_CONFIG } from "./type";
import StatusLed from "./StatusLed";
import FeedbackMsg from "./Feedback";

function RobotControlPanel({ context }: { context: PanelExtensionContext }) {
  const [status, setStatus] = useState<RobotStatus>("IDLE");
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [config, setConfig] = useState<PanelConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...(context.initialState as Partial<PanelConfig>),
  }));
  const [feedback, setFeedback] = useState<NavigateToPoseFeedback>();

  useEffect(() => {
    context.saveState?.(config);
    context.advertise?.(config.goalTopic, "geometry_msgs/msg/PointStamped");
    context.advertise?.(config.stopTopic, "geometry_msgs/msg/TwistStamped");
    context.advertise?.(config.stopTopic, "");
    // subscribe to feedback/status and the configured stop topic (accepts Twist or TwistStamped at runtime)
    context.subscribe([
      { topic: "/navigate_to_pose/_action/feedback" },
      { topic: "/cmd_vel" },
      { topic: "/navigate_to_pose/_action/status" },
    ]);
  }, [context, config]);

  useEffect(() => {
    context.saveState(config);
    context.updatePanelSettingsEditor?.({
      nodes: {
        goalSettings: {
          label: "Goal Point Settings",
          fields: {
            goalTopic: { label: "Topic", input: "string", value: config.goalTopic },
            goalX: { label: "Goal X", input: "number", value: config.goalX, step: 0.1 },
            goalY: { label: "Goal Y", input: "number", value: config.goalY, step: 0.1 },
          },
        },
      },
      actionHandler: (action: SettingsTreeAction) => {
        if (action.action === "update") {
          const { path, value } = action.payload ? action.payload : (action as any);
          const field = path[1] as keyof PanelConfig;
          setConfig((prev) => ({ ...prev, [field]: value }));
        }
      },
    });
  }, [context, config]);

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      const messages = (renderState.currentFrame as MessageEvent[]) || [];

      const feedbackMsg = messages.filter((m) => m.topic === "/navigate_to_pose/_action/feedback");
      // const statusMsg = messages.filter((m) => m.topic === "/navigate_to_pose/_action/status");

      const cmdMsg = messages.filter((m) => m.topic === "/cmd_vel");
      const latestCmd = cmdMsg.length > 0 ? (cmdMsg[cmdMsg.length - 1]?.message as any) : undefined;

      if (latestCmd) {
        if(latestCmd.linear.x !== 0 || latestCmd.angular.z !== 0) {
          setStatus("MOVING");
         }
        else {
          setStatus("ABORTED");
        }
      }


      const lastestFeedback =
        feedbackMsg.length > 0 ? (feedbackMsg[feedbackMsg.length - 1]?.message as NavigateToPoseFeedback) : undefined;

      if (lastestFeedback) {
        setFeedback(lastestFeedback);
      }

      // const latestStatus =
      //   statusMsg.length > 0
      //     ? (statusMsg[statusMsg.length - 1]?.message as { status: number })
      //     : undefined;

      // if (latestStatus) {
      //   switch (latestStatus.status) {
      //     case 2:
      //       setStatus("MOVING");
      //       break;
      //     case 4:
      //       setStatus("SUCCEEDED");
      //       break;
      //     default:
      //       setStatus("IDLE");
      //   }
      // }
    };
    context.watch("currentFrame");
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  const sendGoalPoint = useCallback(() => {
    const stamp = { sec: 0, nanosec: 0 };
    context.publish?.(config.goalTopic, {
      header: { stamp: stamp, frame_id: "wgs84" },
      point: { x: config.goalX, y: config.goalY, z: 0.0 },
    });
  }, [context, config]);

  const sendStop = useCallback(() => {
    const stamp = { sec: 0, nanosec: 0 };
    context.publish?.(config.stopTopic, {
      header: { stamp: stamp, frame_id: "base_link" },
      twist: {
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      },
    });
  }, [context, config.stopTopic]);

  return (
    <div style={containerStyle}>
      <div>
        <h1 style={{ marginBottom: "20px" }}>Status</h1>
        <div style={statusBoxStyle}>
          <StatusLed label="On the way" active={status === "MOVING"} color="#3b82f6" />
          <StatusLed label="Arrived" active={status === "SUCCEEDED"} color="#22c55e" />
          <StatusLed label="Stopped" active={status === "ABORTED"} color="#ef4444" />
        </div>
      </div>

      <div>
        <FeedbackMsg feedback={feedback} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          className="rcp-btn"
          style={
            {
              ...btnBaseStyle,
              backgroundColor: "#2563eb",
              color: "white",
              ["--btn-accent" as any]: "#2563eb",
              ["--btn-color" as any]: "#ffffff",
            } as CSSProperties
          }
          onClick={sendGoalPoint}
        >
          Publish Goal ({config.goalX}, {config.goalY})
        </button>
        <button
          className="rcp-btn rcp-btn--outline"
          style={
            {
              ...btnBaseStyle,
              backgroundColor: "transparent",
              border: "2px solid #ef4444",
              color: "#ef4444",
              ["--btn-accent" as any]: "#ef4444",
              ["--btn-color" as any]: "#ef4444",
            } as CSSProperties
          }
          onClick={sendStop}
        >
          Emergency Stop
        </button>
      </div>
    </div>
  );
}

export function initRobotPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<RobotControlPanel context={context} />);
  return () => root.unmount();
}

const statusBoxStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  gap: "12px",
  backgroundColor: "#1e293b",
  padding: "12px 20px",
  borderRadius: "8px",
  border: "1px solid #475569",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
};

const btnBaseStyle: CSSProperties = {
  padding: "12px",
  borderRadius: "4px",
  fontWeight: "bold",
  textTransform: "uppercase",
  cursor: "pointer",
  border: "none",
  transition: "all 0.2s",
};

const containerStyle: CSSProperties = {
  padding: "10px",
  backgroundColor: "#0f172a",
  color: "white",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  fontFamily: "sans-serif",
  overflowY: "auto",
};
