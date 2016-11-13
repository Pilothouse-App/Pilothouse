FROM alpine:latest

RUN apk add --no-cache --virtual .build-deps \
    build-base curl ruby-dev \

&& apk add --no-cache curl libstdc++ ruby ruby-json sqlite-dev \
&& gem install mailcatcher --no-ri --no-rdoc \

&& apk del .build-deps

EXPOSE 1025 1080

ENTRYPOINT [ "mailcatcher", "--foreground", "--ip=0.0.0.0" ]
