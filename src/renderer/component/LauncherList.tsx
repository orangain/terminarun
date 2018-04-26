import * as React from "react";
import { remote } from "electron";

import { Launcher, ProcessState } from "../models";
import "./LauncherList.scss";

export interface LauncherListProps {
    launchers: Launcher[];
    activeLauncherIndex: number;
    activate: (index: number) => any;
    removeLauncher: (index: number) => void;
}

export class LauncherList extends React.Component<LauncherListProps, {}> {

    constructor(props: LauncherListProps, context?: any) {
        super(props, context);
        this.showContextMenu = this.showContextMenu.bind(this);
    }

    showContextMenu(index: number, e: React.MouseEvent<HTMLLIElement>) {
        e.preventDefault();

        const Menu = remote.Menu;
        const MenuItem = remote.MenuItem;
        const menu = new Menu();
        menu.append(new MenuItem({
            label: '削除', click: () => {
                const launcherConfig = this.props.launchers[index].config;
                if (launcherConfig.name !== '' || launcherConfig.directory !== '' || launcherConfig.command !== '') {
                    if (!confirm(`本当に ${launcherConfig.name} を削除してもよろしいですか？`)) {
                        return; // do nothing
                    }
                }

                this.props.removeLauncher(index);
            }
        }));
        menu.popup(remote.getCurrentWindow());
    }

    render() {
        return (
            <ul className="list-group">
                {this.props.launchers.map((launcher, i) => {
                    return (
                        <li
                            key={launcher.key}
                            className={"list-group-item " + (
                                i == this.props.activeLauncherIndex
                                    ? "active"
                                    : "")
                            }
                            onClick={e => this.props.activate(i)}
                            onContextMenu={e => this.showContextMenu(i, e)}
                        >
                            <div className="media-body">
                                <h4>
                                    <span
                                        className={
                                            "icon icon-record " +
                                            (launcher.process.processState ===
                                                ProcessState.Running
                                                ? "running"
                                                : "stopped")
                                        }
                                    /> {launcher.config.name}
                                </h4>
                                <p>{launcher.config.directory}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }
}
