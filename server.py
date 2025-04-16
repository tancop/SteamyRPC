#!/usr/bin/env python

import asyncio
import json
import requests
import websockets
import secrets

from websockets.asyncio.server import serve

steam_socket = None
message_map = {}


def make_handler(rpc_secret: str):
    async def handler(websocket):
        global steam_socket

        async for message in websocket:
            if message == ("init:" + rpc_secret):
                if steam_socket:
                    print("SteamyRPC re-initialized!")
                else:
                    print("SteamyRPC initialized!")
                steam_socket = websocket
            elif message.startswith("init:"):
                print("Received bad init message")
            else:
                if websocket == steam_socket:
                    print("Received message from Steam:", message)

                    msg = json.loads(message)
                    id = msg["messageId"]

                    if id in message_map:
                        await message_map[id].send(json.dumps(msg))
                else:
                    msg = json.loads(message)
                    id = msg["messageId"]

                    message_map[id] = websocket

                    await steam_socket.send(
                        json.dumps(
                            {
                                "messageId": id,
                                "secret": rpc_secret,
                                "command": msg["command"],
                                "args": msg["args"],
                            }
                        )
                    )

                    print("Forwarded command to Steam:", message)

    return handler


def make_payload(port: int, rpc_secret: str):
    payload = ""
    with open("payload.template.js", "r") as file:
        for line in file.readlines():
            payload += line.replace(r"{{PORT}}", str(port)).replace(
                r"{{SECRET}}", rpc_secret
            )

        return payload


async def send_payload(debugger_url: str, payload: str):
    async with websockets.connect(debugger_url) as ws:
        msg_id = 1

        command = {
            "id": msg_id,
            "method": "Runtime.evaluate",
            "params": {"expression": payload, "awaitPromise": True},
        }

        await ws.send(json.dumps(command))

        print("Sent payload")


async def main():
    rpc_secret = secrets.token_urlsafe(16)
    port = 7355

    print("Starting SteamyRPC...")

    server = await serve(make_handler(rpc_secret), "", port)

    tabs = requests.get("http://localhost:8080/json").json()

    for tab in tabs:
        if tab["title"] == "SharedJSContext":
            debugger_url = tab["webSocketDebuggerUrl"]
            print("Sending payload to:", debugger_url)

            payload = make_payload(port, rpc_secret)

            await send_payload(debugger_url, payload)
            break

    await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
