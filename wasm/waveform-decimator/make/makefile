ifeq ($(OS),Windows_NT)
    MV = cmd /C move /Y
	RM_F = cmd /C del /F
	Path = $(subst /,\,$1)
else
    MV = mv -f
	RM_F = rm -f
	Path = $1
endif

build: ../../../public/wasm/waveform-decimator.wasm

../../../public/wasm/waveform-decimator.wasm: \
	$(call Path,../src/waveform_decimator.cpp) \
	$(call Path,../src/waveform_decimator_emscripten.cpp) \
	$(call Path,../../../public/wasm)
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
	-o $(call Path,../../../src/modules/waveform-decimator.mjs) \
	$(call Path,../src/waveform_decimator.cpp) \
	$(call Path,../src/waveform_decimator_emscripten.cpp)
	${MV} \
	$(call Path,../../../src/modules/waveform-decimator.wasm) \
	$(call Path,../../../public/wasm/waveform-decimator.wasm)

../../../public/wasm:
	mkdir -p $(call Path,../../../public/wasm)

clean:
	${RM_F} \
	$(call Path,../../../src/modules/waveform-decimator.mjs) \
	$(call Path,../../../public/wasm/waveform-decimator.wasm)

