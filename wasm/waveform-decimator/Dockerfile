FROM emscripten/emsdk:3.1.67 AS build

WORKDIR /home

COPY make/ ./make

COPY src/ ./src

RUN npm install -g typescript@5.5.4

RUN make -C ./make build

FROM scratch

COPY --from=build /home/waveform-decimator.d.ts .

COPY --from=build /home/waveform-decimator.mjs .

COPY --from=build /home/waveform-decimator.wasm .
