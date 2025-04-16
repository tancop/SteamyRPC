# SteamyRPC

## About

SteamyRPC is a small but powerful script that lets you control your Steam client with a WebSocket interface. Inspired by [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader).

## Installing

1. Install the [`websockets`](https://pypi.org/project/websockets/) Python package with uv or pip
2. Download a release zip and unpack anywhere you want
3. Create an empty file named `.cef-enable-remote-debugging` in `C:\Program Files (x86)\Steam` or `~/.steam/steam`
4. Open Steam
5. Run `server.py`

Repeat the last two steps any time you want to use SteamyRPC again.

## Connecting

You can connect to the server at `ws://[your ip]:7355`. All requests should be formatted like this:

```typescript
{
    messageId: number,
    command: string,
    args: object,
}
```

The type of `args` depends on what command you're calling. SteamyRPC will send back a WebSocket message with the message ID and return values (if any) to let you know it finished.

## Commands

### AddShortcut

Adds a shortcut (non-Steam game) to your library.

**Arguments:**

```typescript
{
    name: string, // game title
    exe: string, // path to the game executable
    launchOptions: string[], // launch options for the game
    icon: string, // path to the game icon (.jpg, .png, .exe, .ico)
}
```

**Returns**:

```typescript
{
    appId: number, // the new shortcut's app ID
}
```

### RemoveShortcut

Removes a shortcut from your library.

**Arguments:**

```typescript
{
    appId: number, // the removed shortcut's app ID
}
```

### InstallApp

Opens a dialog to install one or more apps. If you pass more than one ID Steam will show them in one dialog.

**Arguments:**

```typescript
{
    appIds: number[], // app IDs to be installed
}
```

### UninstallApp

Uninstalls one or more apps if `autoConfirm` is `true`, opens a uninstall dialog for them if it's `false`.

**Arguments:**

```typescript
{
    appIds: number[], // app IDs to be uninstalled
    autoConfirm: boolean, // uninstall without asking the user?
}
```
