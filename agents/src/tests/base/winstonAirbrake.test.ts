import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { LogEntry } from "winston";

import { AirbrakeTransport } from "../../base/winstonAirbrake.js";

const originalProjectId = process.env.AIRBRAKE_PROJECT_ID;

const restoreProjectId = () => {
  if (originalProjectId === undefined) {
    delete process.env.AIRBRAKE_PROJECT_ID;
  } else {
    process.env.AIRBRAKE_PROJECT_ID = originalProjectId;
  }
};

const replaceNotifier = (
  transport: AirbrakeTransport,
  notifier: { notify: (payload: unknown) => Promise<unknown> }
) => {
  const realNotifier = Reflect.get(transport, "notifier") as {
    close?: () => void;
  };
  realNotifier.close?.();
  Reflect.set(transport, "notifier", notifier);
};

afterEach(() => {
  restoreProjectId();
});

describe("AirbrakeTransport", () => {
  it("maps log entries to Airbrake notifications and preserves metadata", async () => {
    process.env.AIRBRAKE_PROJECT_ID = "123";
    const transport = new AirbrakeTransport({
      projectId: 123,
      projectKey: "key",
      environment: "test",
    });
    const notifications: unknown[] = [];
    replaceNotifier(transport, {
      notify: async (payload: unknown) => {
        notifications.push(payload);
      },
    });

    let callbackCalled = false;
    transport.log(
      {
        level: "warn",
        message: "something happened",
        stack: "Error: from stack\n    at test",
        requestId: "request-1",
      } as LogEntry & { stack: string; requestId: string },
      () => {
        callbackCalled = true;
      }
    );

    assert.equal(callbackCalled, true);
    assert.equal(notifications.length, 1);
    assert.equal(
      (notifications[0] as { error: Error }).error.message,
      "something happened"
    );
    assert.equal(
      (notifications[0] as { context: { severity: string } }).context.severity,
      "warning"
    );
    assert.deepEqual((notifications[0] as { params: unknown }).params, {
      stack: "Error: from stack\n    at test",
      requestId: "request-1",
    });
  });

  it("ignores configured messages and disabled Airbrake environments", () => {
    const transport = new AirbrakeTransport({
      projectId: 123,
      projectKey: "key",
      ignoredErrorMessages: ["skip me"],
    });
    let notifyCalls = 0;
    replaceNotifier(transport, {
      notify: async () => {
        notifyCalls += 1;
      },
    });

    process.env.AIRBRAKE_PROJECT_ID = "123";
    transport.log({ level: "error", message: "skip me please" } as LogEntry, () => {
      // callback intentionally empty
    });

    delete process.env.AIRBRAKE_PROJECT_ID;
    transport.log({ level: "fatal", message: "send disabled" } as LogEntry, () => {
      // callback intentionally empty
    });

    assert.equal(notifyCalls, 0);
  });

  it("maps unknown log levels to info severity", () => {
    process.env.AIRBRAKE_PROJECT_ID = "123";
    const transport = new AirbrakeTransport({
      projectId: 123,
      projectKey: "key",
    });
    const notifications: unknown[] = [];
    replaceNotifier(transport, {
      notify: async (payload: unknown) => {
        notifications.push(payload);
      },
    });

    transport.log({ level: "debug", message: "debug message" } as LogEntry, () => {
      // callback intentionally empty
    });

    assert.equal(
      (notifications[0] as { context: { severity: string } }).context.severity,
      "info"
    );
  });

  it("uses Error instances directly and maps critical levels to error severity", () => {
    process.env.AIRBRAKE_PROJECT_ID = "123";
    const transport = new AirbrakeTransport({
      projectId: 123,
      projectKey: "key",
    });
    const notifications: unknown[] = [];
    replaceNotifier(transport, {
      notify: async (payload: unknown) => {
        notifications.push(payload);
      },
    });
    const error = Object.assign(new Error("direct error"), {
      level: "crit",
      requestId: "request-2",
    });

    transport.log(error as LogEntry & Error & { requestId: string }, () => {
      // callback intentionally empty
    });

    assert.equal((notifications[0] as { error: Error }).error, error);
    assert.equal(
      (notifications[0] as { context: { severity: string } }).context.severity,
      "error"
    );
  });

  it("logs Airbrake notification failures without interrupting Winston", async () => {
    process.env.AIRBRAKE_PROJECT_ID = "123";
    const transport = new AirbrakeTransport({
      projectId: 123,
      projectKey: "key",
    });
    replaceNotifier(transport, {
      notify: async () => {
        throw new Error("notify failed");
      },
    });
    const originalConsoleError = console.error;
    const consoleErrors: unknown[][] = [];
    console.error = (...args: unknown[]) => {
      consoleErrors.push(args);
    };
    let callbackCalled = false;

    try {
      transport.log({ level: "fatal", message: "fatal message" } as LogEntry, () => {
        callbackCalled = true;
      });
      await new Promise((resolve) => setImmediate(resolve));
    } finally {
      console.error = originalConsoleError;
    }

    assert.equal(callbackCalled, true);
    assert.equal(consoleErrors[0][0], "Airbrake notify failed:");
    assert.match((consoleErrors[0][1] as Error).message, /notify failed/);
  });
});
