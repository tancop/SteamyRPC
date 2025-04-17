(() => {
    if (window.rpc && window.rpc.readyState == WebSocket.OPEN) {
        if ($REPLACE) {
            console.log("Closing open socket");
            window.rpc.close();
        } else {
            console.log("Ignoring duplicate send");
            return;
        }
    }

    console.log("Opening new socket");

    let ws = new WebSocket("ws://localhost:$PORT");

    ws.addEventListener("message", async (event) => {
        let msg = JSON.parse(event.data);
        if (msg.secret === "$SECRET") {
            switch (msg.command) {
                case "AddShortcut":
                    let appId = await SteamClient.Apps.AddShortcut(msg.args.name, msg.args.exe, msg.args.launchOptions.join(" "), msg.args.exe);
                    await SteamClient.Apps.SetShortcutName(appId, msg.args.name);
                    await SteamClient.Apps.SetShortcutIcon(appId, msg.args.icon);
                    await SteamClient.Apps.SetShortcutStartDir(appId, msg.args.startDir);

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                        appId,
                    }));
                    break;
                case "RemoveShortcut":
                    await SteamClient.Apps.RemoveShortcut(msg.args.appId);

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                    }));
                    break;
                case "InstallApp":
                    await SteamClient.Installs.OpenInstallWizard(msg.args.appIds);

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                    }));
                    break;
                case "UninstallApp":
                    await SteamClient.Installs.OpenUninstallWizard(msg.args.appIds, msg.args.autoConfirm);

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                    }));
                    break;
                case "RunApp":
                    await SteamClient.Apps.RunGame(msg.args.appId.toString(), "", -1, 500);

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                    }));
                    break;
                case "TerminateApp":
                    await SteamClient.Apps.TerminateApp(msg.args.appId.toString(), false);

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                    }));
                    break;
                case "EnterGamepadUI":
                    await SteamClient.UI.SetUIMode(4);

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                    }));
                    break;
                case "ExitGamepadUI":
                    await SteamClient.UI.ExitBigPictureMode();

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                    }));
                    break;
                case "IsGamepadUI":
                    let mode = await SteamClient.UI.GetUIMode();

                    ws.send(JSON.stringify({
                        messageId: msg.messageId,
                        isGamepadUI: (mode === 4),
                    }));
                    break;
                default:
                    console.error("Invalid RPC command:", msg.command);
                    return;
            }
            console.log("Executed RPC command:", msg)
        } else {
            console.error("Refused unauthorized RPC command");
        }
    });

    ws.addEventListener("open", () => {
        ws.send("init:$SECRET");
    });

    window.rpc = ws;
})();