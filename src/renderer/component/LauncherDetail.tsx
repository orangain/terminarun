import * as React from "react";

import { Launcher, ProcessState, LauncherConfig } from "../models";

import "./LauncherDetail.scss";

export interface LauncherDetailProps {
  launcher: Launcher;
  startScript: (launcher: Launcher) => any;
  stopScript: (launcher: Launcher, restart?: boolean) => any;
  restartScript: (launcher: Launcher) => any;
  updateLauncherConfig: (launcher: Launcher, config: LauncherConfig) => any;
}

export interface LauncherDetailState {
  isEditing: boolean;
  unsavedName: string;
  unsavedDirectory: string;
  unsavedCommand: string;
}

export class LauncherDetail extends React.Component<
  LauncherDetailProps,
  LauncherDetailState
> {
  state = {
    isEditing: false,
    unsavedName: "",
    unsavedDirectory: "",
    unsavedCommand: ""
  };
  directoryInput: HTMLInputElement | null = null;
  logElement: HTMLDivElement | null = null;
  scrollFromBottom: number | undefined;

  constructor(props: LauncherDetailProps, context?: any) {
    super(props, context);
    this.setLogElementRef = this.setLogElementRef.bind(this);
    this.scrollLogBottomIfNeeded = this.scrollLogBottomIfNeeded.bind(this);
    this.beginEdit = this.beginEdit.bind(this);
    this.endEdit = this.endEdit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.updateDirectoryInput = this.updateDirectoryInput.bind(this);
    this.openDirectoryDialog = this.openDirectoryDialog.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDirectoryChange = this.handleDirectoryChange.bind(this);
    this.handleDirectorySelect = this.handleDirectorySelect.bind(this);
    this.handleCommandChange = this.handleCommandChange.bind(this);
  }

  componentWillReceiveProps(nextProps: LauncherDetailProps) {
    if (nextProps.launcher.key !== this.props.launcher.key) {
      // Reset edit state
      const isNew = nextProps.launcher.config.name === "";
      this.setState(
        Object.assign({}, this.state, {
          isEditing: isNew,
          unsavedName: nextProps.launcher.config.name,
          unsavedDirectory: nextProps.launcher.config.directory,
          unsavedCommand: nextProps.launcher.config.command
        })
      );
    }
  }

  componentWillUpdate(
    nextProps: Readonly<LauncherDetailProps>,
    nextState: Readonly<LauncherDetailState>,
    nextContext: any
  ) {
    if (this.logElement === null) {
      return;
    }

    this.scrollFromBottom =
      this.logElement.scrollHeight -
      this.logElement.scrollTop -
      this.logElement.clientHeight;
    // console.log(this.scrollFromBottom);
  }

  componentDidUpdate(
    prevProps: Readonly<LauncherDetailProps>,
    prevState: Readonly<LauncherDetailState>,
    prevContext: any
  ) {
    if (this.props.launcher.process.log === prevProps.launcher.process.log) {
      return;
    }

    this.scrollLogBottomIfNeeded();
  }

  setLogElementRef(element: HTMLDivElement) {
    this.logElement = element;
  }

  scrollLogBottomIfNeeded() {
    if (
      this.logElement === null ||
      this.scrollFromBottom === undefined ||
      this.scrollFromBottom > 10
    ) {
      return;
    }

    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  beginEdit() {
    this.setState(
      Object.assign({}, this.state, {
        isEditing: true,
        unsavedName: this.props.launcher.config.name,
        unsavedDirectory: this.props.launcher.config.directory,
        unsavedCommand: this.props.launcher.config.command
      })
    );
  }

  endEdit() {
    this.setState(
      Object.assign({}, this.state, {
        isEditing: false
      })
    );

    const launcher = this.props.launcher;
    this.props.updateLauncherConfig(
      launcher,
      Object.assign({}, launcher.config, {
        name: this.state.unsavedName,
        directory: this.state.unsavedDirectory,
        command: this.state.unsavedCommand
      })
    );
  }

  cancelEdit() {
    this.setState(
      Object.assign({}, this.state, {
        isEditing: false
      })
    );
  }

  updateDirectoryInput(input: HTMLInputElement | null) {
    this.directoryInput = input;
    if (input !== null) {
      // Set attribute here because setting webkitdirectory attribute in JSX causes TypeScript error.
      input.webkitdirectory = true;
    }
  }

  openDirectoryDialog() {
    (this.directoryInput as HTMLInputElement).click();
  }

  handleNameChange(e: any) {
    this.setState(
      Object.assign({}, this.state, {
        unsavedName: e.target.value
      })
    );
  }

  handleDirectoryChange(e: any) {
    this.setState(
      Object.assign({}, this.state, {
        unsavedDirectory: e.dataTransfer
          ? e.dataTransfer.files[0].path
          : e.target.value
      })
    );
  }

  handleDirectorySelect(e: any) {
    const files = (this.directoryInput as HTMLInputElement).files;
    if (files !== null && files.length > 0) {
      let path = files[0].path;
      if (process.env.HOME && path.startsWith(process.env.HOME)) {
        path = "~" + path.slice(process.env.HOME.length);
      }
      this.setState(
        Object.assign({}, this.state, {
          unsavedDirectory: path
        })
      );
    }
  }

  handleCommandChange(e: any) {
    this.setState(
      Object.assign({}, this.state, {
        unsavedCommand: e.target.value
      })
    );
  }

  render() {
    const actionButtons = (processState: ProcessState) => {
      switch (processState) {
        case ProcessState.Stopped:
        case ProcessState.Failed:
          return (
            <button
              type="button"
              className="btn btn-positive"
              onClick={e => this.props.startScript(this.props.launcher)}
            >
              <span className="icon icon-play" /> 開始
            </button>
          );
        case ProcessState.Running:
          return (
            <span>
              <button
                type="button"
                className="btn btn-negative"
                onClick={e => this.props.stopScript(this.props.launcher)}
              >
                <span className="icon icon-stop" /> 停止
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={e => this.props.restartScript(this.props.launcher)}
              >
                <span className="icon icon-cw" /> 再起動
              </button>
            </span>
          );
        default:
          return null;
      }
    };

    return (
      <div className="launcher-detail">
        {this.state.isEditing ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              this.endEdit();
            }}
          >
            <div className="form-group">
              <label>名前</label>
              <input
                autoFocus
                className="form-control"
                value={this.state.unsavedName}
                onChange={this.handleNameChange}
              />
            </div>
            <div className="form-group">
              <label>ディレクトリ</label>
              <input
                className="form-control"
                value={this.state.unsavedDirectory}
                onChange={this.handleDirectoryChange}
              />
              <button
                className="btn btn-default"
                type="button"
                onClick={this.openDirectoryDialog}
              >
                ...
              </button>
              <input
                style={{ display: "none" }}
                type="file"
                ref={this.updateDirectoryInput}
                onChange={this.handleDirectorySelect}
              />
            </div>
            <div className="form-group">
              <label>コマンド</label>
              <textarea
                className="form-control"
                value={this.state.unsavedCommand}
                onChange={this.handleCommandChange}
              />
            </div>
            <button className="btn btn-primary">保存</button>{" "}
            <button
              className="btn btn-default"
              type="button"
              onClick={this.cancelEdit}
            >
              キャンセル
            </button>
          </form>
        ) : (
          <div className="launcher-detail-container">
            <div>
              <h3>{this.props.launcher.config.name}</h3>
              <div>{this.props.launcher.config.directory}</div>
              <div>
                <code>{this.props.launcher.config.command}</code>
              </div>
              <button className="btn btn-default" onClick={this.beginEdit}>
                <span className="icon icon-pencil" /> 編集
              </button>
              <div>
                {actionButtons(this.props.launcher.process.processState)}
              </div>
              log
            </div>
            <div className="log" ref={this.setLogElementRef}>
              {this.props.launcher.process.log}
            </div>
          </div>
        )}
      </div>
    );
  }
}
