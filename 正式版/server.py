from __future__ import annotations

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8765
ROOT = Path(__file__).resolve().parent


class StarSproutHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main() -> int:
    os.chdir(ROOT)

    try:
        server = ThreadingHTTPServer((HOST, PORT), StarSproutHandler)
    except OSError as exc:
        print("")
        print("无法启动星芽岛本机服务器。")
        print(f"原因：{exc}")
        print("")
        print("请先关闭之前运行的服务器，再重新执行：python3 server.py")
        return 1

    print("")
    print("=" * 46)
    print(" 星芽岛 iPad 本机服务器")
    print("=" * 46)
    print("")
    print("请在 Safari 中打开：")
    print(f"http://{HOST}:{PORT}/index.html")
    print("")
    print("首次安装时请保持 a-Shell 在前台或分屏显示。")
    print("停止服务器：按 Control + C")
    print("")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止。")
    finally:
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
