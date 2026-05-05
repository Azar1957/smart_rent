# InterSystems IRIS Community Edition.
# Бесплатная редакция (ограничение: 5 одновременных соединений, 10 ГБ данных).
# Для платной лицензии замените образ на:
#   FROM containers.intersystems.com/intersystems/iris:<version>
FROM intersystemsdc/iris-community:latest

USER root

# Каталог исходников ObjectScript (импортируется init-скриптом).
COPY --chown=irisowner:irisowner src   /opt/smartrent/src

# Init-скрипт. Базовый /docker-entrypoint.sh сам выполняет всё из
# /docker-entrypoint-initdb.d/*.sh ПОСЛЕ старта IRIS-инстанса.
COPY --chown=irisowner:irisowner init/01-smartrent-setup.sh \
     /docker-entrypoint-initdb.d/01-smartrent-setup.sh
COPY --chown=irisowner:irisowner init/diag.sh \
     /opt/smartrent/diag.sh
COPY --chown=irisowner:irisowner init/reinstall.sh \
     /opt/smartrent/reinstall.sh

# Принудительно убираем CRLF (если файл попал на Windows с autocrlf=true)
# и делаем исполняемым.
# Также готовим /durable: создаём с правильными правами, чтобы при первом
# монтировании пустого Docker volume он унаследовал права irisowner
# (Docker копирует initial state из образа в пустой volume).
RUN sed -i 's/\r$//' /docker-entrypoint-initdb.d/01-smartrent-setup.sh \
                     /opt/smartrent/diag.sh /opt/smartrent/reinstall.sh \
 && chmod +x /docker-entrypoint-initdb.d/01-smartrent-setup.sh \
             /opt/smartrent/diag.sh /opt/smartrent/reinstall.sh \
 && mkdir -p /durable/db /durable/journal \
 && chown -R irisowner:irisowner /durable /opt/smartrent

USER irisowner

# Healthcheck через wget (curl нет в базовом образе iris-community).
HEALTHCHECK --interval=15s --timeout=5s --retries=40 --start-period=180s \
  CMD wget -q -O - http://localhost:52773/api/smartrent/v1/health || exit 1
