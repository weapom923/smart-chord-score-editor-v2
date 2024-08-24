#include "./waveform_decimator.hpp"

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <cstdlib>
#include <cstdint>
#include <sstream>
#include <string>
#include <cstring>

auto generateDecimatedSampleData(
    std::uintptr_t deinterleavedFloatSampleBufferAddress,
    int numChannels,
    int numSamples)
{
    const std::float_t* deinterleavedFloatSampleBuffer = reinterpret_cast<const std::float_t*>(deinterleavedFloatSampleBufferAddress);
    const std::float_t** lpcmData = reinterpret_cast<const std::float_t**>(std::malloc(numChannels * sizeof(std::float_t*)));
    for (int channelIdx = 0; channelIdx < numChannels; ++channelIdx) {
        lpcmData[channelIdx] = deinterleavedFloatSampleBuffer + (numSamples * channelIdx);
    }

    auto outputStream = std::ostringstream();
    scse::waveform_decimator::generate(
        outputStream,
        lpcmData,
        static_cast<std::uint32_t>(numChannels),
        static_cast<std::uint32_t>(numSamples));
    std::free(reinterpret_cast<void*>(lpcmData));

    const auto outputBufferString = outputStream.str();
    const auto outputBufferSize = outputBufferString.size();
    void* outputBuffer = std::malloc(outputBufferSize * sizeof(std::uint8_t));
    std::memcpy(
        outputBuffer,
        outputBufferString.data(),
        outputBufferSize);
    return emscripten::val(emscripten::typed_memory_view(outputBufferSize, static_cast<std::uint8_t*>(outputBuffer)));
}

void releaseDecimatedSampleData(std::uintptr_t outputBufferAddress) {
    std::free(reinterpret_cast<void*>(outputBufferAddress));
}

EMSCRIPTEN_BINDINGS(myModule) {
    emscripten::function(
        "generateDecimatedSampleData",
        &generateDecimatedSampleData,
        emscripten::allow_raw_pointers()
    );
    emscripten::function(
        "releaseDecimatedSampleData",
        &releaseDecimatedSampleData,
        emscripten::allow_raw_pointers()
    );
}
