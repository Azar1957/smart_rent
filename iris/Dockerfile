# InterSystems IRIS Community Edition.
# Бесплатная редакция (ограничение: 5 одновременных соединений, 10 ГБ данных).
# Для платной лицензии замените образ на:
#   FROM containers.intersystems.com/intersystems/iris:<version>
FROM intersystemsdc/iris-community:latest

USER root

# Каталог исходников ObjectScript (классы импортируются скриптом ниже).
COPY --chown=irisowner:irisowner src       /opt/smartrent/src
COPY --chown=irisowner:irisowner iris.script /opt/smartrent/iris.script

USER irisowner

# Скрипт выполняется в %SYS при старте контейнера: создаёт namespace SMARTRENT,
# импортирует пакет SmartRent.*, регистрирует REST web-приложение, грузит демо-данные.
SHELL ["/bin/bash", "-c"]
RUN iris start IRIS quietly                                     \
 && iris session IRIS -U %SYS < /opt/smartrent/iris.script      \
 && iris stop  IRIS quietly

# Healthcheck по REST-эндпоинту платформы.
HEALTHCHECK --interval=15s --timeout=5s --retries=20 \
  CMD curl -fsS http://localhost:52773/api/smartrent/v1/health || exit 1
