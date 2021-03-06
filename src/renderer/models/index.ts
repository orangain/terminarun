export enum ProcessState {
  Stopped = 0,
  Running,
  Failed,
  Stopping
}

export interface Launcher {
  key: number | undefined; // Unique key for react component
  config: LauncherConfig;
  process: LauncherProcess;
}

export interface LauncherConfig {
  name: string;
  directory: string;
  command: string;
}

export interface LauncherProcess {
  stdout: string;
  stderr: string;
  log: string;
  logElements: React.ReactNode[];
  processState: ProcessState;
  restarting: boolean;
}
