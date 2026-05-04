#!/bin/bash
# Entrypoint для контейнера Smart Rent IRIS.
#
# Запускает оригинальный entrypoint образа в фоне, дожидается готовности IRIS,
# затем выполняет идемпотентный setup (namespace SMARTRENT, импорт классов,
# регистрация web-приложения, fixture-данные). После этого блокируется на
# процессе IRIS, чтобы контейнер продолжал работать.
#
# Setup делается в runtime, а не в docker build, потому что образ
# intersystemsdc/iris-community использует том /durable: если создавать БД
# во время build, mount пустого тома при старте контейнера их «скроет».

set -u

LOG="[smartrent-entrypoint]"
ORIG_ENTRYPOINT="/docker-entrypoint.sh"

if [[ ! -x "$ORIG_ENTRYPOINT" ]]; then
    for cand in /iris-main /opt/intersystems/iris/iris-main; do
        if [[ -x "$cand" ]]; then ORIG_ENTRYPOINT="$cand"; break; fi
    done
fi

echo "$LOG starting IRIS via $ORIG_ENTRYPOINT $*"

"$ORIG_ENTRYPOINT" "$@" &
IRIS_PID=$!

trap 'echo "$LOG forwarding signal to IRIS pid=$IRIS_PID"; kill -TERM $IRIS_PID 2>/dev/null || true' SIGTERM SIGINT

echo "$LOG waiting for IRIS to accept sessions…"
for i in $(seq 1 180); do
    if iris list 2>/dev/null | grep -qE "running|up"; then
        if iris session IRIS -U%SYS "set ^smartrent.ping=\$ZH halt" >/dev/null 2>&1; then
            echo "$LOG IRIS is up after ${i}s"
            break
        fi
    fi
    sleep 1
    if ! kill -0 "$IRIS_PID" 2>/dev/null; then
        echo "$LOG IRIS process died during startup, exiting"
        wait "$IRIS_PID"
        exit $?
    fi
done

echo "$LOG running Smart Rent setup (idempotent)…"
iris session IRIS -U%SYS "##class(SmartRent.Setup.Installer).RunAll() halt" \
    || echo "$LOG setup returned non-zero (see logs above)"

echo "$LOG handing control to IRIS process (pid=$IRIS_PID)"
wait "$IRIS_PID"
