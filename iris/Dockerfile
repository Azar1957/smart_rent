# InterSystems IRIS Community Edition.
# Бесплатная редакция (ограничение: 5 одновременных соединений, 10 ГБ данных).
# Для платной лицензии замените образ на:
#   FROM containers.intersystems.com/intersystems/iris:<version>
FROM intersystemsdc/iris-community:latest

USER root

# Каталог исходников ObjectScript.
COPY --chown=irisowner:irisowner src             /opt/smartrent/src
COPY --chown=irisowner:irisowner entrypoint.sh   /opt/smartrent/entrypoint.sh

RUN chmod +x /opt/smartrent/entrypoint.sh

# Подмена ENTRYPOINT: сначала ждём IRIS, затем идемпотентный setup,
# потом контейнер живёт обычной жизнью.
# Setup делается в runtime, а не в build, потому что том /durable монтируется
# только при `docker run` и скрывает любые файлы, созданные на этапе build.
ENTRYPOINT ["/opt/smartrent/entrypoint.sh"]
CMD ["--check-caps", "false"]

USER irisowner

HEALTHCHECK --interval=15s --timeout=5s --retries=40 --start-period=120s \
  CMD curl -fsS http://localhost:52773/api/smartrent/v1/health || exit 1
