# InterSystems IRIS Community Edition.
# Бесплатная редакция (ограничение: 5 одновременных соединений, 10 ГБ данных).
# Для платной лицензии замените образ на:
#   FROM containers.intersystems.com/intersystems/iris:<version>
FROM intersystemsdc/iris-community:latest

USER root

# Каталог исходников ObjectScript.
COPY --chown=irisowner:irisowner src             /opt/smartrent/src
COPY --chown=irisowner:irisowner entrypoint.sh   /opt/smartrent/entrypoint.sh

# Принудительно убираем CRLF (если файл попал на Windows с autocrlf=true)
# и делаем исполняемым. Без этого "exec /opt/smartrent/entrypoint.sh: no such file"
# из-за shebang "#!/bin/bash\r".
RUN sed -i 's/\r$//' /opt/smartrent/entrypoint.sh \
 && chmod +x /opt/smartrent/entrypoint.sh

# Подмена ENTRYPOINT: ждём IRIS, идемпотентный setup, затем wait на процесс IRIS.
# Setup делается в runtime (не в build), потому что том /durable монтируется
# только при `docker run` и скрывает любые файлы, созданные на этапе build.
ENTRYPOINT ["/opt/smartrent/entrypoint.sh"]
CMD ["--check-caps", "false"]

USER irisowner

HEALTHCHECK --interval=15s --timeout=5s --retries=40 --start-period=120s \
  CMD curl -fsS http://localhost:52773/api/smartrent/v1/health || exit 1
