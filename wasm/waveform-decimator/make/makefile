ifeq ($(OS),Windows_NT)
    MV_F = cmd /C move /Y
	RM_F = cmd /C del /F
	Path = $(subst /,\,$1)
else
    MV_F = mv -f
	RM_F = rm -f
	Path = $1
endif

install: ../waveform-decimator.wasm
	${MV_F} \
	$(call Path,../waveform-decimator.wasm) $(call Path,../../../public/wasm)
	${MV_F} \
	$(call Path,../waveform-decimator.d.ts) $(call Path,../../../src/modules)
	${MV_F} \
	$(call Path,../waveform-decimator.mjs) $(call Path,../../../src/modules)

build: ../waveform-decimator.wasm

../waveform-decimator.wasm: \
	$(call Path,../src/waveform_decimator.cpp) \
	$(call Path,../src/waveform_decimator_emscripten.cpp)
	em++ -Wall -Wextra -pedantic -std=c++17 -O2 \
	-s EXPORT_ES6=1 \
	-s USE_ES6_IMPORT_META=1 \
	-s MODULARIZE=1 \
	-s INITIAL_MEMORY=512MB \
	-s TOTAL_MEMORY=2048MB \
	-s ALLOW_MEMORY_GROWTH \
	-s EXPORT_ALL=1 \
	-s MALLOC=dlmalloc \
	-s EXPORTED_FUNCTIONS="['_malloc','_free']" \
	-lembind \
	--emit-tsd waveform-decimator.d.ts \
	-o $(call Path,../waveform-decimator.mjs) \
	$(call Path,../src/waveform_decimator.cpp) \
	$(call Path,../src/waveform_decimator_emscripten.cpp)

clean:
	${RM_F} \
	$(call Path,../waveform-decimator.mjs) \
	$(call Path,../waveform-decimator.d.ts) \
	$(call Path,../waveform-decimator.wasm)
